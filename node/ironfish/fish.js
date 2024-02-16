const {IronfishSdk, CurrencyUtils} = require("@ironfish/sdk")
const { BarretenbergBackend } = require('@noir-lang/backend_barretenberg');
const { Noir } = require('@noir-lang/noir_js');
const async = require('async');
const { sha256 } = require('js-sha256');
const usercircuit = require('../../noir/user_circuit/target/user_circuit.json')

async function main() {
  const sdk = await IronfishSdk.init({ dataDir: '~/.ironfish' });
  const client = await sdk.connectRpc();
  

  const from = 'acc2';
  const to = '01ad7aa5a5e8a1e49ed5764179f6950fed680dae74c5fc070dec2e391cc02e95';
  const amount = '10';
  const fee = 1;
  const memo = ""
  const expiration = 173913;
  const confirmations = 1;

  const options = {
    account: from,
    outputs: [
      {
        publicAddress: to,
        amount: CurrencyUtils.encode(amount),
        memo,
        // assetId,
      },
    ],
    fee: CurrencyUtils.encode(fee),
    expiration,
    confirmations,
  };

  const response = await client.wallet.createTransaction(options);
  console.log(response);
}

async function transactionView() {
  // const config = JSON.parse((await fsAsync.readFile('.ironfish.config.json')).toString());
  const sdk = await IronfishSdk.init({dataDir: '~/.ironfish'});
  const userBackend = new BarretenbergBackend(usercircuit);
  const user = new Noir(usercircuit, userBackend);

  const client = await sdk.connectRpc();
  const account = 'acc2';
  const confirmations = 1;

  const options = {
    account,
    confirmations,
  };

  const response = client.wallet.getAccountTransactionsStream(options);
  let root = sha256.update(new Uint8Array([0, 0, 0]));
  let spendLimit = 0;
  await (response.waitForEnd())
  const bufferSize = response.bufferSize()
  let transactionList = []
  for await (const content of response.contentStream()) {
    if (transactionList.length == bufferSize) {
      break
    }

    console.log(content);

    transactionList.push(content)
  }

  let content
  let hashPath
  let transferAmount
  for (let i = bufferSize - 1; i >= 0; i--) {
    content = transactionList[i];

    transferAmount = parseInt(content.assetBalanceDeltas[0].delta)/10**8
    if (content.type == "receive") {
      spendLimit += transferAmount;
    } else if(content.type == "send") {
      spendLimit -= transferAmount;
    }
    let commitment = sha256.update(`0x${content.hash}`);
    commitment = commitment.update(sha256.update(numToUint8Array(transferAmount)).digest());
    commitment = commitment.update(sha256.update(numToUint8Array(spendLimit)).digest());
    let leaf = sha256.update(commitment.array())
    hashPath = root.array()
    root = leaf.update(hashPath)
  }

  const userInput = {
    index: 0,
    hash_path: [hashPath],
    spend_limit: spendLimit,
    transferAmount: transferAmount,
    transactionHash: `0x${content.hash}`,
    root: root.digest()
  }

  console.log(userInput)

  const userProof = await user.generateFinalProof(userInput);
  console.log(userProof)
}

function numToUint8Array(num) {
  let arr = new Uint8Array(8);

  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }

  return arr;
}

// main()
async.series([transactionView]);