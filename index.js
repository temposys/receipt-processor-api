const express = require('express')
const app = express()
const port = 3080

const receipts_routes = require('./router/receipts.js').routes;

app.use(express.json());
app.use("/receipts", receipts_routes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
