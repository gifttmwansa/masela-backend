const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuid } = require("uuid");

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(__dirname, "uploads");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    cb(null, `${uuid()}${ext}`);
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

function publicUrlFor(filename) {
  if (!filename) return null;

  const base = process.env.PUBLIC_URL || "";

  return `${base}/uploads/${filename}`;
}

module.exports = {
  upload,
  UPLOAD_DIR,
  publicUrlFor,
};