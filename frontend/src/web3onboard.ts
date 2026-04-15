import Onboard from "@web3-onboard/core";
import injectedModule from "@web3-onboard/injected-wallets";

const injected = injectedModule();

const SEPOLIA_CHAIN_ID = import.meta.env.VITE_CHAIN_ID ?? "11155111";

export const onboard = Onboard({
  wallets: [injected],
  chains: [
    {
      id: `0x${parseInt(SEPOLIA_CHAIN_ID).toString(16)}`,
      token: "ETH",
      label: "Sepolia",
      rpcUrl: "https://rpc.sepolia.org",
    },
  ],
  appMetadata: {
    name: "TipPost",
    description: "Post images. Earn ETH from likes.",
  },
  connect: { autoConnectLastWallet: true },
  accountCenter: {
    desktop: { enabled: true, position: "bottomRight" },
    mobile: { enabled: true, position: "bottomRight" },
  },
});
