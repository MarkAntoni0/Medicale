
const express = require('express');
const app = express();
const port = 3020;

app.use(express.json());

app.post('/receive-json', async (req, res) => {

    req.body.medicine ? req.body.pharmacy = 'true' : req.body.pharmacy = 'false';

    res.json(req.body);
});

app.listen(port, () => {
    console.log(`Pharmacy Server is running on http://localhost:${port}`);
});
