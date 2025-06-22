const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const multerConfig = require('../config/multerConfig'); // <-- importe aqui

const upload = multer(multerConfig);

module.exports = (userController) => {
  const router = Router();

  router.use(authMiddleware);
  router.get('/perfil', userController.getProfile);

  router.put('/perfil', upload.single('profilePic'), userController.updateProfile); // <-- corrige aqui

  return router;
};
