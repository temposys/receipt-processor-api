const express = require('express')
const app = express()

const receipts_routes = require('./router/receipts.js').routes;

app.use(express.json());
app.use("/receipts", receipts_routes);

module.exports = app;
