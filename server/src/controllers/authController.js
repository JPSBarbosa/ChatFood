const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(result.status).json(result.body);
    } catch (err) {
        console.error("Erro no registro:", err);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
};

exports.login = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.status(result.status).json(result.body);
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ error: "Erro interno no servidor." });
    }
};
