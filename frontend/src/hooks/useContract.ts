import { ethers } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import TipPostArtifact from "../abi/TipPost.json";

const TipPostAbi = TipPostArtifact.abi;
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as string;

// Stable read-only provider using Alchemy Sepolia RPC — created once, never recreated.
// This keeps event listeners in usePosts alive regardless of wallet state.
const readProvider = new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/demo");
const staticReadContract = CONTRACT_ADDRESS
  ? new ethers.Contract(CONTRACT_ADDRESS, TipPostAbi, readProvider)
  : null;

export function useContract() {
  const [{ wallet }] = useConnectWallet();

  const getSignerContract = async () => {
    const provider = wallet?.provider ?? window.ethereum;
    if (!provider || !CONTRACT_ADDRESS) return null;
    const ethersProvider = new ethers.BrowserProvider(provider as ethers.Eip1193Provider);
    const signer = await ethersProvider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, TipPostAbi, signer);
  };

  return { readContract: staticReadContract, getSignerContract, contractAddress: CONTRACT_ADDRESS };
}
