require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const path = require('path');

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

app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads')));

// --- Bloco de Montagem do Auth ---
const createAuthRepository = require('./repositories/authRepository');
const createAuthService = require('./services/authService');
const createAuthController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');

const authRepository = createAuthRepository(db); // Mudamos o nome da variável
const authService = createAuthService(authRepository);
const authController = createAuthController(authService);

// --- Bloco de Montagem do User (AGORA SEPARADO E CORRETO) ---
const createUserRepository = require('./repositories/userRepository'); // <<< NOVO IMPORT
const createUserService = require('./services/userService');
const createUserController = require('./controllers/userController');
const userRoutes = require('./routes/userRoutes');

const userRepository = createUserRepository(db); // <<< CRIAMOS O NOVO REPOSITORY
const userService = createUserService(userRepository); // <<< PASSAMOS ELE PARA O SERVICE
const userController = createUserController(userService);

// --- Bloco de Montagem do Prato ---
const createPratoRepository = require('./repositories/pratoRepository');
const createPratoService = require('./services/pratoService');
const createPratoController = require('./controllers/pratoController');
const pratoRoutes = require('./routes/pratoRoutes'); 

const pratoRepository = createPratoRepository(db);
const pratoService = createPratoService(pratoRepository);
const pratoController = createPratoController(pratoService);

// --- Bloco de Montagem do Chatbot ---
const ChatbotService = require('./services/chatbotService');
const chatbotRoutes = require('./routes/chatbotRoutes');

const chatbotService = new ChatbotService(db);

// --- Bloco de registro de rotas ---
const restaurantesRoutes = require('./routes/restaurantes');
const pratosRoutes = require('./routes/pratos');

app.use('/auth', authRoutes(authController));
app.use('/api/user', userRoutes(userController));
app.use('/api', pratoRoutes(pratoController)); 
app.use('/api/pratos', pratosRoutes);
app.use('/restaurantes', restaurantesRoutes);
app.use('/api/chatbot', chatbotRoutes(chatbotService));

app.use((req, res, next) => {
  console.log(`[404 Handler] ROTA NÃO ENCONTRADA: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: "Ops! Rota não encontrada." });
});

app.listen(3001, () => {
    console.log("Servidor rodando na porta 3001");
    console.log("🤖 Chatbot IA ativo em /api/chatbot");
});