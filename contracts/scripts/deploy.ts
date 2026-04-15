import hre from "hardhat";

async function main() {
  console.log("Deploying TipPost to", hre.network.name, "...");

  const TipPost = await hre.ethers.getContractFactory("TipPost");
  const tipPost = await TipPost.deploy();

  await tipPost.waitForDeployment();

  const address = await tipPost.getAddress();
  console.log("TipPost deployed to:", address);

  if (hre.network.name === "sepolia") {
    console.log("\nWaiting 6 block confirmations before verifying...");
    await tipPost.deploymentTransaction()?.wait(6);

    console.log("Verifying on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("Already Verified")) {
        console.log("Contract already verified.");
      } else {
        console.error("Verification failed:", message);
      }
    }
  }

  console.log("\n--- Add to frontend/.env ---");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
  console.log("VITE_CHAIN_ID=11155111");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
