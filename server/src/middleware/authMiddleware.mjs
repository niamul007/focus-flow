import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
    console.log("Checking Secret:", process.env.JWT_SECRET);
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // 2. The Split (Important!)
    // If the header is "Bearer abc.123.xyz", 
    // .split(" ") creates ["Bearer", "abc.123.xyz"]
    // We want index [1]
    const token = authHeader.split(" ")[1];

    // 3. The Verification
    // Make sure process.env.JWT_SECRET is exactly the same as in your controller
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Attach and Move on
    req.user = decoded;
    next();
    
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    // This is the error you are seeing in Thunder Client
    res.status(401).json({ message: "Token not valid" });
  }
};