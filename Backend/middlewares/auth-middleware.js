import jwt from 'jsonwebtoken';
import userModal from '../models/User.js';

const checkUserAuth = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;
    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(" ")[1];
            // Verify token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
            // Get user from token
            req.user = await userModal.findById(userID).select("-password");
            next();
        } catch (error) {
            res.status(401).send({ message: "Unauthorized user" });
        }
    }
    if (!token) {
        res.status(401).send({ message: "No token, unauthorized user" });
    }
}

export default checkUserAuth;