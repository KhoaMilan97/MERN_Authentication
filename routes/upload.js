const router = require("express").Router();

const uploadImage = require("../middlewares/uploadImage");
const auth = require("../middlewares/auth");

const { uploadAvatar } = require("../controllers/uploadController");

router.post("/upload-avatar", uploadImage, auth, uploadAvatar);

module.exports = router;
