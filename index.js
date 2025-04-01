import { connect, createSigner } from "@permaweb/aoconnect/node";
import { promises as fs } from "fs";
import { randomBytes } from "node:crypto";
const WALLET_PATH = "./wallet.json";
const NODE_URL = "http://147.185.40.122:20047";
const CU_URL = "http://147.185.40.122:20014";
const MU_URL = "http://147.185.40.122:20044";
const wallet = JSON.parse(await fs.readFile(WALLET_PATH, "utf8"));

const main = async () => {
  // Create signer
  const signer = createSigner(wallet);

  // Connect to node
  const {
    spawn,
    result,
    request,
    get,
    post,
    message,
    getNodeBalance,
    getMessageById,
  } = connect({
    MODE: "mainnet",
    CU_URL: CU_URL,
    URL: NODE_URL,
    device: "process@1.0",
    signer,
  });
  const address = await fetch(NODE_URL + "/~meta@1.0/info/address").then(
    (res) => res.text()
  );


  const processRes = await request({
    path: "/schedule",
    method: "POST",
    type: "Process",
    scheduler: address,
    module: "JArYBF-D8q2OmZ4Mok00sD2Y_6SYEQ7Hjx-6VZ_jl3g",
    device: "process@1.0",
    "scheduler-device": "scheduler@1.0",
    "execution-device": "delegated-compute@1.0",
    data: 'print("Hello World")',
    'inline-body-key': 'body',
    // data: 'print("Hello World")',
    authority: address,
    "scheduler-location": address,
    "Data-Protocol": "ao",
    Variant: "ao.N.1",
    "random-seed": randomBytes(16).toString("hex"),
    "On-Boot": "USxy_74bsS_yuQtYAqCvn9DtxmBuUZHA-4wNVuQxZHU",
  });

  const process = processRes.process
  // process = "RXp9PkglQrlU3m5jj9d3rFuZGFkN3p55mMtAC-iYXEM";
  console.log(process);

  const messageRes = await request({
    path: `${process}/schedule`,
    type: "Message",
    method: "POST",
    action: "Eval",
    data: 'print(ao.id)',
    "inline-body-key": "body",
    "Data-Protocol": "ao",
    Variant: "ao.N.1",
  });
  const slot = messageRes.slot;
  // const slot = "3";
  console.log({ slot });

  const resultRes = await fetch(
    `${NODE_URL}/${process}~process@1.0/compute&slot+integer=${slot}/results/json`,
    {
      method: "GET",
      target: process,
      "slot+integer": slot,
      accept: "application/json",
    }
  );
  const result1 = await resultRes.json();

  console.log(result1);

  // const resultRes = await request({
  //   path: `/QJGm1ao8HQaqnsxFeYbcFjBPHHCLD_mTEVGL3_2nW9Q~process@1.0/push&slot+integer=3`,
  //   method: "POST",
  //   target: "QJGm1ao8HQaqnsxFeYbcFjBPHHCLD_mTEVGL3_2nW9Q",
  //   "execution-device": "stack@1.0",
  //   "slot+integer": "3",
  //   accept: "application/json",
  // });

  // console.log(resultRes); // doesnt work -- error device stack not found
};

main();
