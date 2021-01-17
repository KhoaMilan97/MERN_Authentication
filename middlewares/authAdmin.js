const User = require("../models/userModel");

const authAdmin = async (req, res, next) => {
  try {
    console.log(req.user);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json({ msg: "Please login now!" });
    if (user.role !== 1)
      return res.status(400).json({ msg: "Admin resource, access denided." });
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error.message });
  }
};

module.exports = authAdmin;
