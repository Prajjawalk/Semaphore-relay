// Use dynamic imports for ESM and node REPL compatibility, not necessary otherwise.
const axios = (await import("axios")).default;
const FormData = (await import("form-data")).default;
const fs = (await import("fs")).default;
const process = (await import("process")).default;
const tar = (await import("tar")).default;
import 'dotenv/config'

// Make sure to provide your actual API key here.
const SINDRI_API_KEY = process.env.SINDRI_API_KEY;

// Use v1 of the Sindri API.
axios.defaults.baseURL = "https://sindri.app/api/v1";
// Authorize all future requests with an `Authorization` header.
axios.defaults.headers.common["Authorization"] = `Bearer ${SINDRI_API_KEY}`;
// Expect 2xx responses for all requests.
axios.defaults.validateStatus = (status) => status >= 200 && status < 300;

async function generateRelayCircuit() {
  // Create a new circuit.
  const formData = new FormData();
  formData.append(
    "files",
    tar.c({ gzip: true, sync: true }, ["./sindri/circuits/"]).read(),
    {
      filename: "compress.tar.gz",
    },
  );

  const createResponse = await axios.post(
    "/circuit/create",
    formData,
  );
  const circuitId = createResponse.data.circuit_id;
  console.log("Circuit ID:", circuitId);

  // Poll for completed status.
  let startTime = Date.now();
  let circuitDetailResponse;
  while (true) {
    circuitDetailResponse = await axios.get(`/circuit/${circuitId}/detail`, {
      params: { include_verification_key: false },
    });
    const { status } = circuitDetailResponse.data;
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    if (status === "Ready") {
      console.log(`Polling succeeded after ${elapsedSeconds} seconds.`);
      break;
    } else if (status === "Failed") {
      throw new Error(
        `Polling failed after ${elapsedSeconds} seconds: ${circuitDetailResponse.data.error}.`,
      );
    } else if (Date.now() - startTime > 30 * 60 * 1000) {
      throw new Error("Timed out after 30 minutes.");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log("Circuit Detail:");
  console.log(circuitDetailResponse.data);
  const package_name = circuitDetailResponse.data.nargo_package_name;
  return circuitDetailResponse;
}

// Generate a new proof and poll for completion.
// Sample proof input
// const proofInput = `spendLimitIRON = "60"
// fee = "1"
// amountToSpend = "3"
// asset = "0x4c58A838E6FccE71237FB07ab078B49474086496"
// feePriceIRON = "1"
// assetPriceIRON = "1"`;
async function generateRelayProof(proofInput) {


  const proveResponse = await axios.post(`/circuit/${circuitId}/prove`, {
    proof_input: proofInput,
  });
  const proofId = proveResponse.data.proof_id;
  console.log("Proof ID:", proofId);
  startTime = Date.now();
  let proofDetailResponse;
  while (true) {
    proofDetailResponse = await axios.get(`/proof/${proofId}/detail`);
    const { status } = proofDetailResponse.data;
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    if (status === "Ready") {
      console.log(`Polling succeeded after ${elapsedSeconds} seconds.`);
      break;
    } else if (status === "Failed") {
      throw new Error(
        `Polling failed after ${elapsedSeconds} seconds: ${proofDetailResponse.data.error}.`,
      );
    } else if (Date.now() - startTime > 30 * 60 * 1000) {
      throw new Error("Timed out after 30 minutes.");
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  console.log("Proof Output:");
  console.log(proofDetailResponse.data.proof);
  console.log("Public Output:");
  console.log(proofDetailResponse.data.public);
  return proofDetailResponse;
}

/*
// Create circuits/proofs if it does not exist
const proof_dir = "./sindri/circuits/proofs";
if (!fs.existsSync(proof_dir)){
  fs.mkdirSync(proof_dir);
}

// Save the proof in appropriate Nargo-recognizable file
fs.writeFileSync(
  "./sindri/circuits/proofs/"+package_name+".proof",
  String(proofDetailResponse.data.proof["proof"]),
);

// Save the public data in appropriate Nargo-recognizable file
fs.writeFileSync(
  "circuits/Verifier.toml",
  String(proofDetailResponse.data.public["Verifier.toml"]),
);
*/

export {
  generateRelayCircuit,
  generateRelayProof
}