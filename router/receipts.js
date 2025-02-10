const express = require('express');
const { body, validationResult } = require('express-validator');
const routes = express.Router();

let receipts = [];

// receipt example
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
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({ message: "The receipt is invalid." });
    }
    res.send('No Errors!')
})

routes.get('/:id/points',function (req, res) {
    let id = req.params.id;

    const receipt = receipts.filter((receipt) => {
        return receipts.id === id;
    })[0];

    if (receipt) {
        return res.send(JSON.stringify(receipt,null,4));
    } else {
        res.status(404).json({message: "No receipt found for that ID."});
    }
})

module.exports.routes = routes;
