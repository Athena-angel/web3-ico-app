const { ethers } = require("hardhat");
const path = require("path");

function getTime() {
  const now = new Date(); // Get the current date
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const from = Math.floor(Date.now() / 1000);
  const to = Math.floor(tomorrow.getTime() / 1000);
  return [from, to];
}

async function main() {
  //STKN
  console.log("Deploying STKN Contract...");
  const STKNFactory = await ethers.getContractFactory("STKN");
  const stkn = await STKNFactory.deploy();

  console.log("Deployed STKN:", stkn.address);

  const [from, to] = getTime();
  console.log("Time interval: ", from, to);

  //STKNICO
  console.log("Deploying stknICO Contract...");
  const StknICOFactory = await ethers.getContractFactory("StknICO");
  const stknICO = await StknICOFactory.deploy(stkn.address, from, to);

  console.log("Deployed stknICO:", stknICO.address);

  saveFrontendFiles(stknICO, stkn);
}

function saveFrontendFiles(stknICO, stkn) {
  const fs = require("fs");
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "client",
    "src",
    "contracts"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const time_interval = getTime();

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify(
      { StknICO: stknICO.address, STKN: stkn.address },
      undefined,
      2
    )
  );

  fs.writeFileSync(
    path.join(contractsDir, "time-interval.json"),
    JSON.stringify(
      { from: time_interval[0], to: time_interval[1] },
      undefined,
      2
    )
  );

  const StknICOArtifact = artifacts.readArtifactSync("StknICO");
  const STKNArtifact = artifacts.readArtifactSync("STKN");

  fs.writeFileSync(
    path.join(contractsDir, "StknICO.json"),
    JSON.stringify(StknICOArtifact, null, 2)
  );

  fs.writeFileSync(
    path.join(contractsDir, "STKN.json"),
    JSON.stringify(STKNArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
