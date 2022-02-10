const {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} = require("apollo-server");
const Post = require("../../models/Post");

const postsResolvers = {
  Query: {
    posts: async () => {
      const posts = await Post.find().sort({ createdAt: -1 });

      return posts;
    },
    post: async (_, args) => {
      const { postId } = args;

      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }

      return post;
    },
  },
  Mutation: {
    createPost: async (_, args, context) => {
      const { body } = args;
      const { user } = context;

      if (body.trim() === "") {
        throw new UserInputError("Empty post", {
          errors: {
            body: "Post body must not be empty",
          },
        });
      }

      if (!user) {
        throw new AuthenticationError("Authentication failed");
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();

      return post;
    },
    deletePost: async (_, args, context) => {
      const { postId } = args;
      const { user } = context;

      if (!user) {
        throw new AuthenticationError("Authentication failed");
      }

      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }

      if (user.username !== post.username) {
        throw new ForbiddenError("Action not allowed");
      }

      await post.delete();
      return "Post deleted successfully";
    },
    likePost: async (_, args, context) => {
      const { postId } = args;
      const { user } = context;

      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }

      const foundLike = post.likes.find(
        (like) => like.username === user.username
      );

      if (!foundLike) {
        post.likes.push({
          username: user.username,
          createdAt: new Date().toISOString(),
        });
      } else {
        post.likes = post.likes.filter(
          (like) => like.username !== user.username
        );
      }

      await post.save();
      return post;
    },
  },
};

module.exports = { postsResolvers };
