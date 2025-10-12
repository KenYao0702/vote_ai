const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  // 從 db.json 動態讀取候選人資料
  const dbPath = path.join(__dirname, '../../server/db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  
  const candidateNames = db.candidates.map(c => c.name);
  const candidatePlatforms = db.candidates.map(c => c.platform || ''); // Use platform or empty string if not provided

  console.log("Deploying contract with candidates:", candidateNames);

  const Voting = await hre.ethers.getContractFactory("Voting");
  // Pass both names and platforms to the constructor, with a manual gas limit
  const voting = await Voting.deploy(candidateNames, candidatePlatforms, { gasLimit: 8000000 });

  await voting.waitForDeployment();

  console.log(
    `Voting contract deployed to ${voting.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
