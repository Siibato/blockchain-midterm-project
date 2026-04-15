export interface Post {
  id: bigint;
  creator: string;
  imageUrl: string;
  caption: string;
  likes: bigint;
  totalEarned: bigint;
  timestamp: bigint;
}

export type TxStatus = "idle" | "pending" | "success" | "error";
