import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useContract } from "./useContract";
import type { Post } from "../types";

export function usePosts() {
  const { readContract } = useContract();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (!readContract) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await readContract.getAllPosts();
      // Reverse so newest posts appear first
      const mapped: Post[] = [...raw].reverse().map((p: Post) => ({
        id: p.id,
        creator: p.creator,
        imageUrl: p.imageUrl,
        caption: p.caption,
        likes: p.likes,
        totalEarned: p.totalEarned,
        timestamp: p.timestamp,
      }));
      setPosts(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load posts";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [readContract]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time event listeners
  useEffect(() => {
    if (!readContract) return;

    const onPostCreated = () => {
      fetchPosts();
    };

    const onPostLiked = () => {
      fetchPosts();
    };

    const createdFilter = readContract.filters["PostCreated"]();
    const likedFilter = readContract.filters["PostLiked"]();

    readContract.on(createdFilter, onPostCreated);
    readContract.on(likedFilter, onPostLiked);

    return () => {
      readContract.off(createdFilter, onPostCreated);
      readContract.off(likedFilter, onPostLiked);
    };
  }, [readContract, fetchPosts]);

  const getUserEarnings = useCallback(
    async (address: string): Promise<bigint> => {
      if (!readContract) return BigInt(0);
      try {
        const earned = await readContract.totalEarnedByUser(address);
        return earned as bigint;
      } catch {
        return BigInt(0);
      }
    },
    [readContract]
  );

  const checkLiked = useCallback(
    async (postId: bigint, address: string): Promise<boolean> => {
      if (!readContract) return false;
      try {
        return await readContract.checkLiked(postId, address);
      } catch {
        return false;
      }
    },
    [readContract]
  );

  return { posts, loading, error, fetchPosts, getUserEarnings, checkLiked };
}

// Re-export likeCost constant for UI use
export const LIKE_COST = ethers.parseEther("0.0001");
