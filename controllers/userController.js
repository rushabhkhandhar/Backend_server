import userModel from "../models/User.js";
import postModal from "../models/Post.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userRegistration = async (req, res) => {
    try {
        const { name, email, password, cpassword, tc } = req.body;
        const user = await userModel.findOne({ email: email });
        if (user) {
            res.send({ "status": "failed", "message": "Email already exists" });
        } else {
            if (name && email && password && cpassword && tc) {
                if (password === cpassword) {
                    const salt = await bcrypt.genSalt(10);
                    const hashPassword = await bcrypt.hash(password, salt);
                    const encryptionKey = crypto.randomBytes(32); 
                    const iv = crypto.randomBytes(16); 
                    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
                    let encryptedPassword = cipher.update(hashPassword, 'utf8', 'hex');
                    encryptedPassword += cipher.final('hex');
                    const createUser = new userModel({
                        name: name,
                        email: email,
                        passwordEncrypted: encryptedPassword,
                        encryptionAlgorithm: 'aes-256-cbc',
                        encryptionKey: encryptionKey.toString('hex'),
                        encryptionIV: iv.toString('hex'),
                        tc: tc
                    });
                    const newUser = await createUser.save();
                    res.status(201).json({ user: newUser });
                } else {
                    res.send({ "status": "failed", "message": "password and confirm password not matched" });
                }
            } else {
                res.send({ "status": "failed", "message": "All Fields are required" });
            }
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.send({ "status": "failed", "message": "Unable to register" });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email && password) {
            const user = await userModel.findOne({ email: email });
            if (user) {
                const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(user.encryptionKey, 'hex'), Buffer.from(user.encryptionIV, 'hex'));
                let decryptedPassword = decipher.update(user.passwordEncrypted, 'hex', 'utf8');
                decryptedPassword += decipher.final('utf8');
                const isMatch = await bcrypt.compare(password, decryptedPassword);
                if (isMatch) {
                    const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
                    res.status(200).json({ user, token });
                } else {
                    res.send({ "status": "failed", "message": "invalid email or password" });
                }
            } else {
                res.send({ "status": "failed", "message": "You are not registered" });
            }
        } else {
            res.send({ "status": "failed", "message": "All Fields are required" });
        }
    } catch (error) {
        console.error("Error logging in user:", error);
        res.send({ "status": "failed", "message": "Unable to login" });
    }
};
// change user password 
const changeUserPassword = async (req, res) => {
    const { password, cpassword } = req.body;
    if (password && cpassword) {
        if (password === cpassword) {
            const salt = await bcrypt.genSalt(10);
            const newHashPassword = await bcrypt.hash(password, salt);
            await userModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
            res.send({ "status": "200", "message": "change password successfully" });

        } else {
            res.send({ "status": "failed", "message": "password and confirm password not matched" });
        }
    } else {
        res.send({ "status": "failed", "message": "All Fields are required" });
    }
}



// Reset password, or forget password to send email...
const sendEmailResetPassword = async (req, res) => {
    const { email } = req.body;
    if (email) {
        const user = await userModel.findOne({ email: email });
        if (user) {
            const secret = user._id + process.env.JWT_SECRET_KEY;
            const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '1d' });
            const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
            console.log(link, 'starting token');
            res.send({ "status": "success", "message": "Email sent successfully" });
        } else {
            res.send({ "status": "failed", "message": "Email does not exist" });
        }
    } else {
        res.send({ "status": "failed", "message": "Email is required" });
    }
}

// After email send allow password reset..
const userPasswordReset = async (req, res) => {
    const { password, cpassword } = req.body;
    const { id, token } = req.params;
    const user = await userModel.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
        console.log(token, "xxxxx", new_secret);
        jwt.verify(token, new_secret);
        if (password && cpassword) {
            if (password === cpassword) {
                const salt = await bcrypt.genSalt(10);
                const newHashPassword = await bcrypt.hash(password, salt);
                await userModel.findByIdAndUpdate(id, { $set: { password: newHashPassword } });
                res.send({ "status": "200", "message": "Password reset successfully" });
            } else {
                res.send({ "status": "failed", "message": "Passwords do not match" });
            }
        }
    } catch (error) {
        res.send({ "status": "failed", "message": "Token does not match" });
    }
}

const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const newPost = new postModal({
            content: content,
            author: req.user._id
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: "Unable to create post", error: error.message });
    }
}

// Get all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await postModal.find().populate('author', 'name email');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: "Unable to retrieve posts", error: error.message });
    }
}

// Get post by ID
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await postModal.findById(id).populate('author', 'name email');
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: "Unable to retrieve post", error: error.message });
    }
}

// Update a post
const updatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const updatedPost = await postModal.findByIdAndUpdate(id, { content: content }, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: "Unable to update post", error: error.message });
    }
}

// Delete a post
const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await postModal.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Unable to delete post", error: error.message });
    }
}


// Like a post
const likePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await postModal.findById(postId); // Use the postModal
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.likes += 1;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addComment = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized user" });
        }
        const { text } = req.body;
        const postId = req.params.id;

        const post = await postModal.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            text: text,
            author: req.user._id
        };

        post.comments.push(newComment);

        await post.save();

        res.status(201).json(post);
    } catch (error) {

        res.status(500).json({ message: error.message });
    }
};

export {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    likePost,
    addComment,
    userRegistration,
    userLogin,
    changeUserPassword,
    sendEmailResetPassword,
    userPasswordReset
};