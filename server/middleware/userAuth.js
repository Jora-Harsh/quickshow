import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.user = user; // ✅ attach full user object
    req.userId = user._id; // optional
    req.isAdmin = decoded.isAdmin;

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default userAuth;
