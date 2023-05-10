const { ethers } = require("hardhat");

async function main() {
  //STKN
  console.log("Deploying STKN Contract...");
  const STKNFactory = await ethers.getContractFactory("STKN");
  const stkn = await STKNFactory.deploy();

  console.log("Deployed STKN:", stkn.address);

  //STKNICO
  console.log("Deploying stknICO Contract...");
  const StknICOFactory = await ethers.getContractFactory("StknICO");
  const stknICO = await StknICOFactory.deploy(stkn.address, new Date());

  console.log("Deployed stknICO:", stknICO.address);
  // await stknICO.startICO();
  await stkn.mint(stknICO.address, 50000);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
