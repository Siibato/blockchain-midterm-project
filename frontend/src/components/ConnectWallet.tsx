import { useWallet } from "../hooks/useWallet";

export function ConnectWallet() {
  const { account, isCorrectNetwork, isConnecting, error, connect, switchToSepolia } = useWallet();

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div className="wallet-container">
      {!account ? (
        <button className="btn-primary" onClick={connect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <span className="wallet-address">{shortAddress}</span>
      )}
      {account && !isCorrectNetwork && (
        <div className="network-warning">
          Wrong network — you need Sepolia.{" "}
          <button className="btn-link" onClick={switchToSepolia}>
            Switch now
          </button>
        </div>
      )}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
