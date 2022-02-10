const {
  generateAccessToken,
  encryptPassword,
  comparePasswords,
} = require("../../utils/auth");
const User = require("../../models/User");

const { UserInputError, AuthenticationError } = require("apollo-server");
const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../utils/validators");

const usersResolvers = {
  Mutation: {
    register: async (_, args) => {
      const { username, email, password, confirmPassword } = args.registerInput;

      const { valid, errors } = validateRegisterInput(
        username,
        email,
        password,
        confirmPassword
      );

      if (!valid) {
        throw new UserInputError("Validation error/s", { errors });
      }

      let user = await User.findOne({ username });

      if (user) {
        throw new UserInputError("Validation error/s", {
          errors: {
            user: "User already exists",
          },
        });
      }

      const encryptedPassword = await encryptPassword(password);

      const newUser = new User({
        email,
        username,
        password: encryptedPassword,
        createdAt: new Date().toISOString(),
      });

      user = await newUser.save();

      const token = generateAccessToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    login: async (_, args) => {
      const { username, password } = args.loginInput;
      const { errors, valid } = validateLoginInput(username, password);

      const user = await User.findOne({ username });

      if (!valid) {
        throw new UserInputError("Validation error/s", { errors });
      }

      const match = await comparePasswords(password, user.password);

      if (!user || !match) {
        throw new AuthenticationError("Authentication failed", {
          errors: {
            user: "Authentication failed",
          },
        });
      }

      const token = generateAccessToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
  },
};

module.exports = { usersResolvers };
