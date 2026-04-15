import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { usePosts } from "../hooks/usePosts";

interface Props {
  account: string;
}

export function EarningsDisplay({ account }: Props) {
  const { getUserEarnings } = usePosts();
  const [earnings, setEarnings] = useState<bigint>(BigInt(0));

  useEffect(() => {
    getUserEarnings(account).then(setEarnings);
  }, [account, getUserEarnings]);

  return (
    <div className="earnings-display">
      <span className="earnings-label">Your earnings:</span>
      <span className="earnings-value">{ethers.formatEther(earnings)} ETH</span>
    </div>
  );
}
