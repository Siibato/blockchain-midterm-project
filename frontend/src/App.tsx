import { useWallet } from "./hooks/useWallet";
import { ConnectWallet } from "./components/ConnectWallet";
import { CreatePost } from "./components/CreatePost";
import { PostFeed } from "./components/PostFeed";
import { EarningsDisplay } from "./components/EarningsDisplay";
import "./App.css";

function App() {
  const { account, isCorrectNetwork } = useWallet();

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">TipPost</h1>
        <p className="app-subtitle">Post images. Earn ETH from likes.</p>
        <ConnectWallet />
      </header>

      <main className="app-main">
        {!account ? (
          <div className="connect-prompt">
            <p>Connect your MetaMask wallet to get started.</p>
          </div>
        ) : !isCorrectNetwork ? (
          <div className="connect-prompt">
            <p>Switch to the Sepolia testnet to use TipPost.</p>
          </div>
        ) : (
          <>
            <EarningsDisplay account={account} />
            <CreatePost />
            <section>
              <h2 className="feed-title">Feed</h2>
              <PostFeed account={account} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
