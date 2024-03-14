const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  resetPasswordCode: { type: String },
});

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  comments: [{ type: String }],
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

module.exports = { User, Post };
