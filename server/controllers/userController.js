// import e from "express";
// import userModel from "../models/userModel.js";

// export const getUsersData = async (req, res) => {
//     try {
//         const  userId  = req.userId;

//         const user = await userModel.findById(userId);

//         if (!user) {
//             return res.status(401).json({ success: false, message: 'Unauthorized Access' });
//         }

//         res.status(200).json({
//             success: true, usersData: {
//                 name: user.name,
//                 isAccountVerified: user.isAccountVerified,
//             }
//         });

//     }
//     catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// }

// controllers/userController.js
// controllers/userController.js
import path from "path";
import fs from "fs";
import multer from "multer";
import userModel from "../models/userModel.js";

// ---------------------
// Ensure 'uploads' folder exists
// ---------------------
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ---------------------
// Multer configuration
// ---------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.userId || "user"}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 2 MB limit
});

// ---------------------
// Controller: Get user data
// ---------------------
export const getUsersData = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isAccountVerified: user.isAccountVerified,
        profilePic: user.profilePic || "",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------
// Controller: Upload / update profile picture
// ---------------------
export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await userModel.findById(req.userId);
    if (!user) {
      // cleanup uploaded file if user not found
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Remove old profile pic (if local file)
    if (user.profilePic && user.profilePic.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), user.profilePic);
      try {
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch (err) {
        // ignore cleanup error
      }
    }

    // Save new profile pic path
    user.profilePic = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("uploadProfilePic error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
