import { usePosts } from "../hooks/usePosts";
import { PostCard } from "./PostCard";

interface Props {
  account: string;
}

export function PostFeed({ account }: Props) {
  const { posts, loading, error, fetchPosts } = usePosts();

  if (loading) {
    return (
      <div className="feed-loading">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="post-skeleton" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-error">
        <p className="error-text">Failed to load posts: {error}</p>
        <button className="btn-secondary" onClick={fetchPosts}>Retry</button>
      </div>
    );
  }

  if (posts.length === 0) {
    return <p className="feed-empty">No posts yet — be the first to post!</p>;
  }

  return (
    <div className="post-feed">
      {posts.map((post) => (
        <PostCard
          key={post.id.toString()}
          post={post}
          account={account}
          onLiked={fetchPosts}
        />
      ))}
    </div>
  );
}
