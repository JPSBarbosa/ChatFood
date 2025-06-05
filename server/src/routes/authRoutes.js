const express = require('express');

module.exports = (authController) => {
  const router = express.Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
};