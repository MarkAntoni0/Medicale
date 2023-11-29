
const port = 5020;
const axios = require('axios');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

transaction = require('./transaction.json');
const pharmacy = 'http://localhost:3020/receive-json';
const insurance = 'http://localhost:5050/receive-json';
const physician = 'http://localhost:5080/receive-json';

var name, disease, id = 0, medicine;

const procedure = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('\nTransaction Initiated.\n\nValidating with insurance...');
    id++;
    transaction.id = id.toString();
    transaction.name = name;
    transaction.disease = disease;
    transaction.medicine = medicine;

    transaction = await postDataToServer(insurance, transaction);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('\nValidation completed.\n\Requesting nearest pharmacies...');

    transaction = await postDataToServer(pharmacy, transaction);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('\nMedicine available at pharmacy X.');

    await new Promise(resolve => setTimeout(resolve, 1000));
    await postDataToServer(physician, transaction);
}

app.post('/initiateTransaction', async (req, res) => {
    name = req.body.name;
    disease = req.body.disease;
    medicine = req.body.medicine;
    await procedure();
    res.send('Token claimed.');
    console.log(transaction);
});

const postDataToServer = async (serverURL, jsonFile) => {
    try {
        const response = await axios.post(serverURL, jsonFile);
        return response.data;
    } catch (error) {
        console.error('Error sending data to Receiver Server:', error.message);
    }
};

app.listen(port, () => {
    console.log(`\nSystem Server is running on http://localhost:${port}`);
});