import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Corrected reference to 'User' model
    createdAt: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    comments: [{ 
        text: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Corrected reference to 'User' model
        createdAt: { type: Date, default: Date.now }
    }]
});

const postModal = mongoose.model("Post", postSchema);

export default postModal;

