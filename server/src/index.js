require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();

const db = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD),
    port: Number(process.env.DB_PORT)
});

app.locals.db = db;

app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes');
const restaurantesRoutes = require('./routes/restaurantes');
const pratosRoutes = require('./routes/pratos');

const createAuthRepository = require('./repositories/authRepository');
const createAuthService = require('./services/authService');
const createAuthController = require('./controllers/authController');

const userRepository = createAuthRepository(db);
const authService = createAuthService(userRepository);
const authController = createAuthController(authService);

console.log(authController); 

app.use('/auth', authRoutes(authController));
app.use('/restaurantes', restaurantesRoutes);
app.use('/pratos', pratosRoutes);

app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
});