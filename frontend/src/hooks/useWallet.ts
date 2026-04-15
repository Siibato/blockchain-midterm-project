import { useConnectWallet, useSetChain } from "@web3-onboard/react";

const SEPOLIA_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID ?? "11155111");

export function useWallet() {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [{ connectedChain, settingChain }, setChain] = useSetChain();

  const account = wallet?.accounts[0]?.address ?? null;
  const chainId = connectedChain ? parseInt(connectedChain.id, 16) : null;
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID;

  const switchToSepolia = async () => {
    await setChain({ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` });
  };

  return {
    account,
    chainId,
    isCorrectNetwork,
    isConnecting: connecting || settingChain,
    error: null,
    connect: () => connect(),
    disconnect: () => disconnect({ label: wallet?.label ?? "" }),
    switchToSepolia,
  };
}
