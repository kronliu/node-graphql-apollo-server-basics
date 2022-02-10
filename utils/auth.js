const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { AuthenticationError } = require("apollo-server");

const SALT_ROUNDS = 10;
const SECRET = "secret";

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    SECRET
  );
};

const getUser = (authHeader) => {
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, "secret");
        return user;
      } catch (err) {
        throw new AuthenticationError("Invalid/expired token");
      }
    }
  }
};

const encryptPassword = async (password) => {
  const encryptedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  return encryptedPassword;
};

const comparePasswords = async (password, encryptedPassword) => {
  const result = await bcrypt.compare(password, encryptedPassword);
  return result;
};

module.exports = {
  generateAccessToken,
  getUser,
  encryptPassword,
  comparePasswords,
};
