const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;

module.exports = (userRepository) => ({

  async getUserProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      return { status: 404, body: { message: "Usuário não encontrado." } };
    }
    return { status: 200, body: user };
  },

   async updateUserProfile(userId, nome, file) {
    let updatedUser;
    
     if (file && file.filename) {
      const urlFotoPerfil = `/uploads/${file.filename}`;
      updatedUser = await userRepository.updateProfileWithPicture(userId, nome, urlFotoPerfil);
    } else {
      updatedUser = await userRepository.updateProfileData(userId, nome);
    }
    
    if (!updatedUser) {
      return { status: 404, body: { message: "Usuário não encontrado ao tentar atualizar." } };
    }

    const tokenPayload = {
      id: updatedUser.id,
      email: updatedUser.email,
      tipo: updatedUser.tipo,
      nome: updatedUser.nome,
      url_foto_perfil: updatedUser.url_foto_perfil
    };
    const newToken = jwt.sign(tokenPayload, SECRET, { expiresIn: '1h' });
    
    return { status: 200, body: { user: updatedUser, token: newToken } };
  }
});