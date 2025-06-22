// src/controllers/userController.js

// Exportamos a função que recebe o 'userService'
module.exports = (userService) => ({

  // Este método você já tem e está correto
  async getProfile(req, res) {
    try {
      // req.userId vem do nosso authMiddleware
      const result = await userService.getUserProfile(req.userId);
      
      if (result.error) {
        return res.status(result.status).json(result.body);
      }
      
      res.status(result.status).json(result.body);

    } catch (err) {
      console.error("Erro no controller ao buscar perfil:", err);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }, // <--- Não se esqueça da vírgula aqui para separar as funções

  // <<< ESTE É O MÉTODO QUE ESTAVA FALTANDO >>>
  async updateProfile(req, res) {
    try {
      const { nome } = req.body;
      // O objeto 'req.file' é adicionado pelo middleware 'multer'
      const file = req.file; 
      
      // req.userId também vem do authMiddleware
      const result = await userService.updateUserProfile(req.userId, nome, file);
      
      res.status(result.status).json(result.body);
      
      console.log('Arquivo recebido:', req.file);

    } catch (err) {
      console.error("Erro ao atualizar perfil no controller:", err);
      res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
});