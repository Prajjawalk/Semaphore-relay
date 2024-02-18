
const express = require('express')
const cors = require('cors')
const {sha256} = require('js-sha256')
const jsoning = require("jsoning")
const {createRawTransaction, transactionProofs} = require('./ironfish/fish')
const {generateRelayCircuit, generateRelayProof} = require('./sindri/sindri')
require('dotenv').config()
let heliaStrings;
const app = express()
const port = 3080
app.use(cors())
// const helia = createHelia();

app.get('/upload-data', async (req, res) => {
  // heliaStrings = strings(await createHelia());
  try {
    const db = new jsoning("./database.json");
    const feedbacksha256 = sha256.update(String(req.query.message))
    await db.set(feedbacksha256.toString(), req.query.message)
    // const myImmutableAddress = await heliaStrings.add(req.query.message);
    console.log("sending data", {"message": feedbacksha256.toString()})
    res.send({"message": feedbacksha256.toString()});
  } catch(e) {
    console.log(e)
    res.send(e)
  }
  
})

app.get('/get-data', async (req, res) => {
  // heliaStrings = strings(await createHelia());
  try {
    // const cid = CID.parse(req.query.ipfs);
    // const message = await heliaStrings.get(cid);
    const db = new jsoning("./database.json");
    console.log(req.query.hex)
    const message = await db.get(String(req.query.hex))
    res.send({"message": message});
  } catch(e) {
    res.send(e)
  }
  
})

app.post('/getRawTransaction', async (req, res) => {
  try {
    const tx = await createRawTransaction(req.body.from, req.body.to, req.body.amount);
    res.send(tx);
  } catch(e) {
    throw new Error(e);
  }
})

app.post('/getUserTransactionProofs', async (req, res) => {
  try {
    const proofs = await transactionProofs(req.body.account);
    res.send({"userTxProofs": proofs});
  } catch(e) {
    throw new Error(e)
  }
})

app.post('/generateRelayCircuit', async (req, res) => {
  try {
    const circuitDetails = await generateRelayCircuit();
    res.send({"relay_circuit_details": circuitDetails}); 
  } catch(e) {
    throw new Error(e);
  }
})

app.post('/generateRelayProofs', async (req, res) => {
  try {
    const relayProofs = await generateRelayProof(req.body.proofInputs);
    res.send({"relay_circuit_proofs": relayProofs});
  } catch(e) {
    throw new Error(e);
  }
})

// const helia = promisify(new Promise(createHelia()));


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
