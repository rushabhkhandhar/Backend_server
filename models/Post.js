import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 }, // Number of likes
    comments: [{ 
        text: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        createdAt: { type: Date, default: Date.now }
    }] // Array of comments
});

const postModal = mongoose.model("Post", postSchema);

export default postModal;
