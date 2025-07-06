# 🤖 Chatbot IA - ChatFood

## 📋 Descrição

O chatbot inteligente do ChatFood é um assistente virtual que utiliza Inteligência Artificial para ajudar os usuários a navegar pelo aplicativo, fazer pedidos e obter informações sobre restaurantes e pratos.

## ✨ Funcionalidades

### 🧠 **Processamento de Linguagem Natural**
- Análise de intenção das mensagens
- Reconhecimento de palavras-chave
- Respostas contextuais inteligentes

### 🍽️ **Gerenciamento de Cardápio**
- Busca completa de pratos
- Informações detalhadas de restaurantes
- Faixa de preços e recomendações

### 🛒 **Carrinho Inteligente**
- Adição de itens por comando de voz/texto
- Visualização do carrinho atual
- Limpeza e gerenciamento de pedidos

### 🤖 **IA Avançada (Gemini 1.5 Flash)**
- Análise semântica de pedidos
- Recomendações personalizadas
- Respostas naturais e contextuais
- Modelo otimizado para velocidade e eficiência

## 🚀 Instalação

### 1. Instalar Dependências
```bash
cd server
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `server` com:

```env
# Configurações do Banco de Dados
DB_USER=seu_usuario
DB_HOST=localhost
DB_NAME=chatfood
DB_PASSWORD=sua_senha
DB_PORT=5432

# Chave da API Gemini (opcional)
GEMINI_API_KEY=your-gemini-api-key-here

# Configurações do Servidor
PORT=3001
NODE_ENV=development
```

### 3. Configurar Gemini (Opcional)
Para funcionalidades avançadas de IA:
1. Crie uma conta no [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Obtenha sua API key
3. Adicione no arquivo `.env`

## 📡 Endpoints da API

### **POST** `/api/chatbot/message`
Processa mensagens do usuário
```json
{
  "message": "Quero um hambúrguer",
  "userId": "123"
}
```

### **GET** `/api/chatbot/menu`
Retorna informações do cardápio completo

### **GET** `/api/chatbot/restaurants`
Retorna informações dos restaurantes

### **GET** `/api/chatbot/prices`
Retorna faixa de preços

### **POST** `/api/chatbot/cart/add`
Adiciona item ao carrinho
```json
{
  "message": "Quero adicionar um X-Burger",
  "userId": "123"
}
```

### **GET** `/api/chatbot/cart/:userId`
Visualiza carrinho do usuário

### **DELETE** `/api/chatbot/cart/:userId`
Limpa carrinho do usuário

### **POST** `/api/chatbot/recommendations`
Gera recomendações personalizadas

### **GET** `/api/chatbot/health`
Verifica status do chatbot

## 🎯 Exemplos de Uso

### Comandos Básicos
- "Olá" - Saudação
- "Mostre o cardápio" - Lista todos os pratos
- "Quais restaurantes vocês têm?" - Informações dos restaurantes
- "Quanto custa?" - Faixa de preços
- "Como faço um pedido?" - Instruções de pedido

### Comandos de Carrinho
- "Quero um hambúrguer" - Adiciona ao carrinho
- "Adiciona uma pizza" - Adiciona ao carrinho
- "Mostre meu carrinho" - Visualiza carrinho
- "Limpa meu carrinho" - Limpa carrinho

### Comandos de IA
- "Recomenda algo" - Sugestões personalizadas
- "O que é bom aqui?" - Recomendações
- "Tenho fome de massa" - Busca por categoria

## 🔧 Configuração Avançada

### Modo Offline
O chatbot funciona mesmo sem Gemini, usando:
- Análise de palavras-chave
- Busca por similaridade de texto
- Respostas pré-definidas

### Personalização de Respostas
Edite o arquivo `services/chatbotService.js` para:
- Adicionar novas intenções
- Modificar respostas
- Ajustar lógica de negócio

### Integração com Banco de Dados
O chatbot se conecta automaticamente ao banco PostgreSQL para:
- Buscar pratos e restaurantes
- Gerenciar carrinhos (futuro)
- Histórico de conversas (futuro)

## 🛠️ Desenvolvimento

### Estrutura de Arquivos
```
server/src/
├── services/
│   └── chatbotService.js      # Lógica principal do chatbot
├── controllers/
│   └── chatbotController.js   # Controlador das requisições
├── routes/
│   └── chatbotRoutes.js       # Definição das rotas
└── index.js                   # Integração no servidor
```

### Adicionando Novas Funcionalidades

1. **Nova Intenção**
```javascript
// Em chatbotService.js
case 'nova_intencao':
  return await this.novaFuncionalidade();
```

2. **Nova Rota**
```javascript
// Em chatbotRoutes.js
router.post('/nova-funcionalidade', chatbotController.novaFuncionalidade.bind(chatbotController));
```

3. **Novo Controller**
```javascript
// Em chatbotController.js
async novaFuncionalidade(req, res) {
  // Implementação
}
```

## 🐛 Troubleshooting

### Erro de Conexão com Gemini
- Verifique se a API key está correta
- O chatbot funciona em modo offline

### Erro de Banco de Dados
- Verifique as credenciais no `.env`
- Confirme se o PostgreSQL está rodando

### Frontend não Conecta
- Verifique se o servidor está na porta 3001
- Confirme se o CORS está configurado

## 📈 Próximas Funcionalidades

- [ ] Persistência de carrinhos no banco
- [ ] Histórico de conversas
- [ ] Integração com sistema de pedidos
- [ ] Análise de sentimento
- [ ] Recomendações baseadas em histórico
- [ ] Suporte a múltiplos idiomas

## 🤝 Contribuição

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste todas as funcionalidades
5. Faça o pull request

## 📄 Licença

Este projeto está sob a licença MIT. 