const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

const authMiddleware = (role) => {
  return (req, res, next) => {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    // Check if token is missing
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, secret);
      req.user = decoded;

      // Check if the user has the required role
      if (role && req.user.role !== role) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Token verification error:", error); // Log the error for debugging
      return res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = authMiddleware;
