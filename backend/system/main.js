// Load environment variables from a .env file
require("dotenv").config();

// Import necessary modules and utilities
const fs = require("fs");
const axios = require("axios");
const express = require("express");

// Import utility functions for current time and API key middleware
const { currentTime, apiKeyMiddleware } = require("../shared/utility.js");

// Import encryption and decryption functions and constants
const { encryptData, decryptData } = require("../shared/encryptJSON.js");

// Define API endpoints for different services
const pharmacy = "http://localhost:3020/receive-json";
const insurance = "http://localhost:5050/receive-json";

// Set up Express server on the specified port
const port = 5020;
const app = express();
app.use(express.text());

// Start the Express server and listen on the specified port
app.listen(port, () => {
  // Log a message indicating that the System Server is running
  console.log(
    "\n" +
      currentTime() +
      ": System Server is running on http://localhost:" +
      port
  );
});

// Declare variables for transaction data
let id = 0; // To be retreived from somewhere

// Procedure function to handle the main transaction logic
const procedure = async (transaction) => {
  // Log the initiation of the transaction
  console.log("\n" + currentTime() + ": Transaction Initiated.");

  // Encrypt the 'transaction' object using the secret key and IV
  transaction = encryptData(transaction);

  // Create a JSON object containing headers for a POST request
  const headerJson = {
    "Content-type": "text/plain", // Set content type to text/plain
    Authorization: process.env.API_SECRET_KEY, // Include API key for authorization
  };

  // Log and perform validation with the insurance server
  console.log("\n" + currentTime() + ": Validating with insurance...");
  transaction = await postDataToServer(insurance, transaction, headerJson);
  console.log(currentTime() + ": Validation completed.");

  const test = decryptData(transaction.data);
  console.log(test);

  // Log and request information from the nearest pharmacies
  console.log("\n" + currentTime() + ": Requesting nearest pharmacies...");
  // transaction = await postDataToServer(pharmacy, transaction, headerJson);
  console.log(currentTime() + ": Medicine available at pharmacy X.");
};

// Endpoint to initiate a transaction
app.post("/initiateTransaction", apiKeyMiddleware, async (req, res) => {
  try {
    // Decrypt the incoming request body using provided encryption key and IV
    const decrypted = decryptData(req.body);

    // Load transaction data from a JSON file
    let transaction = require("./transaction.json");

    // Assign values to transaction object properties
    transaction.id = (id++).toString(); // Increment the ID and convert to string
    transaction.bill = 500; // Assign the decrypted bill to the transaction
    transaction.name = decrypted.name; // Assign the decrypted name to the transaction
    transaction.disease = decrypted.disease; // Assign the decrypted disease to the transaction
    transaction.medicine = decrypted.medicine; // Assign the decrypted medicine to the transaction

    // Execute the main procedure
    await procedure(transaction);

    // Encrypt a response message with the secret key and IV
    const response = encryptData("Token claimed");

    // Send the encrypted response
    res.send(response);

    // Log a success message
    console.log("\n" + currentTime() + ": Transaction ended with success.");
  } catch (error) {
    // Log any errors that occur during the transaction
    console.log("\n" + currentTime() + ": " + error.message);
  }
});

// Function to send encrypted data to a server
const postDataToServer = async (serverURL, encryptedData, headerJson) => {
  try {
    // Send a POST request to the specified server URL with the encrypted data
    const response = await axios.post(serverURL, encryptedData, {
      headers: headerJson,
    });

    // Return response from axios
    return response;
  } catch (error) {
    // Handle errors during the data sending process
    console.error(
      "\n" + currentTime() + ": Error sending data to Receiver Server\n",
      error.message
    );
  }
};
