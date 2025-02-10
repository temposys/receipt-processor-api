const request = require('supertest');
const app = require('../app');

let server;

beforeAll(() => {
    const port = 5090;
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
                purchaseDate: "2022-01-01",
                purchaseTime: "13:01",
                total: "35.35",
                items: [{ shortDescription: "Item1", price: "35.35" }],
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("id");
    });

    it("should return 400 if receipt data is invalid", async () => {
        const requestBody = {
            purchaseDate: "2022-01-99 52:20",
            purchaseTime: "33:99",
            total: "35.35",
            items: [],
        };

        const res = await request(server).post("/receipts/process").send(requestBody);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("The receipt is invalid.");
    });
});
