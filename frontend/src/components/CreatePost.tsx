import { useState, FormEvent } from "react";
import { useContract } from "../hooks/useContract";
import { usePosts } from "../hooks/usePosts";
import type { TxStatus } from "../types";

export function CreatePost() {
  const { getSignerContract } = useContract();
  const { fetchPosts } = usePosts();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim() || !caption.trim()) return;

    setStatus("pending");
    setErrorMsg(null);

    try {
      const contract = await getSignerContract();
      if (!contract) throw new Error("Contract not available");

      const tx = await contract.createPost(imageUrl.trim(), caption.trim());
      await tx.wait();

      setStatus("success");
      setImageUrl("");
      setCaption("");
      await fetchPosts();

      setTimeout(() => setStatus("idle"), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setErrorMsg(
        message.includes("user rejected") ? "Transaction rejected in MetaMask." : message
      );
      setStatus("error");
    }
  };

  return (
    <form className="create-post-form" onSubmit={handleSubmit}>
      <h2>Create Post</h2>
      <input
        className="input"
        type="url"
        placeholder="Image URL"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        disabled={status === "pending"}
        required
      />
      <input
        className="input"
        type="text"
        placeholder="Caption"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={status === "pending"}
        required
        maxLength={280}
      />
      <button
        className="btn-primary"
        type="submit"
        disabled={status === "pending" || !imageUrl.trim() || !caption.trim()}
      >
        {status === "pending" ? "Posting..." : "Post"}
      </button>
      {status === "success" && <p className="success-text">Post created!</p>}
      {status === "error" && <p className="error-text">{errorMsg}</p>}
    </form>
  );
}
