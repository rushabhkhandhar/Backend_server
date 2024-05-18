import mongoose from 'mongoose';
import crypto from 'crypto';

// Define the User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  password: { type: String, required: true, trim: true },
  tc: { type: Boolean, required: true },
});

// Function to encrypt data
function encrypt(text, secretKey) {
  const algorithm = 'aes-256-ctr';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Function to decrypt data
function decrypt(text, secretKey) {
  const algorithm = 'aes-256-ctr';
  const textParts = text.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
}

// Pre-save hook to encrypt the email
userSchema.pre('save', function (next) {
  const user = this;
  const secretKey = process.env.ENCRYPTION_KEY; 

  if (user.isModified('email')) {
    user.email = encrypt(user.email, secretKey);
  }
  next();
});

// Method to decrypt email when retrieving user
userSchema.methods.decryptEmail = function() {
  const secretKey = process.env.ENCRYPTION_KEY;
  this.email = decrypt(this.email, secretKey);
};

const userModal = mongoose.model('user', userSchema);

export default userModal;
