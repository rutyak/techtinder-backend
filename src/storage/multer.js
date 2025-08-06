const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_images",
    allowed_formats: ["*"],
    resource_type: "auto",
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
});

module.exports = upload;
