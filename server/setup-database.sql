-- Script para configurar o banco de dados ChatFood

-- Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS usuarios (
    idusuarios SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nome VARCHAR(255),
    tipo VARCHAR(50) DEFAULT 'cliente',
    url_foto_perfil VARCHAR(500)
);

-- Criar tabela de restaurantes (se não existir)
-- Estrutura atualizada: id, nome, url_logo, id_usuario
CREATE TABLE IF NOT EXISTS restaurantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    url_logo VARCHAR(500),
    id_usuario INTEGER REFERENCES usuarios(idusuarios)
);

-- Criar tabela de pratos (se não existir)
-- Estrutura atualizada: usar restaurante_id em vez de id_restaurante
CREATE TABLE IF NOT EXISTS pratos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    url_imagem VARCHAR(500),
    restaurante_id INTEGER REFERENCES restaurantes(id)
);

-- Adicionar coluna id_usuario se não existir (para tabelas já criadas)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurantes' AND column_name = 'id_usuario') THEN
        ALTER TABLE restaurantes ADD COLUMN id_usuario INTEGER REFERENCES usuarios(idusuarios);
    END IF;
END $$;

-- Renomear coluna id_restaurante para restaurante_id se necessário
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pratos' AND column_name = 'id_restaurante') THEN
        ALTER TABLE pratos RENAME COLUMN id_restaurante TO restaurante_id;
    END IF;
END $$;

-- Inserir alguns dados de exemplo (opcional)
INSERT INTO usuarios (email, password, nome, tipo) VALUES 
('cliente@teste.com', '$2b$10$example_hash', 'Cliente Teste', 'cliente'),
('restaurante@teste.com', '$2b$10$example_hash', 'Restaurante Teste', 'restaurante')
ON CONFLICT (email) DO NOTHING;

-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'; 