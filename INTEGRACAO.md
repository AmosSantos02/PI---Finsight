# FinSight — Guia de Integração Frontend ↔ Backend

> Documento gerado após leitura completa do backend Java.  
> **Não alterar código** até ler este documento inteiro.

---

## 1. Stack do Backend

| Item | Detalhe |
|---|---|
| Framework | Spring Boot |
| Banco atual | H2 in-memory (`jdbc:h2:mem:testdb`) |
| Porta padrão | `http://localhost:8080` |
| Autenticação | Nenhuma (todas as rotas abertas via `SecurityLiberadaConfig`) |
| CORS | **Não configurado** — chamadas do frontend vão falhar |

---

## 2. ⚠️ Problemas a resolver ANTES de integrar

### 2.1 CORS — bloqueio total das chamadas

O backend não tem `@CrossOrigin` nem `CorsFilter`. Qualquer `fetch()` do frontend vai retornar erro:

```
Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix no backend** — adicionar no `SecurityLiberadaConfig.java`:

```java
@Bean
public CorsFilter corsFilter() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("*"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return new CorsFilter(source);
}
```

---

### 2.2 Banco de dados — H2 in-memory perde dados ao reiniciar

Configuração atual: `jdbc:h2:mem:testdb` — cada reinicialização do servidor apaga tudo.

**Opções:**

| Opção | Como fazer | Custo |
|---|---|---|
| H2 arquivo (mais simples) | Trocar URL no `application.properties` | Grátis, local |
| PostgreSQL local | Instalar PostgreSQL + mudar driver | Grátis, local |
| **Supabase** (recomendado) | Criar projeto em supabase.com, pegar connection string | Grátis (500MB) |

**Para H2 arquivo** (solução mais rápida, sem instalar nada):
```properties
# application.properties
spring.datasource.url=jdbc:h2:file:./data/finsight
spring.datasource.driver-class-name=org.h2.Driver
```

**Para Supabase (PostgreSQL na nuvem)**:
1. Criar conta em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Ir em `Settings → Database → Connection String → JDBC`
4. Copiar a string e colar no `application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://db.PROJETO.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

E adicionar no `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

---

### 2.3 Sem JWT — autenticação por `clienteId` no localStorage

O login retorna apenas o objeto do cliente. Não há token. A estratégia é:

1. Salvar resposta do login no `localStorage`:
```js
localStorage.setItem('finsight-user', JSON.stringify(response));
// response = { id, username, email, message }
```

2. Em toda requisição que precise de `clienteId`, ler:
```js
const user = JSON.parse(localStorage.getItem('finsight-user'));
const clienteId = user.id;
```

---

## 3. Endpoints — Contrato Completo

**Base URL:** `http://localhost:8080`

---

### 3.1 Clientes (Usuário)

#### Cadastro
```
POST /clientes/signup
```
**Request:**
```json
{
  "username": "João Silva",
  "email": "joao@email.com",
  "senha": "minimo6"
}
```
**Response 201:**
```json
{
  "id": 1,
  "username": "João Silva",
  "email": "joao@email.com",
  "message": "..."
}
```

#### Login
```
POST /clientes/login
```
**Request:**
```json
{
  "email": "joao@email.com",
  "senha": "minimo6"
}
```
**Response 200:** mesmo formato do cadastro

#### Buscar cliente
```
GET /clientes/{id}
```

#### Atualizar cliente
```
PUT /clientes/{id}
```
**Request:** mesmo body do cadastro

#### Deletar cliente
```
DELETE /clientes/{id}   → 204 No Content
```

---

### 3.2 Contas (Carteiras)

#### Criar conta
```
POST /contas
```
**Request:**
```json
{
  "clienteId": 1,
  "nomeBanco": "Nubank"
}
```
**Response 201:**
```json
{
  "idConta": 1,
  "nomeBanco": "Nubank",
  "clienteId": 1
}
```

#### Listar contas
```
GET /contas   → array de ContaResponseDTO
```

#### Buscar conta
```
GET /contas/{id}
```

#### Deletar conta
```
DELETE /contas/{id}   → 204
```

> ⚠️ **Falta `PUT /contas/{id}`** — não há endpoint para editar nome da conta.

---

### 3.3 Transações

#### Criar transação
```
POST /transacoes
```
**Request:**
```json
{
  "titulo": "Mercado",
  "descricao": "Compras da semana",
  "valor": 150.00,
  "dataTransacao": "2026-05-26",
  "quantidadeParcelas": 1,
  "debitoCredito": true,
  "efetividade": true,
  "dataEfetividade": "2026-05-26",
  "categoriaId": 2,
  "tipoId": 1
}
```

> `debitoCredito`: `true` = débito/despesa, `false` = crédito/receita  
> `efetividade`: `true` = efetivada, `false` = pendente (RF03)  
> `tipoId`: referencia a entidade `Tipo` — ver seção 3.5

**Response 201:**
```json
{
  "idTransacao": 10,
  "titulo": "Mercado",
  "valor": 150.00,
  "dataTransacao": "2026-05-26",
  "descricao": "Compras da semana",
  "quantidadeParcelas": 1,
  "debitoCredito": true,
  "efetividade": true,
  "dataEfetividade": "2026-05-26",
  "categoriaId": 2,
  "tipoId": 1
}
```

#### Listar transações
```
GET /transacoes   → array
```

#### Buscar transação
```
GET /transacoes/{id}
```

#### Deletar transação
```
DELETE /transacoes/{id}   → 204
```

> ⚠️ **Falta `PUT /transacoes/{id}`** — não há edição de transação.

---

### 3.4 Categorias

#### Criar
```
POST /categorias
```
**Request:**
```json
{
  "nomeCategoria": "Alimentação"
}
```
**Response 201:**
```json
{
  "idCategoria": 1,
  "nomeCategoria": "Alimentação"
}
```

#### Listar
```
GET /categorias
```

#### Buscar
```
GET /categorias/{id}
```

#### Atualizar
```
PUT /categorias/{id}
```
**Request:** mesmo body do criar

#### Deletar
```
DELETE /categorias/{id}   → 204
```

---

### 3.5 Tipos (= Metas no frontend)

> ⚠️ A entidade `Tipo` no backend corresponde às **Metas** do frontend (tem `saldoObjetivo`, `saldoAtual`, `dataLimite`). O nome é diferente mas a função é a mesma.

#### Criar
```
POST /tipos
```
**Request:**
```json
{
  "nome": "Viagem Europa",
  "saldoObjetivo": 15000.00,
  "saldoAtual": 4200.00,
  "dataLimite": "2026-12-31",
  "contaId": 1
}
```

#### Listar
```
GET /tipos
```

#### Buscar
```
GET /tipos/{id}
```

#### Atualizar
```
PUT /tipos/{id}
```

#### Deletar
```
DELETE /tipos/{id}   → 204
```

---

## 4. Mapeamento Frontend → Backend por Tela

| Tela | Ação | Endpoint |
|---|---|---|
| `login.html` | Entrar | `POST /clientes/login` |
| `register.html` | Criar conta | `POST /clientes/signup` |
| `dashboard.html` | Listar transações recentes | `GET /transacoes` |
| `dashboard.html` | Listar metas | `GET /tipos` |
| `transactions.html` | Listar todas transações | `GET /transacoes` |
| `transactions.html` | Nova transação | `POST /transacoes` |
| `transactions.html` | Excluir transação | `DELETE /transacoes/{id}` |
| `wallets.html` | Listar carteiras | `GET /contas` |
| `wallets.html` | Nova carteira | `POST /contas` |
| `wallets.html` | Excluir carteira | `DELETE /contas/{id}` |
| `goals.html` | Listar metas | `GET /tipos` |
| `goals.html` | Nova meta | `POST /tipos` |
| `goals.html` | Editar meta | `PUT /tipos/{id}` |
| `goals.html` | Excluir meta | `DELETE /tipos/{id}` |
| `categories.html` | Listar categorias | `GET /categorias` |
| `categories.html` | Nova categoria | `POST /categorias` |
| `categories.html` | Editar categoria | `PUT /categorias/{id}` |
| `categories.html` | Excluir categoria | `DELETE /categorias/{id}` |
| `profile.html` | Ver perfil | `GET /clientes/{id}` |
| `profile.html` | Editar perfil | `PUT /clientes/{id}` |
| `profile.html` | Excluir conta | `DELETE /clientes/{id}` |

---

## 5. O que está faltando no backend

| Recurso | Status | Impacto |
|---|---|---|
| `PUT /transacoes/{id}` | ❌ Ausente | Não é possível editar transação |
| `PUT /contas/{id}` | ❌ Ausente | Não é possível editar carteira |
| Transação vinculada a Conta | ❌ Ausente | Não sabe em qual carteira a transação foi feita |
| Filtro de transações por cliente | ❌ Ausente | `GET /transacoes` retorna todas, não filtra por usuário |
| Filtro de contas por cliente | ❌ Ausente | `GET /contas` retorna todas |
| CORS | ❌ Ausente | Frontend não consegue chamar a API |

---

## 6. Fluxo de Auth recomendado (sem JWT)

```
1. Usuário faz login → POST /clientes/login
2. Resposta: { id, username, email }
3. Salvar no localStorage:
   localStorage.setItem('finsight-user', JSON.stringify({ id, username, email }))
   localStorage.setItem('finsight-session', 'true')
4. Redirecionar para dashboard.html
5. Em cada página: verificar se 'finsight-session' existe, senão redirecionar para login.html
6. Para requisições: ler clienteId do localStorage quando necessário
```

---

## 7. Helper JS para chamadas à API

Criar `js/api.js` com funções reutilizáveis:

```js
const API = 'http://localhost:8080';

async function apiFetch(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  if (res.status === 204) return null;
  return res.json();
}

// Transações
const Transacoes = {
  listar: ()           => apiFetch('/transacoes'),
  buscar: (id)         => apiFetch(`/transacoes/${id}`),
  criar:  (body)       => apiFetch('/transacoes', { method: 'POST', body: JSON.stringify(body) }),
  deletar:(id)         => apiFetch(`/transacoes/${id}`, { method: 'DELETE' }),
};

// Contas
const Contas = {
  listar: ()           => apiFetch('/contas'),
  criar:  (body)       => apiFetch('/contas', { method: 'POST', body: JSON.stringify(body) }),
  deletar:(id)         => apiFetch(`/contas/${id}`, { method: 'DELETE' }),
};

// Categorias
const Categorias = {
  listar: ()           => apiFetch('/categorias'),
  criar:  (body)       => apiFetch('/categorias', { method: 'POST', body: JSON.stringify(body) }),
  atualizar: (id,body) => apiFetch(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletar:(id)         => apiFetch(`/categorias/${id}`, { method: 'DELETE' }),
};

// Tipos (= Metas)
const Tipos = {
  listar: ()           => apiFetch('/tipos'),
  criar:  (body)       => apiFetch('/tipos', { method: 'POST', body: JSON.stringify(body) }),
  atualizar: (id,body) => apiFetch(`/tipos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletar:(id)         => apiFetch(`/tipos/${id}`, { method: 'DELETE' }),
};

// Clientes (Auth)
const Clientes = {
  login:    (body)     => apiFetch('/clientes/login',  { method: 'POST', body: JSON.stringify(body) }),
  cadastrar:(body)     => apiFetch('/clientes/signup', { method: 'POST', body: JSON.stringify(body) }),
  buscar:   (id)       => apiFetch(`/clientes/${id}`),
  atualizar:(id,body)  => apiFetch(`/clientes/${id}`,  { method: 'PUT', body: JSON.stringify(body) }),
  deletar:  (id)       => apiFetch(`/clientes/${id}`,  { method: 'DELETE' }),
};
```

---

## 8. Checklist de integração (ordem recomendada)

1. **[ ] Resolver CORS** — adicionar `CorsFilter` no backend
2. **[ ] Escolher banco** — H2 arquivo (simples) ou Supabase (cloud)
3. **[ ] Criar `js/api.js`** no frontend
4. **[ ] Implementar login/cadastro** — `login.html` + `register.html`
5. **[ ] Implementar guard de sessão** — verificar `finsight-session` em cada página
6. **[ ] Ligar transações** — `transactions.html` usa `Transacoes.listar()` e `Transacoes.criar()`
7. **[ ] Ligar carteiras** — `wallets.html` usa `Contas.*`
8. **[ ] Ligar metas** — `goals.html` usa `Tipos.*`
9. **[ ] Ligar categorias** — `categories.html` usa `Categorias.*`
10. **[ ] Pedir colega adicionar** `PUT /transacoes/{id}` e `PUT /contas/{id}`
