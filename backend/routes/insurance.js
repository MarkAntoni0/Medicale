
const express = require('express');
const app = express();
const port = 5050;

app.use(express.json());

app.post('/receive-json', async (req, res) => {
    req.body.insurance = 'A';
    res.json(req.body);
});

app.listen(port, () => {
    console.log(`Insurance Server is running on http://localhost:${port}`);
});
