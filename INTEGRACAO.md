# FinSight — Guia de Integração Frontend ↔ Backend

> Documento gerado após leitura completa do backend Java.  
> **Não alterar código** até ler este documento inteiro.

---

## 1. Stack definida

| Item | Detalhe |
|---|---|
| Framework backend | Spring Boot |
| Banco de dados | **Supabase (PostgreSQL na nuvem)** |
| Frontend | HTML/CSS/JS vanilla |
| Ambiente | Frontend + Backend rodam local — banco fica na nuvem |
| URL do backend | `http://localhost:8080` |
| URL do frontend | `http://localhost:3000` (via `npx serve`) |
| Autenticação | Sem JWT — `clienteId` salvo no `localStorage` |
| CORS | ❌ Não configurado — precisa corrigir antes de integrar |

```
Teu PC (localhost)
├── Frontend  :3000  ──→  Spring Boot :8080  ──→  Supabase (PostgreSQL ☁️)
```

---

## 2. Como rodar localmente

### Backend (Spring Boot)
```bash
# Na pasta "finsight Backend"
./mvnw spring-boot:run
# Ou pelo Eclipse/IntelliJ: rodar FinsightApplication.java
```
API disponível em `http://localhost:8080`

### Frontend
```bash
# Na pasta finsight/
npx serve -p 3000 .
```

> ⚠️ Não abrir como `file://` — o browser bloqueia `fetch()` por política de segurança.  
> Sempre usar `npx serve` ou extensão Live Server do VS Code.

---

## 3. Configurar Supabase

### 3.1 Criar o projeto

1. Acessar **[supabase.com](https://supabase.com)** e criar conta (recomendado: login com GitHub)
2. **New project** → nome `finsight`, senha forte, região `South America (São Paulo)`
3. Aguardar ~2 min o projeto ser criado

### 3.2 Pegar a connection string

1. No projeto Supabase → **Settings → Database**
2. Rolar até **Connection string → JDBC**
3. Copiar — formato:
```
jdbc:postgresql://db.XXXXXXXXXXX.supabase.co:5432/postgres?user=postgres&password=SUA_SENHA
```

### 3.3 Configurar o backend

**`application.properties`** — substituir tudo por:

```properties
spring.datasource.url=jdbc:postgresql://db.XXXXXXXXXXX.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

**`pom.xml`** — adicionar dependência do driver PostgreSQL (remover H2 se existir):

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Após isso, `./mvnw spring-boot:run` — o Hibernate cria as tabelas automaticamente no Supabase (`ddl-auto=update`).

---

## 4. ⚠️ Problemas a resolver ANTES de integrar

### 4.1 CORS — bloqueio total das chamadas

O backend não tem `@CrossOrigin` nem `CorsFilter`. Qualquer `fetch()` do frontend vai retornar:

```
Access to fetch at 'http://localhost:8080/...' from origin 'http://localhost:3000'
has been blocked by CORS policy
```

**Fix no backend** — adicionar em `SecurityLiberadaConfig.java`:

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

### 4.2 Sem JWT — auth por `clienteId` no localStorage

Login retorna o objeto do cliente. Estratégia:

```js
// Após login bem-sucedido:
localStorage.setItem('finsight-user', JSON.stringify({ id, username, email }));
localStorage.setItem('finsight-session', 'true');

// Em cada página, verificar se está logado:
if (!localStorage.getItem('finsight-session')) {
  window.location.href = 'login.html';
}

// Para requisições que precisam do clienteId:
const user = JSON.parse(localStorage.getItem('finsight-user'));
const clienteId = user.id;
```

---

## 5. Endpoints — Contrato Completo

**Base URL:** `http://localhost:8080`

---

### 5.1 Clientes (Usuário)

#### Cadastro
```
POST /clientes/signup
```
```json
// Request
{ "username": "João Silva", "email": "joao@email.com", "senha": "minimo6" }

// Response 201
{ "id": 1, "username": "João Silva", "email": "joao@email.com", "message": "..." }
```

#### Login
```
POST /clientes/login
```
```json
// Request
{ "email": "joao@email.com", "senha": "minimo6" }

// Response 200
{ "id": 1, "username": "João Silva", "email": "joao@email.com", "message": "..." }
```

#### Buscar / Atualizar / Deletar
```
GET    /clientes/{id}
PUT    /clientes/{id}   → body igual ao cadastro
DELETE /clientes/{id}   → 204 No Content
```

---

### 5.2 Contas (Carteiras)

```
POST   /contas
GET    /contas          → array
GET    /contas/{id}
DELETE /contas/{id}     → 204
```

```json
// Request POST
{ "clienteId": 1, "nomeBanco": "Nubank" }

// Response
{ "idConta": 1, "nomeBanco": "Nubank", "clienteId": 1 }
```

> ⚠️ Falta `PUT /contas/{id}` — pedir ao colega adicionar.

---

### 5.3 Transações

```
POST   /transacoes
GET    /transacoes      → array
GET    /transacoes/{id}
DELETE /transacoes/{id} → 204
```

```json
// Request POST
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

> `debitoCredito`: `true` = despesa, `false` = receita  
> `efetividade`: `true` = efetivada, `false` = pendente  
> ⚠️ Falta `PUT /transacoes/{id}` — pedir ao colega adicionar.

---

### 5.4 Categorias

```
POST   /categorias      → { "nomeCategoria": "Alimentação" }
GET    /categorias      → array
GET    /categorias/{id}
PUT    /categorias/{id} → { "nomeCategoria": "Novo nome" }
DELETE /categorias/{id} → 204
```

```json
// Response
{ "idCategoria": 1, "nomeCategoria": "Alimentação" }
```

---

### 5.5 Tipos (= Metas no frontend)

> A entidade `Tipo` no backend corresponde às **Metas** do frontend.  
> Tem `saldoObjetivo`, `saldoAtual`, `dataLimite` — é uma meta vinculada a uma conta.

```
POST   /tipos
GET    /tipos           → array
GET    /tipos/{id}
PUT    /tipos/{id}
DELETE /tipos/{id}      → 204
```

```json
// Request POST
{
  "nome": "Viagem Europa",
  "saldoObjetivo": 15000.00,
  "saldoAtual": 4200.00,
  "dataLimite": "2026-12-31",
  "contaId": 1
}
```

---

## 6. Mapeamento Frontend → Backend por Tela

| Tela | Ação | Endpoint |
|---|---|---|
| `login.html` | Entrar | `POST /clientes/login` |
| `register.html` | Criar conta | `POST /clientes/signup` |
| `dashboard.html` | Listar transações recentes | `GET /transacoes` |
| `dashboard.html` | Listar metas | `GET /tipos` |
| `transactions.html` | Listar transações | `GET /transacoes` |
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

## 7. O que está faltando no backend

| Recurso | Status | Impacto |
|---|---|---|
| `PUT /transacoes/{id}` | ❌ Ausente | Não é possível editar transação |
| `PUT /contas/{id}` | ❌ Ausente | Não é possível editar carteira |
| Transação vinculada a Conta | ❌ Ausente | Não sabe em qual carteira a transação foi feita |
| Filtro por cliente | ❌ Ausente | `GET /transacoes` e `GET /contas` retornam registros de todos os usuários |
| CORS | ❌ Ausente | Frontend não consegue chamar a API |

---

## 8. Helper JS para chamadas à API

Criar `js/api.js`:

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

const Transacoes = {
  listar:  ()          => apiFetch('/transacoes'),
  buscar:  (id)        => apiFetch(`/transacoes/${id}`),
  criar:   (body)      => apiFetch('/transacoes', { method: 'POST', body: JSON.stringify(body) }),
  deletar: (id)        => apiFetch(`/transacoes/${id}`, { method: 'DELETE' }),
};

const Contas = {
  listar:  ()          => apiFetch('/contas'),
  criar:   (body)      => apiFetch('/contas', { method: 'POST', body: JSON.stringify(body) }),
  deletar: (id)        => apiFetch(`/contas/${id}`, { method: 'DELETE' }),
};

const Categorias = {
  listar:    ()        => apiFetch('/categorias'),
  criar:     (body)    => apiFetch('/categorias', { method: 'POST', body: JSON.stringify(body) }),
  atualizar: (id,body) => apiFetch(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletar:   (id)      => apiFetch(`/categorias/${id}`, { method: 'DELETE' }),
};

const Tipos = {
  listar:    ()        => apiFetch('/tipos'),
  criar:     (body)    => apiFetch('/tipos', { method: 'POST', body: JSON.stringify(body) }),
  atualizar: (id,body) => apiFetch(`/tipos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletar:   (id)      => apiFetch(`/tipos/${id}`, { method: 'DELETE' }),
};

const Clientes = {
  login:     (body)    => apiFetch('/clientes/login',  { method: 'POST', body: JSON.stringify(body) }),
  cadastrar: (body)    => apiFetch('/clientes/signup', { method: 'POST', body: JSON.stringify(body) }),
  buscar:    (id)      => apiFetch(`/clientes/${id}`),
  atualizar: (id,body) => apiFetch(`/clientes/${id}`,  { method: 'PUT', body: JSON.stringify(body) }),
  deletar:   (id)      => apiFetch(`/clientes/${id}`,  { method: 'DELETE' }),
};
```

---

## 9. Checklist de integração (ordem recomendada)

1. **[ ] Criar projeto no Supabase** — supabase.com, região São Paulo
2. **[ ] Colega configura `application.properties`** — connection string PostgreSQL + driver
3. **[ ] Colega corrige CORS** — adicionar `CorsFilter` no `SecurityLiberadaConfig.java`
4. **[ ] Testar backend** — `./mvnw spring-boot:run`, tabelas devem aparecer no Supabase
5. **[ ] Criar `js/api.js`** no frontend
6. **[ ] Implementar login** — `login.html` chama `POST /clientes/login`, salva no localStorage
7. **[ ] Implementar cadastro** — `register.html` chama `POST /clientes/signup`
8. **[ ] Guard de sessão** — verificar `finsight-session` em cada página
9. **[ ] Ligar transações** — `transactions.html` usa `Transacoes.*`
10. **[ ] Ligar carteiras** — `wallets.html` usa `Contas.*`
11. **[ ] Ligar metas** — `goals.html` usa `Tipos.*`
12. **[ ] Ligar categorias** — `categories.html` usa `Categorias.*`
13. **[ ] Colega adicionar** `PUT /transacoes/{id}` e `PUT /contas/{id}`
