import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    passwordEncrypted: { type: String, required: true },
    encryptionAlgorithm: { type: String, required: true },
    encryptionKey: { type: String, required: true },
    encryptionIV: { type: String },
    tc: { type: Boolean, required: true },
});

const userModel = mongoose.model("User", userSchema);

export default userModel;
