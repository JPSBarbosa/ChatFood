// src/config/multerConfig.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

module.exports = {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', 'public', 'uploads'),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    }
  })
};