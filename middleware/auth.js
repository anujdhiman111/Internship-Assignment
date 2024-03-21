const jwt = require("jsonwebtoken");
const secretToken = require("../config");

const authenticateToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const decodedUser = jwt.verify(token, secretToken);
    if (decodedUser.exp && decodedUser.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({ error: "Token has expired" });
    }
    req.user = decodedUser;
    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
module.exports = authenticateToken;
