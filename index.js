const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");

const { typeDefs } = require("./graphql/type-defs");
const { resolvers } = require("./graphql/resolvers");
const { getUser } = require("./utils/auth");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const authHeader = req.headers.authorization;
    const user = getUser(authHeader);
    return { user };
  },
});

const bootstrap = async () => {
  await mongoose.connect(
    "mongodb+srv://database-admin:hkfQYZu7tXO28zyN@kronliu.hkvxe.mongodb.net/socialMediaDB?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  );
  console.log("CONNECTED TO MONGODB");

  const res = await server.listen();
  console.log(`YOUR API IS RUNNING AT PORT: ${res.port}`);
};

bootstrap();
