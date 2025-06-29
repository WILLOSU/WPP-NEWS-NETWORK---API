

import bcrypt from "bcrypt";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  avatar: {
    type: String,
    required: false,
  },
  background: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['common', 'admin'],
    default: 'common',
    required: true,
  },
  
  isActive: {
    type: Boolean,
    default: true, 
    required: true,
  },

});

// Criptografar senha antes de salvar
UserSchema.pre("save", async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;