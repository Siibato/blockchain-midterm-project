import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("TipPost", function () {
  async function deployTipPostFixture() {
    const [owner, creator, liker, otherUser] = await hre.ethers.getSigners();

    const TipPost = await hre.ethers.getContractFactory("TipPost");
    const tipPost = await TipPost.deploy();

    return { tipPost, owner, creator, liker, otherUser };
  }

  describe("createPost", function () {
    it("should store a post and emit PostCreated event", async function () {
      const { tipPost, creator } = await loadFixture(deployTipPostFixture);

      const imageUrl = "https://example.com/image.jpg";
      const caption = "My first post";

      await expect(tipPost.connect(creator).createPost(imageUrl, caption))
        .to.emit(tipPost, "PostCreated")
        .withArgs(0, creator.address, imageUrl, caption, anyValue);

      const post = await tipPost.posts(0);
      expect(post.id).to.equal(0);
      expect(post.creator).to.equal(creator.address);
      expect(post.imageUrl).to.equal(imageUrl);
      expect(post.caption).to.equal(caption);
      expect(post.likes).to.equal(0);
      expect(post.totalEarned).to.equal(0);
    });

    it("should reject empty image URL", async function () {
      const { tipPost, creator } = await loadFixture(deployTipPostFixture);

      await expect(
        tipPost.connect(creator).createPost("", "Valid caption")
      ).to.be.revertedWith("Image URL cannot be empty");
    });

    it("should reject empty caption", async function () {
      const { tipPost, creator } = await loadFixture(deployTipPostFixture);

      await expect(
        tipPost.connect(creator).createPost("https://example.com/img.jpg", "")
      ).to.be.revertedWith("Caption cannot be empty");
    });

    it("should increment postCount on each creation", async function () {
      const { tipPost, creator } = await loadFixture(deployTipPostFixture);

      await tipPost.connect(creator).createPost("https://example.com/1.jpg", "Post 1");
      await tipPost.connect(creator).createPost("https://example.com/2.jpg", "Post 2");

      expect(await tipPost.postCount()).to.equal(2);
    });
  });

  describe("likePost", function () {
    async function deployWithPostFixture() {
      const base = await deployTipPostFixture();
      await base.tipPost
        .connect(base.creator)
        .createPost("https://example.com/image.jpg", "Test post");
      return base;
    }

    it("should transfer ETH to creator and emit PostLiked", async function () {
      const { tipPost, creator, liker } = await loadFixture(deployWithPostFixture);
      const likeCost = await tipPost.likeCost();

      const creatorBalanceBefore = await hre.ethers.provider.getBalance(creator.address);

      await expect(
        tipPost.connect(liker).likePost(0, { value: likeCost })
      )
        .to.emit(tipPost, "PostLiked")
        .withArgs(0, liker.address, creator.address, likeCost);

      const creatorBalanceAfter = await hre.ethers.provider.getBalance(creator.address);
      expect(creatorBalanceAfter - creatorBalanceBefore).to.equal(likeCost);

      const post = await tipPost.posts(0);
      expect(post.likes).to.equal(1);
      expect(post.totalEarned).to.equal(likeCost);
      expect(await tipPost.totalEarnedByUser(creator.address)).to.equal(likeCost);
    });

    it("should reject double like", async function () {
      const { tipPost, liker } = await loadFixture(deployWithPostFixture);
      const likeCost = await tipPost.likeCost();

      await tipPost.connect(liker).likePost(0, { value: likeCost });

      await expect(
        tipPost.connect(liker).likePost(0, { value: likeCost })
      ).to.be.revertedWith("Already liked");
    });

    it("should reject self-like", async function () {
      const { tipPost, creator } = await loadFixture(deployWithPostFixture);
      const likeCost = await tipPost.likeCost();

      await expect(
        tipPost.connect(creator).likePost(0, { value: likeCost })
      ).to.be.revertedWith("Cannot like your own post");
    });

    it("should reject insufficient ETH", async function () {
      const { tipPost, liker } = await loadFixture(deployWithPostFixture);

      await expect(
        tipPost.connect(liker).likePost(0, { value: hre.ethers.parseEther("0.00001") })
      ).to.be.revertedWith("Insufficient ETH sent");
    });

    it("should reject like on nonexistent post", async function () {
      const { tipPost, liker } = await loadFixture(deployWithPostFixture);
      const likeCost = await tipPost.likeCost();

      await expect(
        tipPost.connect(liker).likePost(99, { value: likeCost })
      ).to.be.revertedWith("Post does not exist");
    });
  });

  describe("getAllPosts", function () {
    it("should return all posts", async function () {
      const { tipPost, creator } = await loadFixture(deployTipPostFixture);

      await tipPost.connect(creator).createPost("https://example.com/1.jpg", "Post 1");
      await tipPost.connect(creator).createPost("https://example.com/2.jpg", "Post 2");

      const allPosts = await tipPost.getAllPosts();
      expect(allPosts.length).to.equal(2);
      expect(allPosts[0].caption).to.equal("Post 1");
      expect(allPosts[1].caption).to.equal("Post 2");
    });

    it("should return empty array when no posts", async function () {
      const { tipPost } = await loadFixture(deployTipPostFixture);
      const allPosts = await tipPost.getAllPosts();
      expect(allPosts.length).to.equal(0);
    });
  });

  describe("checkLiked", function () {
    it("should return false before liking and true after", async function () {
      const { tipPost, creator, liker } = await loadFixture(deployTipPostFixture);
      await tipPost.connect(creator).createPost("https://example.com/img.jpg", "Post");

      expect(await tipPost.checkLiked(0, liker.address)).to.equal(false);

      const likeCost = await tipPost.likeCost();
      await tipPost.connect(liker).likePost(0, { value: likeCost });

      expect(await tipPost.checkLiked(0, liker.address)).to.equal(true);
    });
  });
});

// Helper to get approximate block timestamp (used loosely in event matching)
async function getTimestamp(): Promise<number> {
  const block = await hre.ethers.provider.getBlock("latest");
  return block?.timestamp ?? 0;
}
