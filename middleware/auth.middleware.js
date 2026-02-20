import jwt from "jsonwebtoken";

export default function auth(req, res) {
  try {
    const authHeader = req.headers.authorization;

    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
      res.status(401).json({ message: "No token, authorization denied" });
      return null;
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET missing");
      res.status(500).json({ message: "Server misconfiguration" });
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return { id: decoded.id };

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
    return null;
  }
}