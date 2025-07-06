const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

module.exports = (userRepository) => ({
  register: async ({ email, password, tipo, nome }) => {
    const user = await userRepository.findByEmail(email);
    if (user) {
      return { status: 400, body: { message: "Email já cadastrado!" } };
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await userRepository.create(email, hash, tipo || 'cliente', nome);

    return { status: 201, body: { message: "Cadastrado com sucesso!" } };
  },

  login: async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { status: 401, body: { message: "Email ou senha incorretos!" } };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return { status: 401, body: { message: "Email ou senha incorretos!" } };
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      tipo: user.tipo,
      nome: user.nome,
      url_foto_perfil: user.url_foto_perfil
    };

    const token = jwt.sign(tokenPayload, SECRET, { expiresIn: '1h' });

    return { status: 200, body: { message: "Login realizado com sucesso!", token } };
  }
});