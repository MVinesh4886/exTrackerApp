const jwt = require("jsonwebtoken");

const generateToken = (id, name, emailId, isPremiumUser) => {
  return jwt.sign(
    { id, name, emailId, isPremiumUser },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "10d",
    }
  );
};

module.exports = generateToken;
