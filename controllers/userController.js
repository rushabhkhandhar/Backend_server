import userModal from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import postModal from "../models/Post.js";

// Register new user
const userRegistration = async (req, res) => {
  const { name, email, password, cpassword, tc } = req.body;
  const user = await userModal.findOne();
  if (user) {
    user.decryptEmail();
    if (user.email === email) {
      res.send({ "status": "failed", "message": "Email already exists" });
      return;
    }
  }
  if (name && email && password && cpassword && tc) {
    if (password === cpassword) {
      try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        const createUser = new userModal({
          name: name,
          email: email,
          password: hashPassword,
          tc: tc
        });

        const newUser = await createUser.save();
        const token = jwt.sign({ userID: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
        res.status(201).json({ user: newUser, token });

      } catch (error) {
        res.send({ "status": "failed", "message": "Unable to register" });
      }
    } else {
      res.send({ "status": "failed", "message": "Password and confirm password not matched" });
    }
  } else {
    res.send({ "status": "failed", "message": "All Fields are required" });
  }
};

// User login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await userModal.findOne();
      if (user) {
        user.decryptEmail();
        if (user.email === email) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (isMatch) {
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' });
            res.status(200).json({ user, token });
          } else {
            res.send({ "status": "failed", "message": "Invalid email or password" });
          }
        } else {
          res.send({ "status": "failed", "message": "Invalid email or password" });
        }
      } else {
        res.send({ "status": "failed", "message": "You are not registered" });
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are required" });
    }
  } catch (error) {
    res.send({ "status": "failed", "message": "Unable to login" });
  }
};

// Change user password
const changeUserPassword = async (req, res) => {
  const { password, cpassword } = req.body;
  if (password && cpassword) {
    if (password === cpassword) {
      const salt = await bcrypt.genSalt(10);
      const newHashPassword = await bcrypt.hash(password, salt);
      await userModal.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } });
      res.send({ "status": "200", "message": "Change password successfully" });
    } else {
      res.send({ "status": "failed", "message": "Password and confirm password not matched" });
    }
  } else {
    res.send({ "status": "failed", "message": "All Fields are required" });
  }
};

// Send email for password reset
const sendEmailResetPassword = async (req, res) => {
  const { email } = req.body;
  if (email) {
    const user = await userModal.findOne();
    if (user) {
      user.decryptEmail();
      if (user.email === email) {
        const secret = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '1d' });
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
        console.log(link, 'starting token');
        res.send({ "status": "success", "message": "Email sent successfully" });
      } else {
        res.send({ "status": "failed", "message": "Email does not exist" });
      }
    } else {
      res.send({ "status": "failed", "message": "Email does not exist" });
    }
  } else {
    res.send({ "status": "failed", "message": "Email is required" });
  }
};

// Reset user password
const userPasswordReset = async (req, res) => {
  const { password, cpassword } = req.body;
  const { id, token } = req.params;
  const user = await userModal.findById(id);
  const new_secret = user._id + process.env.JWT_SECRET_KEY;
  try {
    jwt.verify(token, new_secret);
    if (password && cpassword) {
      if (password === cpassword) {
        const salt = await bcrypt.genSalt(10);
        const newHashPassword = await bcrypt.hash(password, salt);
        await userModal.findByIdAndUpdate(id, { $set: { password: newHashPassword } });
        res.send({ "status": "200", "message": "Password reset successfully" });
      } else {
        res.send({ "status": "failed", "message": "Passwords do not match" });
      }
    }
  } catch (error) {
    res.send({ "status": "failed", "message": "Token does not match" });
  }
};

// Create a new post
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
};

// Get all posts
const getAllPosts = async (req, res) => {
  try {
    const posts = await postModal.find().populate('author', 'name email');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Unable to retrieve posts", error: error.message });
  }
};

// Get post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await postModal.findById(id).populate('author', 'name email');
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {res.status (500).json({ message: "Unable to retrieve post", error: error.message });
  }
};

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
};

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
};

// Like a post
const likePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const post = await postModal.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes += 1;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment to a post
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
