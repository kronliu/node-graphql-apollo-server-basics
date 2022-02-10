const { UserInputError, ForbiddenError } = require("apollo-server");
const Post = require("../../models/Post");

const commentsResolvers = {
  Mutation: {
    createComment: async (_, args, context) => {
      const { postId, body } = args;
      const { user } = context;

      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }

      post.comments.unshift({
        body,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      await post.save();

      return post;
    },
    deleteComment: async (_, args, context) => {
      const { postId, commentId } = args;
      const { user } = context;

      const post = await Post.findById(postId);

      if (!post) {
        throw new Error("Post not found");
      }

      const commentIndex = post.comments.findIndex(
        (comment) => comment.id === commentId
      );

      if (post.comments[commentIndex].username !== user.username) {
        throw new ForbiddenError("Action not allowed");
      }

      post.comments.splice(commentIndex, 1);
      await post.save();

      return post;
    },
  },
};

module.exports = { commentsResolvers };
