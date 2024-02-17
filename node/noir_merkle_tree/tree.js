const { sha256 } = require('js-sha256');
const { BarretenbergBackend, ProofData } = require('@noir-lang/backend_barretenberg');
const { Noir } = require('@noir-lang/noir_js');
const {ethereumjs} = require('@ethereumjs/tx'); 
const ethers = require('ethers')
require('dotenv').config()
const fs = require('fs');
const usercircuit = require('../user_circuit.json');
const relaycircuit = require('../../noir/relay_circuit/target/prove_relay.json')

const { RPC_URL, RELAYER_PRIVATE_KEY, RELAYER_ADDRESS, VERIFIER_ADDRESS, RELAY_VERIFIER_ADDRESS, RELAY_VAULT_ADDRESS } = process.env;
const JSON_CONTRACT = require("./UserUltraVerifier.json").abi
const RELAY_JSON_CONTRACT = require("./RelayUltraVerifier.json").abi
const RELAY_VAULT_JSON_CONTRACT = require("./RelayVault.json").abi

let commitment_0 = sha256.update(new Uint8Array([1, 10, 10]));
let commitment_1 = sha256.update(new Uint8Array([2, 20, 30]));
var commitment_2 = sha256.update('0x2c027c86fd5f26783f3bb1b1743515d9ff2d64433c3d627f9dffdef06e30cbc5');
commitment_2.update(sha256.update(numToUint8Array(30)).digest());
commitment_2.update(sha256.update(numToUint8Array(60)).digest());

let lvl1 = sha256.update(commitment_0.hex());
let lvl2 = sha256.update(commitment_1.hex());
lvl2 = lvl2.update(lvl1.hex());
let root = sha256.update(commitment_2.array())
root = root.update(lvl2.array());

function numToUint8Array(num) {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}



async function broadcast() {
  const userBackend = new BarretenbergBackend(usercircuit);
  const user = new Noir(usercircuit, userBackend);
  const relayBackend = new BarretenbergBackend(relaycircuit);
  const relay = new Noir(relaycircuit, relayBackend);

  const userInput = {
    index: 0,
    hash_path: [lvl2.array()],
    spend_limit: 60,
    transferAmount: 30,
    transactionHash: "0x2c027c86fd5f26783f3bb1b1743515d9ff2d64433c3d627f9dffdef06e30cbc5",
    root: root.digest()
  }

  const relayInput = {
    spendLimitIRON: 60,
    fee: 1,
    amountToSpend: 3,
    asset: "0x4c58A838E6FccE71237FB07ab078B49474086496",
    feePriceIRON: 1,
    assetPriceIRON: 1
  }

  const loadContract = async (data) => {
    // data = JSON.parse(data);
    const contract = new ethers.Contract(VERIFIER_ADDRESS, data, signer);
    return contract
  }

  const loadRelayContract = async (data) => {
    const contract = new ethers.Contract(RELAY_VERIFIER_ADDRESS, data, signer);
    return contract
  }

  const loadRelayVaultContract = async (data) => {
    const contract = new ethers.Contract(RELAY_VAULT_ADDRESS, data, signer);
    return contract
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet("0x"+RELAYER_PRIVATE_KEY, provider);
  const contract = await loadContract(JSON_CONTRACT)
  const userProof = await user.generateFinalProof(userInput);
  const userProofHex =  "0x" + Buffer.from(userProof.proof).toString('hex')
  
  let publicInputArray = root.digest().map((i) => "0x" + Number(i).toString(16).padStart(64, "0"))

  publicInputArray.unshift(ethers.zeroPadValue(ethers.hexlify("0x" + Number(60).toString(16)), 32))
  
  // Verify user proof
  // const transaction = {
  //   from: RELAYER_ADDRESS,
  //   to: VERIFIER_ADDRESS,
  //   value: '0',
  //   gasPrice: "700000000", // 0.7 gwei
  //   nonce: await provider.getTransactionCount(RELAYER_ADDRESS),
  //   chainId: "534351",
  //   data: contract.interface.encodeFunctionData(
  //     "verify",[userProofHex, publicInputArray]
  //   )
  // };
  // const signedTransaction = await signer.populateTransaction(transaction);
  // const userTransactionResponse = await signer.sendTransaction(signedTransaction);

  const relayContract = await loadRelayContract(RELAY_JSON_CONTRACT);
  const relayProof = await relay.generateFinalProof(relayInput);
  const relayProofHex = await "0x" + Buffer.from(relayProof.proof).toString('hex')
  let relayPublicInputArray = []
  relayProof.publicInputs.forEach((v) => relayPublicInputArray.push(v))

  // Verify relay proof
  // const relayTransaction = {
  //   from: RELAYER_ADDRESS,
  //   to: RELAY_VERIFIER_ADDRESS,
  //   value: '0',
  //   gasPrice: "700000000", // 0.7 gwei
  //   nonce: await provider.getTransactionCount(RELAYER_ADDRESS),
  //   chainId: "534351",
  //   data: relayContract.interface.encodeFunctionData(
  //     "verify", [relayProofHex, relayPublicInputArray]
  //   )
  // }

  // const relaySignedTransaction = await signer.populateTransaction(relayTransaction);
  // const relayTransactionResponse = await signer.sendTransaction(relaySignedTransaction);

  const relayVaultContract = await loadRelayVaultContract(RELAY_VAULT_JSON_CONTRACT);

  const relayVaultTransaction = {
    from: RELAYER_ADDRESS,
    to: RELAY_VAULT_ADDRESS,
    value: '0',
    gasPrice: "700000000000", // 700 gwei
    nonce: await provider.getTransactionCount(RELAYER_ADDRESS),
    chainId: "534351",
    data: relayVaultContract.interface.encodeFunctionData(
      "relay", [userProofHex, publicInputArray, relayProofHex, relayPublicInputArray, 5, "0x7273ebbB21F8D8AcF2bC12E71a08937712E9E40c", "0x7B4fd15B495b5700aF2C193f52D830e51C049366"]
    )
  }

  const relayVaultSignedTransaction = await signer.populateTransaction(relayVaultTransaction);
  const relayVaultTransactionResponse = await signer.sendTransaction(relayVaultSignedTransaction);
  return relayVaultTransactionResponse;
}

export default broadcast;

// broadcast().then((relayVaultTransactionResponse) => {
//   console.log('🎉 The hash of your transaction is:', relayVaultTransactionResponse.hash);
// })


// console.log(root.toString());
// console.log(root.digest());
// console.log(lvl2.array())
