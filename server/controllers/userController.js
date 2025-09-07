import e from "express";
import userModel from "../models/userModel.js";

export const getUsersData = async (req, res) => {
    try {
        const  userId  = req.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized Access' });
        }

        res.status(200).json({
            success: true, usersData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });

    }
    catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}