# Configuração do Banco de Dados ChatFood

## Pré-requisitos
- PostgreSQL instalado e rodando
- Node.js e npm instalados

## Passos para Configuração

### 1. Criar o Banco de Dados
```sql
CREATE DATABASE chatfood;
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `server/` com o seguinte conteúdo:

```env
# Configurações do Banco de Dados PostgreSQL
DB_USER=postgres
DB_HOST=localhost
DB_NAME=chatfood
DB_PASSWORD=sua_senha_aqui
DB_PORT=5432

# Configuração do JWT
JWT_SECRET=seu_jwt_secret_aqui

# Configuração da OpenAI (para o chatbot)
OPENAI_API_KEY=sua_openai_api_key_aqui
```

**Importante:** Substitua `sua_senha_aqui` pela senha real do seu PostgreSQL.

### 3. Executar o Script de Setup
Execute o arquivo `setup-database.sql` no seu PostgreSQL:

```bash
psql -U postgres -d chatfood -f setup-database.sql
```

Ou copie e cole o conteúdo do arquivo `setup-database.sql` no seu cliente PostgreSQL.

### 4. Instalar Dependências
```bash
cd server
npm install
```

### 5. Iniciar o Servidor
```bash
npm start
```

## Estrutura das Tabelas

### Tabela `usuarios`
- `idusuarios` (SERIAL PRIMARY KEY)
- `email` (VARCHAR(255) UNIQUE)
- `password` (VARCHAR(255))
- `nome` (VARCHAR(255))
- `tipo` (VARCHAR(50)) - 'cliente' ou 'restaurante'
- `url_foto_perfil` (VARCHAR(500))

### Tabela `restaurantes`
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255))
- `url_logo` (VARCHAR(500))
- `id_usuario` (INTEGER) - Referência para usuarios(idusuarios)

**Nota:** Cada restaurante está associado a um usuário específico.

### Tabela `pratos`
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255))
- `descricao` (TEXT)
- `preco` (DECIMAL(10,2))
- `url_imagem` (VARCHAR(500))
- `restaurante_id` (INTEGER) - Referência para restaurantes(id)

**Nota:** O campo correto é `restaurante_id` (não `id_restaurante`).

## Como Funciona

### Para Usuários Cliente:
1. Fazem login como cliente
2. Acessam a HomePage
3. Veem todos os pratos de todos os restaurantes
4. Usam o chatbot para fazer pedidos

### Para Usuários Restaurante:
1. Fazem login como restaurante
2. Acessam a RestauranteHome
3. Criam/gerenciam seu próprio restaurante (vinculado ao seu usuário)
4. Adicionam pratos ao seu restaurante
5. Os pratos aparecem na HomePage dos clientes

## Rotas da API

### Restaurantes
- `POST /restaurantes` - Criar restaurante
- `GET /restaurantes` - Listar todos os restaurantes
- `GET /restaurantes/usuario/:id_usuario` - Buscar restaurante do usuário
- `PUT /restaurantes/:id` - Atualizar restaurante
- `DELETE /restaurantes/:id` - Deletar restaurante

### Pratos
- `POST /api/pratos` - Criar prato
- `GET /api/pratos` - Listar todos os pratos
- `GET /api/pratos/restaurante/:restaurante_id` - Buscar pratos do restaurante
- `PUT /api/pratos/:id` - Atualizar prato
- `DELETE /api/pratos/:id` - Deletar prato

## Solução de Problemas

### Erro "client password must be a string"
Este erro indica que a senha do banco de dados não está sendo passada corretamente. Verifique:

1. Se o arquivo `.env` existe na pasta `server/`
2. Se a senha está correta no arquivo `.env`
3. Se não há espaços extras na senha

### Erro de Conexão
Verifique se:
1. O PostgreSQL está rodando
2. As credenciais estão corretas
3. O banco de dados `chatfood` existe
4. A porta 5432 está correta

### Erro "coluna não existe"
Se você receber erros sobre colunas que não existem:
1. Execute o script `setup-database.sql` novamente
2. Verifique se as tabelas foram criadas corretamente
3. Confirme que a estrutura das tabelas está de acordo com o script

### Erro "restaurante_id não existe"
Se a tabela `pratos` ainda tem a coluna `id_restaurante`:
```sql
ALTER TABLE pratos RENAME COLUMN id_restaurante TO restaurante_id;
```

### Erro "id_usuario não existe"
Se a tabela `restaurantes` não tem a coluna `id_usuario`:
```sql
ALTER TABLE restaurantes ADD COLUMN id_usuario INTEGER REFERENCES usuarios(idusuarios);
``` 