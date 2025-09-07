import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../configs/nodemailer.js';
import { use } from 'react';


export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });
        await user.save(); // save user to database

        // generate JWT token

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
            overwrite: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        //Send Welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to QuickShow!',
            text: `Hello ${email},\n\nWelcome to QuickShow! We're excited to have you on board.\n\nBest regards,\nThe QuickShow Team`
        }
        await transporter.sendMail(mailOptions);

        return res.status(201).json({ success: true, message: 'User registered successfully', user: { id: user._id, name: user.name, email: user.email, isAccountVerified: user.isAccountVerified  } });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });

    }
}

// login controller
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid password' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/',
            overwrite: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, message: 'Login successful',token, user: { id: user._id, name: user.name, email: user.email,isAccountVerified: user.isAccountVerified } });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// logout controller
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        });
        return res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// send verification otp
export const sendVerifyOtp = async (req, res) => {
    try {
        const  userId  = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isAccountVerified) {
            return res.status(400).json({ success: false, message: 'User is already verified' });
        }

        // generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        // set otp and expiry
        user.verifyOtp = otp; // ideally hash before saving
        user.verifyOtpExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hrs

        await user.save();

        // send otp via email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your account',
            text: `Your OTP for account verification is ${otp}. It is valid for 24 hours.`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'OTP sent to your email' });

    } catch (error) {
        console.error("Error sending verification OTP:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const verifyEmail = async (req, res) => {
  try {
    const userId = req.userId; // ✅ safer, from JWT
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "Missing OTP." });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // already verified check
    if (user.isAccountVerified) {
      return res.status(400).json({ success: false, message: "Account already verified." });
    }

    // otp expiry check
    if (user.verifyOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP Expired." });
    }

    // otp match check
    if (user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // mark as verified
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpiry = 0;
    await user.save();

    return res.status(200).json({ success: true, message: "Account verified successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// // check if user is authenticated
// export const isAuthenticated = async (req, res) => {
//     try {
//         return res.status(200).json({ success: true, message: 'User is authenticated', user: req.userId });
//     } catch (error) {
//         return res.status(500).json({ success: false, message: error.message });
//     }
// }
// check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
    const userId = req.userId; // assuming middleware sets this from JWT
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    const user = await userModel.findById(userId).select("name email isAccountVerified"); // fetch name and email
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//send password reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        // generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        // set otp and expiry
        user.resetOtp = otp; // ideally hash before saving
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 mins

        await user.save();  // save user to database

        // send otp via email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is ${otp}. It is valid for 15 Minutes.`
        };
        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

// reset user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found' });
        }
        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: 'OTP Expired' });
        }
        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.status(200).json({ success: true, message: 'Password reset successful' });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}