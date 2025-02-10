const request = require('supertest');
const app = require('../../app');

let server;

beforeAll(() => {
    const port = process.env.PORT || 5090;
    server = app.listen(port, () => {
        console.log(`Test server running on port ${port}`);
    });
});

afterAll((done) => {
    server.close(done);
});

describe("POST /receipts/process", () => {
    it("should return 200 with valid receipt", async () => {
        const res = await request(server)
            .post("/receipts/process")
            .send({
                retailer: "Test",
                purchaseDate: "2025-01-01",
                purchaseTime: "13:01",
                total: "35.35",
                items: [{ shortDescription: "Item1", price: "35.35" }],
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
    });

    it("should return 400 if purchaseDate is invalid", async () => {
        const requestBody = {
            retailer: "Test",
            purchaseDate: "2025-01-99", // wrong date
            purchaseTime: "15:03",
            total: "20.00",
            items: [{ shortDescription: "Item1", price: "20.00" }],
        };

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });

    it("should return 400 if purchaseTime is invalid", async () => {
        const requestBody = {
            retailer: "Test",
            purchaseDate: "2025-01-01",
            purchaseTime: "33:99", // wrong time
            total: "20.00",
            items: [{ shortDescription: "Item1", price: "20.00" }],
        };

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });

    it("should return 400 if total does not match the sum of items", async () => {
        const requestBody = {
            retailer: "Test",
            purchaseDate: "2025-01-01",
            purchaseTime: "15:03",
            total: "40.00", // total is wrong
            items: [
                { shortDescription: "Item1", price: "20.00" },
                { shortDescription: "Item2", price: "10.00" },
            ],
        };

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });

    it("should return 400 if no items", async () => {
        const requestBody = {
            retailer: "Test",
            purchaseDate: "2025-01-01",
            purchaseTime: "15:03",
            total: "0.00",
            items: [], // no items
        };

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });

    it("should return 400 if missing retailer", async () => {
        const requestBody = {
            purchaseDate: "2025-01-01",
            purchaseTime: "15:03",
            total: "40.15",
            items: [{ shortDescription: "Item1", price: "40.15" }],
        };

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });

    it("should return 400 if empty request", async () => {
        const requestBody = {};

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });
});

describe("GET /receipts/:id/points", () => {
    let receiptId1;
    let receiptId2;

    beforeAll(async () => {
        // case 1
        let res = await request(server)
            .post("/receipts/process")
            .send({
                retailer: "Test Store",
                purchaseDate: "2025-01-01",
                purchaseTime: "15:03",
                total: "35.00",
                items: [
                    { shortDescription: "Item1", price: "10.00" },
                    { shortDescription: "Item2", price: "10.00" },
                    { shortDescription: "Item31", price: "15.00" },
                ],
            });
        receiptId1 = res.body.id; // Save Receipt ID which we will test
        // case 2
        res = await request(server)
            .post("/receipts/process")
            .send({
                retailer: "& -",
                purchaseDate: "2025-01-02",
                purchaseTime: "13:03",
                total: "35.30",
                items: [
                    { shortDescription: "Item1", price: "10.00" },
                    { shortDescription: "Item2", price: "10.00" },
                    { shortDescription: "Item3", price: "15.30" },
                ],
            });
        receiptId2 = res.body.id; // Save Receipt ID which we will test
    });

    it("should return points for a valid receipt (case 1)", async () => {
        const res = await request(server).get(`/receipts/${receiptId1}/points`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("points");
        expect(res.body.points).toBe(108);
    });

    it("should return points for a valid receipt (case 2)", async () => {
        const res = await request(server).get(`/receipts/${receiptId2}/points`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("points");
        expect(res.body.points).toBe(5);
    });

    it("should return 404 if receipt not found", async () => {
        const invalidId = "834ce6ea-6e14-4738-b97e-18965bcfadd4";
        const res = await request(server).get(`/receipts/${invalidId}/points`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("No receipt found for that ID.");
    });
});
