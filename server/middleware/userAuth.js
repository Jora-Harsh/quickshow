import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    try {
        // Get token from cookie OR Authorization header
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded?.id) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        req.userId = decoded.id; // ✅ attach to req, not req.body
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export default userAuth;
