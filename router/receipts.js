const express = require('express');
const { body, validationResult } = require('express-validator');
const { randomUUID } = require('crypto');
const routes = express.Router();

let receipts = [];

// Receipt example
// {
//     "retailer": "Walgreens",
//     "purchaseDate": "2022-01-02",
//     "purchaseTime": "08:13",
//     "total": "2.65",
//     "items": [
//         {"shortDescription": "Pepsi - 12-oz", "price": "1.25"},
//         {"shortDescription": "Dasani", "price": "1.40"}
//     ]
// }
routes.post('/process', [
    body('retailer').isString()
        .matches(/^[\w\s\-&]+$/)
        .withMessage('retailer can consists of letters, numbers, spaces, "-" and "&"'),
    body('purchaseDate')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('purchaseDate must be in format YYYY-MM-DD.')
        .custom(value => {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('Invalid date.');
            }
            return true;
        }),
    body('purchaseTime').isString()
        .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
        .withMessage('purchaseTime format is HH:MM (24-hours)')
        .custom(value => {
            const [hours, minutes] = value.split(':').map(Number);
            if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
                throw new Error('Wrong time!');
            }
            return true;
        }),
    body('total').isString()
        .matches(/^\d+\.\d{2}$/)
        .withMessage('total must be in format 0.00.'),
    // Items
    body('items')
        .isArray({ min: 1 })
        .withMessage('items must contain at least one item.'),
    body('items.*.shortDescription').isString()
        .matches(/^[\w\s\-]+$/)
        .withMessage('shortDescription must contain only letters, numbers, spaces, and "-".'),
    body('items.*.price').isString()
        .matches(/^\d+\.\d{2}$/)
        .withMessage('Price must be in format 0.00.'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty() || !totalIsRight(req.body.items, req.body.total)) {
        // console.log(errors);
        return res.status(400).json({ message: "The receipt is invalid." });
    }

    const newReceipt = {
        "id": randomUUID(),
        "retailer": req.body.retailer,
        "purchaseDate": req.body.purchaseDate,
        "purchaseTime": req.body.purchaseTime,
        "total": req.body.total,
        "items": req.body.items
    };

    receipts.push(newReceipt);

    return res.send({"id": newReceipt.id});
})

routes.get('/:id/points',function (req, res) {
    let id = req.params.id;
    const receipt = receipts.find(receipt => receipt.id === id);

    if (receipt !== undefined) {
        return res.send({"points": calculatePoints(receipt)});
    }

    res.status(404).json({message: "No receipt found for that ID."});
})

function calculatePoints(receipt) {
    let points = 0;

    // One point for every alphanumeric character in the retailer name.
    points += (receipt.retailer.match(/[a-zA-Z0-9]/g) || []).length;

    // 50 points if the total is a round dollar amount with no cents.
    const total = parseFloat(receipt.total);
    if (total % 1 === 0) {
        points += 50;
    }

    // 25 points if the total is a multiple of 0.25.
    if (total % 0.25 === 0) {
        points += 25;
    }

    // 5 points for every two items on the receipt.
    points += 5 * Math.floor(receipt.items.length / 2);

    // If the trimmed length of the item description is a multiple of 3, multiply the price by 0.2 and round up to the
    // nearest integer. The result is the number of points earned.
    for (const item of receipt.items) {
        const trimmedLength = item.shortDescription.trim().length;
        if (trimmedLength % 3 === 0) {
            points += Math.ceil(parseFloat(item.price) * 0.2);
        }
    }

    // 6 points if the day in the purchase date is odd.
    const day = parseInt(receipt.purchaseDate.split('-')[2], 10);
    if (day % 2 !== 0) {
        points += 6;
    }

    // 10 points if the time of purchase is after 2:00pm and before 4:00pm.
    const [hours, minutes] = receipt.purchaseTime.split(':').map(Number);
    if (hours >= 14 && hours <= 15) {
        points += 10;
    }

    return points;
}

function totalIsRight(items, total) {
    let controlTotal = 0.00;

    for (let item of items) {
        controlTotal += parseFloat(item.price);
    }

    return parseFloat(total) === controlTotal;
}

module.exports.routes = routes;
