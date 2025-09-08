// import express from 'express';
// import userAuth from '../middleware/userAuth.js';
// import { getUsersData } from '../controllers/userController.js';

// const userRouter = express.Router();

// userRouter.get('/data', userAuth,getUsersData);

// export default userRouter;

import express from 'express';
import multer from 'multer';
import path from 'path';
import userAuth from '../middleware/userAuth.js';
import { getUsersData, uploadProfilePic } from '../controllers/userController.js';

const userRouter = express.Router();

// multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // make sure this folder exists in your backend root
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// existing route
userRouter.get('/data', userAuth, getUsersData);

// ✅ new route for profile picture upload
userRouter.post('/upload-profile-pic', userAuth, upload.single("profilePic"), uploadProfilePic);

export default userRouter;
