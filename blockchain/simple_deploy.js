require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { ethers } = require("ethers");
const fs = require('fs');
const path = require('path');

async function main() {
  // 1. Setup Provider and Wallet
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  const privateKey = process.env.GANACHE_FUNDER_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Fatal: GANACHE_FUNDER_PRIVATE_KEY is not set in your .env file.");
    console.error("Please copy the private key from Ganache and set it in the .env file.");
    process.exit(1);
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`Deploying contracts with the account: ${wallet.address}`);

  // 2. Get Contract ABI and Bytecode
  const artifactPath = path.join(__dirname, './artifacts/contracts/Voting.sol/Voting.json');
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const abi = artifact.abi;
  const bytecode = artifact.bytecode;

  // 3. Get Candidate Data
  const dbPath = path.join(__dirname, '../server/db.json');
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const candidatesCount = db.candidates.length;

  console.log(`Deploying contract for ${candidatesCount} candidates...`);

  // 4. Deploy Contract
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  
  try {
    const contract = await factory.deploy(candidatesCount, {
        // We still provide a generous gas limit manually to be safe
        gasLimit: 8000000 
    });

    await contract.waitForDeployment();

    console.log(`\nVoting contract deployed to: ${contract.target}`);

    // 5. Save deployment info
    const deploymentInfo = {
      contractAddress: contract.target,
      deploymentDate: new Date().toISOString()
    };
    const deploymentInfoPath = path.join(__dirname, 'deployment-info.json');
    fs.writeFileSync(deploymentInfoPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`Deployment info saved to ${deploymentInfoPath}`);
  } catch (error) {
    console.error("\nDeployment failed:", error);
    if (error.code === 'INSUFFICIENT_FUNDS') {
        const balance = await provider.getBalance(wallet.address);
        console.error(`Deployer balance is: ${ethers.formatEther(balance)} ETH`);
    }
    process.exitCode = 1;
  }
}

main();
