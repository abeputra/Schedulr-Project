import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization; // Support different cases

  if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) {
    console.error("Access denied. No token provided.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT Error:", error.message); // More detailed error logging
    const message = error.name === "TokenExpiredError" 
      ? "Expired token. Please log in again." 
      : "Invalid token.";
    return res.status(401).json({ error: message });
  }
};

export default verifyToken;
