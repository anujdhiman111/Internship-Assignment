const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { User, Post } = require("./Models/User");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

const app = express();
const port = 3000;

app.use(bodyParser.json());

const uri =
  "mongodb+srv://adhiman111111:anujdhiman@cluster0.rpq69hv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "dana80@ethereal.email",
      pass: "W33twge7NQydqVr6bc",
    },
  });

  const mailOptions = await transporter.sendMail({
    from: '"Anuj Dhiman" <anujdhiman@gmail.com>',
    to: to,
    subject: subject,
    text: text,
  });

  console.log("Message Sent");
};

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const code = randomstring.generate({ length: 4, charset: "numeric" });
    user.resetPasswordCode = code;
    await user.save();

    const subject = "Password Reset Code";
    const text = `Your password reset code is: ${code}`;
    await sendEmail(email, subject, text);

    return res
      .status(200)
      .json({ message: "Password reset code sent to your email", code });
  } catch (error) {
    console.error("Error sending password reset code:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }
    if (user.resetPasswordCode != code) {
      return res.status(400).json({ message: "Invalid reset code" });
    }

    user.password = newPassword;
    user.resetPasswordCode = null;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find();
    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/addPost", async (req, res) => {
  const { userId, content } = req.body;

  try {
    const newPost = new Post({ userId, content });
    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/post/:userId/:postId", async (req, res) => {
  const userId = req.params.userId;
  const postId = req.params.postId;
  const { newContent } = req.body;

  try {
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId, userId },
      { content: newContent },
      { new: true }
    );

    if (!updatedPost) {
      return res
        .status(404)
        .json({ message: "Post not found or not authorized to update" });
    }
    console.log(updatedPost, "fff");
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/post/:userId/:postId", async (req, res) => {
  const userId = req.params.userId;
  const postId = req.params.postId;

  try {
    const deletedPost = await Post.findOneAndDelete({ _id: postId, userId });

    if (!deletedPost) {
      return res
        .status(404)
        .json({ message: "Post not found or not authorized to delete" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/post/like/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/post/comment/:postId", async (req, res) => {
  const postId = req.params.postId;
  const { comment } = req.body;

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: comment } },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json(updatedPost);
  } catch (error) {
    console.error("Error adding comment to post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
