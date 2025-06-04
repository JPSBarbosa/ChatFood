const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/authRepository');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET;
const saltRounds = 10;

exports.register = async ({ email, password, tipo }) => {
    const user = await userRepository.findByEmail(email);
    if (user) {
        return { status: 400, body: { message: "Email já cadastrado!" } };
    }

    const hash = await bcrypt.hash(password, saltRounds);
    await userRepository.create(email, hash, tipo || 'cliente');

    return { status: 201, body: { message: "Cadastrado com sucesso!" } };
};

exports.login = async ({ email, password }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
        return { status: 401, body: { message: "Email ou senha incorretos!" } };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return { status: 401, body: { message: "Email ou senha incorretos!" } };
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, tipo: user.tipo },
        SECRET,
        { expiresIn: '1h' }
    );

    return { status: 200, body: { message: "Login realizado com sucesso!", token } };
};