

CREATE TABLE IF NOT EXISTS cliente (
    id_cliente  SERIAL PRIMARY KEY,
    username    VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS conta (
    id_conta   SERIAL PRIMARY KEY,
    id_cliente INT          NOT NULL,
    nome_banco VARCHAR(100) NOT NULL,
    CONSTRAINT fk_conta_cliente
        FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE IF NOT EXISTS tipo (
    id_tipo        SERIAL PRIMARY KEY,
    nome           VARCHAR(50)    NOT NULL,
    saldo_objetivo DECIMAL(10,2),
    saldo_atual    DECIMAL(10,2),
    data_limite    DATE,
    id_conta       INT            NOT NULL,
    CONSTRAINT fk_tipo_conta
        FOREIGN KEY (id_conta) REFERENCES conta(id_conta)
);

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria  SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS transacao (
    id_transacao       SERIAL PRIMARY KEY,
    valor              DECIMAL(10,2) NOT NULL,
    data_transacao     DATE          NOT NULL,
    descricao          VARCHAR(255),
    titulo             VARCHAR(100)  NOT NULL,
    id_categoria       INT           NOT NULL,
    quantidade_parcelas INT,
    id_tipo            INT           NOT NULL,
    debitocredito      BOOLEAN       NOT NULL,
    efetividade        BOOLEAN       NOT NULL,
    data_efetividade   DATE,
    CONSTRAINT fk_transacao_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CONSTRAINT fk_transacao_tipo
        FOREIGN KEY (id_tipo) REFERENCES tipo(id_tipo)
);
