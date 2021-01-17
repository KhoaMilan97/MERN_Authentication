const router = require("express").Router();

// middleware
const auth = require("../middlewares/auth");
const authAdmin = require("../middlewares/authAdmin");

// controller
const {
  register,
  activeEmail,
  login,
  getAccessToken,
  forgotPassword,
  resetPassword,
  getUserInfor,
  getAllUser,
  logOut,
  updateUser,
  updateUsersRole,
  deleteUser,
  googleLogin,
  facebookLogin,
} = require("../controllers/userController");

router.post("/register", register);
router.post("/activation", activeEmail);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/facebook-login", facebookLogin);
router.post("/refresh-token", getAccessToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", auth, resetPassword);
router.get("/user-infor", auth, getUserInfor);
router.get("/all-user", auth, authAdmin, getAllUser);
router.get("/logout", logOut);
router.patch("/update", auth, updateUser);
router.patch("/update-role/:id", auth, authAdmin, updateUsersRole);
router.delete("/delete-user/:id", auth, authAdmin, deleteUser);

module.exports = router;
