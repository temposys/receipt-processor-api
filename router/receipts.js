const express = require('express');
const routes = express.Router();

let receipts = [];

// receipt example
// {
//         "retailer": "Walgreens",
//         "purchaseDate": "2022-01-02",
//         "purchaseTime": "08:13",
//         "total": "2.65",
//         "items": [
//             {"shortDescription": "Pepsi - 12-oz", "price": "1.25"},
//             {"shortDescription": "Dasani", "price": "1.40"}
//         ]
//     }
routes.post('/process', (req, res) => {
    res.send('Process!')
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
