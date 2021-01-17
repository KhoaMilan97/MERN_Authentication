const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendMail = require("./sendMail");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const fetch = require("node-fetch");

const client = new OAuth2(process.env.MAILING_SERVICE_CLIENT_ID);

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

const createActivationToken = (payload) => {
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "5d",
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validate
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Please fill in all fields" });
    if (!validateEmail(email))
      return res.status(400).json({ msg: "Invalid Emails" });

    const user = await User.findOne({ email });
    if (user)
      return res.status(400).json({ msg: "This email already exists." });
    if (password.length < 6)
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters." });

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = { name, email, password: hashPassword };

    const activation_token = createActivationToken(newUser);

    const url = `${process.env.CLIENT_URL}/user/activate/${activation_token}`;
    sendMail(email, url, "Verify your email address");

    res.json({ msg: "Register Success! Please activate your email to start." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.activeEmail = async (req, res) => {
  try {
    const { activationToken } = req.body;
    const user = jwt.verify(
      activationToken,
      process.env.ACTIVATION_TOKEN_SECRET
    );
    const { name, email, password } = user;

    const check = await User.findOne({ email });
    if (check)
      return res.status(400).json({ msg: "This email already exists." });

    const newUser = await new User({ name, email, password }).save();
    console.log(newUser);
    res.json({ msg: "Account is activated!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email doesn't exists." });
    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword)
      return res.status(400).json({ msg: "Password is incorrect." });

    const refreshToken = createRefreshToken({ id: user._id });
    res.cookie("refreshtoken", refreshToken, {
      httpOnly: true,
      path: "/user/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ msg: "Login success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.getAccessToken = (req, res) => {
  try {
    const refreshToken = req.cookies.refreshtoken;
    if (!refreshToken)
      return res.status(400).json({ msg: "Please login now!" });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(400).json({ msg: "Please login now!" });
      const accessToken = createAccessToken({ id: user.id });
      res.json({ accessToken });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ msg: "This email doesn't exists." });

    const accessToken = createAccessToken({ id: user._id });
    const url = `${process.env.CLIENT_URL}/user/reset/${accessToken}`;
    sendMail(email, url, "Reset Password");

    res.json({ msg: "Re-send the password. Please check your email." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const hashPassword = await bcrypt.hash(password, 12);
    console.log(req.user);

    await User.findByIdAndUpdate(
      { _id: req.user.id },
      { password: hashPassword }
    );

    res.json({ msg: "Password Successfully changed!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.getUserInfor = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.logOut = async (req, res) => {
  try {
    res.clearCookie("refreshtoken", { path: "/user/refresh-token" });
    res.json({ msg: "Logged out" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    await User.findByIdAndUpdate({ _id: req.user.id }, { name, avatar });
    res.json({ msg: "Update Success." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.updateUsersRole = async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate({ _id: req.params.id }, { role });
    res.json({ msg: "Update Success." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndRemove(req.params.id);
    res.json({ msg: "Delete Success." });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    const verify = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.MAILING_SERVICE_CLIENT_ID,
    });
    const { email, email_verified, name, picture } = verify.payload;

    const password = email + process.env.GOOGLE_SECRET;

    const hashPassword = await bcrypt.hash(password, 12);

    if (!email_verified)
      return res.status(400).json({ msg: "This email verification fail." });

    const user = await User.findOne({ email });
    if (user) {
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refreshToken = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh-token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ msg: "Login success" });
    } else {
      const newUser = await new User({
        name,
        email,
        avatar: picture,
        password: hashPassword,
      }).save();

      const refreshToken = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh-token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ msg: "Login success" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.facebookLogin = async (req, res) => {
  try {
    const { userID, accessToken } = req.body;
    const URI = `https://graph.facebook.com/${userID}?fields=id,name,email,picture&access_token=${accessToken}`;

    const data = await fetch(URI)
      .then((res) => res.json())
      .then((data) => data);

    const { name, email, picture } = data;

    const password = email + process.env.FACEBOOK_SECRET;

    const hashPassword = await bcrypt.hash(password, 12);

    const user = await User.findOne({ email });
    if (user) {
      const checkPassword = await bcrypt.compare(password, user.password);
      if (!checkPassword)
        return res.status(400).json({ msg: "Password is incorrect." });

      const refreshToken = createRefreshToken({ id: user._id });
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh-token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ msg: "Login success" });
    } else {
      const newUser = await new User({
        name,
        email,
        avatar: picture.data.url,
        password: hashPassword,
      }).save();

      const refreshToken = createRefreshToken({ id: newUser._id });
      res.cookie("refreshtoken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh-token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ msg: "Login success" });
    }
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
