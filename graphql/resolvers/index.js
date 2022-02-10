const { postsResolvers } = require("./post");
const { usersResolvers } = require("./user");
const { commentsResolvers } = require("./comment");

const resolvers = {
  Query: {
    ...postsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...commentsResolvers.Mutation,
  },
};

module.exports = { resolvers };
