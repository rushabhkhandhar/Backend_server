import express from 'express';
import { 
    userRegistration, 
    userLogin, changeUserPassword,
    sendEmailResetPassword,
    userPasswordReset,
    createPost,
    getPostById,
    getAllPosts,
    updatePost,
    deletePost,
    likePost,
    addComment
} from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
const router = express.Router();


// Route level Middleware - To protect route.
router.use('/changepassword', checkUserAuth);


// Public Routes
router.post('/register', userRegistration);
router.post('/login', userLogin);
router.post('/send-reset-password', sendEmailResetPassword)
router.post('/reset/password/:id/:token', userPasswordReset)

router.post('/posts', checkUserAuth, createPost); // Create a new post
router.get('/posts',checkUserAuth, getAllPosts); // Get all posts
router.get('/posts/:id', checkUserAuth,getPostById); // Get post by ID
router.put('/posts/:id', checkUserAuth, updatePost); // Update a post
router.delete('/posts/:id', checkUserAuth, deletePost); // Delete a post
router.put('/posts/:id/like', checkUserAuth, likePost);//Like a post
router.post('/posts/:id/comment', checkUserAuth, addComment); //Add a comment to a post

// Protected Routes
router.post('/changepassword', checkUserAuth,changeUserPassword);


export default router;
