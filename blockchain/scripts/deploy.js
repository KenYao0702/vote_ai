const hre = require("hardhat");

async function main() {
  const candidateNames = ["候選人 A", "候選人 B", "候選人 C"]; // 與 db.json 中的候選人名稱一致
  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(candidateNames);

  await voting.waitForDeployment();

  console.log(
    `Voting contract deployed to ${voting.target}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
