const port = 5080;
const axios = require('axios');
const express = require('express');
const fs = require('fs');

const app = express();
app.use(express.json());

const prescription = { name: '', disease: '', medicine: "" }


app.post('/receive-json', async (req, res) => {
    res.send('\nTransaction ended.');
});

app.listen(port, () => {
    console.log(`Physician Server is running on http://localhost:${port}`);
});

app.post('/trigger', async (req, res) => {

    prescription.name = req.body.name;
    prescription.disease = req.body.disease;
    prescription.medicine = req.body.medicine;


    console.log('\nPrescription Issued');
    await issuePrescription();
    res.send('Prescription Sent.');
})

const issuePrescription = async () => {
    await axios.post('http://localhost:5020/initiateTransaction', prescription)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error("Erorr", error.message);
        })
}



