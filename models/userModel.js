const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter your name!"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Please enter your email!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password!"],
    },
    role: {
      type: Number,
      default: 0, // 0 = user, 1 = admin
    },
    avatar: {
      type: String,
      default:
        "https://res.cloudinary.com/khoa-milan/image/upload/v1609837909/avatar/pngtree-character-default-avatar-image_2237203_jpyjx7.jpg",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
