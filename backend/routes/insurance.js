// Import necessary modules and utilities
require("dotenv").config();
const axios = require("axios");
const fs = require("fs-extra");
const express = require("express");
const { ethers } = require("ethers");
const { myDB } = require("../shared/firebase.js");
const { currentTime, apiKeyMiddleware } = require("../shared/utility.js");
const { encryptData, decryptData } = require("../shared/encryptJSON.js");

// Connect to Firestore and set up Express server
const port = 5050;
const app = express();
const db = myDB.collection("dummy").doc("dummydata");

// Middleware to parse JSON in incoming requests
app.use(express.text());

// Start the Express server and listen on the specified port
app.listen(port, () => {
  // Log a message indicating that the server is running
  console.log(
    "\n" +
      currentTime() +
      `: Insurance Server is running on http://localhost:${port}`
  );
});

// Endpoint to receive JSON data
app.post("/receive-json", apiKeyMiddleware, async (req, res) => {
  try {
    // Make a POST request to trigger a smart contract with the received data
    await axios
      .post("http://localhost:5050/triggerContract", req.body, {
        headers: {
          "Content-type": "text/plain", // Set content type to text/plain
          Authorization: process.env.API_SECRET_KEY, // Include API key for authorization
        },
      })
      .then(async (smartContractResponse) => {
        // Make a POST request to upload the smart contract response to the database
        await axios
          .post("http://localhost:5050/uploadDB", smartContractResponse.data, {
            headers: {
              "Content-type": "text/plain", // Set content type to text/plain
              Authorization: process.env.API_SECRET_KEY, // Include API key for authorization
            },
          })
          .then((dbResponse) => {
            // Log the database response
            console.log(currentTime() + ": " + dbResponse.data);
          })
          .catch((dbError) => {
            // Log an error if there's an issue with the database request
            console.log(
              "\n" + currentTime() + ": Error --> " + dbError.message
            );
          });

        // Send the encrypted response
        res.send(smartContractResponse.data);
      })
      .catch((smartContractError) => {
        // Log an error if there's an issue with the smart contract request
        console.log(
          "\n" + currentTime() + ": Error --> " + smartContractError.message
        );
      });
  } catch (error) {
    // Log an error if there's an issue sending data to the Receiver Server
    console.error(
      "\n" + currentTime() + ": Error sending data to Receiver Server\n",
      error.message
    );
  }
});

// Endpoint to trigger a smart contract
app.post("/triggerContract", apiKeyMiddleware, async (req, res) => {
  // Decrypt the response data using the received encryption key and IV
  const decrypted = decryptData(req.body);

  // Connect to Ethereum provider and wallet
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const encryptedJSON = fs.readFileSync("./.encryptedKey.json", "utf8");

  // Create a new wallet using the encrypted JSON file and password
  let wallet = new ethers.Wallet.fromEncryptedJsonSync(
    encryptedJSON,
    process.env.PRIVATE_KEY_PASSWORD
  );

  // Log a message indicating the start of the wallet connection process
  console.log("\n" + currentTime() + ": Connecting wallet...");

  // Connect the wallet to the Ethereum provider
  wallet = await wallet.connect(provider);

  // Log a message indicating the successful connection of the wallet
  console.log(currentTime() + ": Wallet connected.");

  // Load the ABI (Application Binary Interface) of the smart contract
  const abi = fs.readFileSync(process.env.ABI, "utf-8");

  // Instantiate the smart contract using its address, ABI, and connected wallet
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    abi,
    wallet
  );

  // Log a message indicating the start of the smart contract interaction
  console.log(
    "\n" +
      currentTime() +
      ": Contacting smart contract, waiting for response..."
  );

  // Trigger the smart contract function "calculateAllowance" with a value of 1200
  const transaction = await contract.calculateAllowance(decrypted.bill);

  // Log the smart contract response
  console.log(
    currentTime() + ": Smart contract response = ",
    transaction.toString()
  );

  // Convert the 'transaction' object to a string and assign it to 'decrypted.allowance
  decrypted.allowance = transaction.toString();

  // Encrypt a response message
  const response = encryptData(decrypted);

  // Send the encrypted response
  res.send(response);
});

// Endpoint to upload data to the database
app.post("/uploadDB", apiKeyMiddleware, async (req, res) => {
  // Decrypt the response data using the received encryption key and IV
  const decrypted = decryptData(req.body);

  // Log a message indicating the start of the database update process
  console.log("\n" + currentTime() + ": Updating database...");

  // Update the Firestore database with the received data
  await db.set({ [decrypted]: decrypted });

  // Send a response to the client with the HTTP status of the update operation
  res.send("Database updated.");
});
