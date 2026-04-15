import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useContract } from "../hooks/useContract";
import { LIKE_COST } from "../hooks/usePosts";
import type { Post, TxStatus } from "../types";

interface Props {
  post: Post;
  account: string;
  onLiked: () => void;
}

export function PostCard({ post, account, onLiked }: Props) {
  const { getSignerContract } = useContract();
  const [liked, setLiked] = useState(false);
  const [status, setStatus] = useState<TxStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const isOwn = post.creator.toLowerCase() === account.toLowerCase();

  // Check liked status on mount and when account changes
  useEffect(() => {
    const check = async () => {
      const contract = await getSignerContract();
      if (!contract) return;
      try {
        const result = await contract.checkLiked(post.id, account);
        setLiked(result as boolean);
      } catch {
        // ignore
      }
    };
    if (account) check();
  }, [post.id, account, getSignerContract]);

  const handleLike = async () => {
    if (liked || isOwn || status === "pending") return;
    setStatus("pending");
    setErrorMsg(null);
    try {
      const contract = await getSignerContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.likePost(post.id, { value: LIKE_COST });
      await tx.wait();

      setLiked(true);
      setStatus("success");
      onLiked();
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      if (message.includes("user rejected")) {
        setErrorMsg("Rejected in MetaMask.");
      } else if (message.includes("Already liked")) {
        setErrorMsg("Already liked.");
        setLiked(true);
      } else if (message.includes("Cannot like your own post")) {
        setErrorMsg("Cannot like your own post.");
      } else {
        setErrorMsg("Transaction failed.");
      }
      setStatus("error");
    }
  };

  const shortAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const likeButtonTitle = isOwn
    ? "Cannot like your own post"
    : liked
    ? "Already liked"
    : `Like for ${ethers.formatEther(LIKE_COST)} ETH`;

  return (
    <div className="post-card">
      {!imgError ? (
        <img
          className="post-image"
          src={post.imageUrl}
          alt={post.caption}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="post-image-fallback">Image unavailable</div>
      )}

      <div className="post-body">
        <p className="post-caption">{post.caption}</p>
        <p className="post-creator">
          By <span title={post.creator}>{shortAddress(post.creator)}</span>
          {isOwn && <span className="badge-you"> (you)</span>}
        </p>
        <div className="post-stats">
          <span>{post.likes.toString()} likes</span>
          <span>{ethers.formatEther(post.totalEarned)} ETH earned</span>
        </div>

        <button
          className={`btn-like ${liked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={liked || isOwn || status === "pending"}
          title={likeButtonTitle}
        >
          {status === "pending" ? "..." : liked ? "❤️ Liked" : "🤍 Like (0.0001 ETH)"}
        </button>

        {status === "error" && <p className="error-text">{errorMsg}</p>}
        {status === "success" && <p className="success-text">Liked!</p>}
      </div>
    </div>
  );
}
