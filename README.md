# TipPost dApp

A pay-to-like social platform on Ethereum. Post images with captions; others tip you with real ETH to like your posts.

**Live URL:** _add after Vercel deployment_  
**Sepolia Contract Address:** _add after deployment_  
**Sepolia Etherscan:** `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>`

---

## Project Structure

```
├── contracts/      Hardhat project — Solidity contract, tests, deploy script
└── frontend/       React + Vite + TypeScript — user interface
```

---

## Run Locally

### 1. Smart Contract

```bash
cd contracts
npm install
cp .env.example .env     # fill in SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY
npx hardhat test         # all tests must pass
```

### 2. Deploy to Sepolia

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia
# note the printed contract address
```

### 3. (Bonus) Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### 4. Copy ABI

After compiling, copy the ABI to the frontend:

```bash
cp artifacts/contracts/TipPost.sol/TipPost.json ../frontend/src/abi/TipPost.json
```

### 5. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
# set VITE_CONTRACT_ADDRESS=<your deployed address>
npm run dev
```

Open `http://localhost:5173` in a browser with MetaMask installed, on Sepolia testnet.

---

## Deploy Frontend (Vercel)

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `VITE_CONTRACT_ADDRESS` = your Sepolia contract address
5. Deploy

---

## Get Sepolia ETH (Free Faucets)

- https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- https://sepoliafaucet.com
- https://www.infura.io/faucet/sepolia

0.05 Sepolia ETH is more than enough.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Solidity ^0.8.20 |
| Dev Framework | Hardhat + TypeScript |
| Frontend | React + Vite + TypeScript |
| Blockchain Interaction | ethers.js v6 |
| Wallet | MetaMask |
| Network | Sepolia Testnet |
| Frontend Hosting | Vercel |
