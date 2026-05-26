# FinSight — Documentação do Projeto

> Projeto escolar de gestão financeira pessoal. Stack: HTML5 + CSS3 + JavaScript vanilla. Sem frameworks, sem backend.

---

## Índice

1. [Estrutura de arquivos](#estrutura-de-arquivos)
2. [Telas e o que cada uma faz](#telas-e-o-que-cada-uma-faz)
3. [Sistema de design (CSS)](#sistema-de-design)
4. [JavaScript — lógica e funções](#javascript)
5. [localStorage — como usar](#localstorage)
6. [Como adicionar funcionalidades](#como-adicionar-funcionalidades)
7. [Modais — como funcionam](#modais)
8. [Estruturas de dados](#estruturas-de-dados)

---

## Estrutura de arquivos

```
finsight/
├── index.html            ← redireciona para login.html
├── DOCS.md               ← esta documentação
├── css/
│   ├── global.css        ← design system completo (variáveis, componentes, responsivo)
│   └── modals.css        ← estilos dos modais, seletores de ícone/cor, preview
├── js/
│   └── modals.js         ← toda a lógica JS (dark mode, modais, formulários)
└── pages/
    ├── login.html        ← tela de login
    ├── register.html     ← tela de cadastro
    ├── dashboard.html    ← página inicial com resumo
    ├── transactions.html ← lista de transações
    ├── wallets.html      ← carteiras e saldos
    ├── goals.html        ← metas financeiras
    ├── categories.html   ← categorias de transações
    └── profile.html      ← perfil e preferências
```

---

## Telas e o que cada uma faz

### `login.html` — Login

**Exibe:**
- Logo FinSight + tagline
- Campo de e-mail e senha (com toggle mostrar/ocultar)
- Checkbox "Lembrar de mim"
- Link "Esqueci minha senha"
- Botão de envio
- Opções de login social (Google, GitHub)
- Link para criar conta

**Faz:**
- Formulário com `onsubmit="return false"` (impede reload da página)
- Toggle visibilidade de senha via `data-pw-toggle`
- Não tem validação real nem redirecionamento — apenas UI

**Como conectar lógica:**
```js
document.querySelector('.auth_btn_submit').addEventListener('click', () => {
  const email = document.getElementById('login_email').value;
  const pass  = document.getElementById('login_password').value;
  // validar, salvar sessão no localStorage, redirecionar
  window.location.href = 'dashboard.html';
});
```

---

### `register.html` — Cadastro

**Exibe:**
- Campos: nome, e-mail, senha, confirmar senha
- Indicador de força da senha (barras coloridas)
- Checkbox de aceite dos termos
- Botão cadastrar
- Login social (Google, Apple)
- Link para fazer login

**Faz:**
- `initDarkMode()` ao carregar
- Medidor de força de senha (calculado no evento `input` do campo `#reg_password`)
- Score de força: comprimento ≥8 (+1), letras maiúsculas + números (+1), caracteres especiais (+1)
- Cores: vermelho (fraca), laranja (média), verde (forte)

**Como conectar lógica:**
```js
document.querySelector('.auth_btn_submit').addEventListener('click', () => {
  const name  = document.getElementById('reg_name').value;
  const email = document.getElementById('reg_email').value;
  const pass  = document.getElementById('reg_password').value;
  // salvar usuário no localStorage → redirecionar para dashboard
});
```

---

### `dashboard.html` — Dashboard (tela inicial)

**Exibe:**
- Saudação com nome do usuário e avatar
- Seletor de mês (botões chevron esquerda/direita)
- Card "Balance Hero" com saldo total, badge de variação mensal
- Grid de estatísticas: Receitas / Despesas do mês
- Gráfico de barras dos gastos da semana (SEG–SEX)
- Scroll horizontal de metas (mini cards com progresso)
- Lista de transações recentes (5 últimas)
- FAB (botão flutuante) para nova transação

**Faz:**
- Clicar em qualquer transação abre modal `modal_new_transaction`
- FAB também abre `modal_new_transaction`
- Nav inferior com item "Dashboard" ativo
- "Ver todas" em Metas → `goals.html`
- "Ver todas" em Transações → `transactions.html`

**O que está hardcoded (demo):**
- Saldo: R$ 13.280,50
- Receitas: R$ 8.500 / Despesas: R$ 3.219
- Barras do gráfico (alturas em %)
- Metas: Europa (28%), Carro (65%), Reserva (87%)
- Transações: iFood, Salário, Combustível, Farmácia, Amazon

---

### `transactions.html` — Transações

**Exibe:**
- Título "Transações"
- Campo de busca
- Abas de filtro: Todas / Receitas / Despesas
- Cards de resumo: total de receitas e despesas do mês
- Grupos de transações por data (Hoje, Ontem, datas específicas)
- Cada transação: ícone colorido, nome, categoria·carteira, valor
- FAB "Nova transação"

**Faz:**
- Clicar em transação abre modal `modal_tx_detail` (detalhe com data, categoria, carteira, nota)
- No detalhe: botão "Editar" fecha o modal, botão "Excluir" abre modal `modal_confirm_delete`
- FAB abre modal `modal_new_transaction`
- Abas de filtro mudam a aba ativa (`.filter_tab_active`) — filtro visual apenas, sem lógica de filtro real

**Modais presentes:**
- `modal_new_transaction` — formulário: tipo, valor, descrição, categoria, carteira, data
- `modal_tx_detail` — detalhe da transação com ações
- `modal_confirm_delete` — confirmação de exclusão

---

### `wallets.html` — Carteiras

**Exibe:**
- Título "Carteiras" + botão "Nova carteira"
- Card de saldo total com número de carteiras
- Lista de carteiras: Conta Nubank, Poupança, Carteira física
- Cada carteira: ícone colorido, nome, saldo, badge "Principal" (se for)
- Rodapé de cada carteira: "Ver transações" + "Editar"
- Card de dica com percentual de meta atingida

**Faz:**
- Botão "Nova carteira" abre modal `modal_new_wallet`
- "Ver transações" leva para `transactions.html`

**Modal `modal_new_wallet` — campos:**
- Nome da carteira (texto)
- Saldo inicial (numérico)
- Tipo (select): Conta corrente, Poupança, Dinheiro físico, Investimento
- Cor (palette de 6 cores, seleção visual)
- Checkbox "Definir como carteira principal"

---

### `goals.html` — Metas

**Exibe:**
- Título "Metas" + subtítulo + botão "Nova meta"
- Abas: Todas / Em andamento / Concluídas
- Cards de meta: ícone, nome, badge de status, valor atual, valor alvo, percentual, barra de progresso
- Botão "+ Aporte" por meta (abre modal nova meta)
- Botão lixeira (abre modal confirmação)
- Card decorativo com imagem (Unsplash)

**Status de meta:**
- `goal_status_active` — "Em andamento" (roxo claro)
- `goal_status_done` — "Concluída" (verde), botão aporte desabilitado

**Modais presentes:**
- `modal_new_goal` — nome, valor alvo, valor inicial, prazo, seletor de ícone (6 opções)
- `modal_confirm_delete` — confirmação de exclusão da meta

---

### `categories.html` — Categorias

**Exibe:**
- Título "Categorias" + botão "Nova categoria"
- Abas: Todas / Receita / Despesa
- Grid 2 colunas de cards de categoria
- Cada card: ícone colorido, badge Receita/Despesa, nome, contagem de transações, botão "Editar"
- Card de "Insight Semanal" com texto e barra de progresso

**Faz:**
- Botão "Nova categoria" abre modal `modal_new_category`
- Modal tem pré-visualização em tempo real (nome, ícone, cor, tipo atualizam o preview)

**Modal `modal_new_category` — campos:**
- Toggle tipo: Despesa / Receita
- Nome (texto) — atualiza preview em tempo real
- Seletor de ícone (grid 10 ícones)
- Seletor de cor (palette 6 cores)
- Pré-visualização dinâmica

**Lógica do preview (em `modals.js:updateCatPreview`):**
```js
// lê nome, ícone selecionado, cor selecionada, tipo selecionado
// atualiza: #preview_name, #preview_icon, #preview_box (background), #preview_badge
```

---

### `profile.html` — Perfil

**Exibe:**
- Avatar com iniciais, nome, e-mail
- Botão "Alterar foto"
- Seção "Informações Pessoais": nome e e-mail editáveis
- Seção "Preferências": toggle dark/light mode, moeda (BRL), formato de data
- Seção "Segurança": campos de nova senha + confirmar senha (com show/hide)
- Seção "Sobre": versão, Termos de Uso, Política de Privacidade
- Botão "Sair da conta"
- Botão "Excluir minha conta" (vermelho, abre modal de confirmação)

**Faz:**
- Toggle `#theme_toggle` chama `toggleDarkMode()` → salva no localStorage `finsight-theme`
- `data-pw-toggle` nos campos de senha habilita mostrar/ocultar
- Modal `modal_confirm_delete` para exclusão de conta

---

## Sistema de design

### Variáveis CSS (`css/global.css`)

Todas as cores, fontes e raios ficam em `:root`:

```css
/* Dark mode (padrão) */
--clr-bg               /* fundo da página */
--clr-surface          /* superfícies de cards */
--clr-surface-high     /* superfícies mais claras */
--clr-primary          /* roxo claro (textos de destaque) */
--clr-accent           /* roxo vivo #7C5CFC (botões, ativo) */
--clr-income           /* verde #4ade80 (receitas) */
--clr-expense          /* vermelho #f87171 (despesas) */
--clr-on-surface       /* texto principal */
--clr-on-surface-variant /* texto secundário */
--clr-outline          /* bordas e ícones inativos */
--font-sans            /* Public Sans */
--font-mono            /* JetBrains Mono (valores monetários) */
--radius-sm/md/lg/xl   /* bordas arredondadas */
```

**Modo claro:** `html:not(.dark)` sobrescreve as variáveis. A classe `.dark` fica no `<html>`.

---

## JavaScript

### Arquivo único: `js/modals.js`

Carregado no final do `<body>` de cada página. Executa `initDarkMode()` imediatamente (antes do DOMContentLoaded) para evitar flash de tema errado.

### Funções principais

#### `initDarkMode()`
```js
// lê localStorage → aplica classe .dark no <html>
// padrão: dark (se não houver nada salvo, ativa dark mode)
```

#### `toggleDarkMode()`
```js
// inverte classe .dark no <html>
// salva no localStorage: 'dark' ou 'light'
```

#### `openModal(id)` / `closeModal(id)` / `closeAllModals()`
```js
openModal('modal_new_transaction');  // adiciona .is_open ao overlay
closeModal('modal_tx_detail');       // remove .is_open
closeAllModals();                    // remove de todos os .modal_overlay.is_open
// body.modal_open controla scroll lock
```

#### `setupDesktopSidebar()`
```js
// Só executa se window.innerWidth >= 1024
// Cria <aside id="desktop_sidebar"> dinamicamente
// Adiciona body.has_sidebar (ativa CSS do layout desktop)
// Detecta página ativa por window.location.pathname
```

#### `updateCatPreview()`
```js
// Lê: #cat_name, ícone .selected, cor .selected, tipo ativo
// Escreve: #preview_name, #preview_icon, #preview_box, #preview_badge
```

### Atributos HTML que ativam JS (sem código extra)

| Atributo | Comportamento |
|---|---|
| `data-modal="ID"` | Clique abre modal com esse ID |
| `data-close="ID"` | Clique fecha modal com esse ID |
| `data-pw-toggle="INPUT_ID"` | Clique alterna type password/text |
| `data-tab` (dentro de `data-tabs`) | Tab filter — muda classe ativa |
| `data-type="expense\|income"` | Toggle de tipo em formulários |
| `data-icon` / `.icon_opt` | Seleção de ícone (marca `.selected`) |
| `data-color` / `.color_opt` | Seleção de cor (marca `.selected`) |

---

## localStorage

### Chave atual

| Chave | Tipo | Valores | Quando salva |
|---|---|---|---|
| `finsight-theme` | string | `'dark'` ou `'light'` | Ao clicar no toggle de tema no perfil |

**Ler tema:**
```js
const tema = localStorage.getItem('finsight-theme');
// null → dark mode (padrão)
// 'light' → modo claro
// 'dark' → modo escuro
```

**Salvar tema:**
```js
localStorage.setItem('finsight-theme', 'light');
```

---

### Como adicionar persistência de dados

O projeto hoje é um protótipo visual. Para salvar dados reais, use este padrão:

#### Estrutura de dados recomendada

```js
// Chaves sugeridas para o localStorage:
'finsight-theme'        // já existe
'finsight-user'         // dados do usuário logado
'finsight-transactions' // array de transações
'finsight-wallets'      // array de carteiras
'finsight-goals'        // array de metas
'finsight-categories'   // array de categorias
```

#### Helper genérico (adicionar em `modals.js` ou arquivo separado)

```js
// Salvar array no localStorage
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Ler array do localStorage (retorna [] se vazio)
function loadData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
```

#### Exemplo: salvar nova transação

```js
function salvarTransacao(transacao) {
  const lista = loadData('finsight-transactions');
  transacao.id = Date.now(); // ID único por timestamp
  lista.push(transacao);
  saveData('finsight-transactions', lista);
}

// Chamar ao clicar em "Salvar transação" no modal:
document.querySelector('#modal_new_transaction .btn_primary')
  .addEventListener('click', () => {
    const tx = {
      tipo: document.querySelector('.type_btn_active_expense, .type_btn_active_income')
               ?.dataset.type,
      valor: parseFloat(document.querySelector('.field_input_mono').value
               .replace('R$', '').replace(',', '.')),
      descricao: document.querySelector('[placeholder="Ex: iFood, Salário..."]').value,
      categoria: document.querySelector('[name="categoria"]').value,
      carteira: document.querySelector('[name="carteira"]').value,
      data: new Date().toISOString(),
    };
    salvarTransacao(tx);
    closeModal('modal_new_transaction');
    renderizarTransacoes(); // função que redesenha a lista
  });
```

#### Estrutura de cada entidade

```js
// Transação
{
  id: 1234567890,       // timestamp (Date.now())
  tipo: 'expense',      // 'expense' ou 'income'
  valor: 45.90,         // número
  descricao: 'iFood',
  categoria: 'Alimentação',
  carteira: 'Conta Nubank',
  data: '2026-05-08',
  notas: 'Pedido pelo app'
}

// Carteira
{
  id: 1234567890,
  nome: 'Conta Nubank',
  saldo: 4230.50,
  tipo: 'Conta corrente', // 'Poupança' | 'Dinheiro físico' | 'Investimento'
  cor: '#7C5CFC',
  principal: true
}

// Meta
{
  id: 1234567890,
  nome: 'Viagem Europa',
  icone: 'flight',
  valorAtual: 4200,
  valorAlvo: 15000,
  prazo: '2027-07-01',
  status: 'active'  // 'active' ou 'done'
}

// Categoria
{
  id: 1234567890,
  nome: 'Alimentação',
  icone: 'restaurant',
  cor: '#fb923c',
  tipo: 'expense'   // 'expense' ou 'income'
}

// Usuário
{
  nome: 'João da Silva',
  email: 'joao@exemplo.com',
  iniciais: 'JD'
}
```

---

## Como adicionar funcionalidades

### Tornar o formulário de transação funcional

1. Adicione `id` ou `name` nos inputs dentro de `#modal_new_transaction`
2. No evento de submit do `.btn_primary`, colete os valores
3. Salve com `saveData('finsight-transactions', lista)`
4. Chame uma função para re-renderizar a lista na página

### Tornar o login funcional

```js
// Em login.html — adicionar ao botão submit:
document.querySelector('.auth_btn_submit').addEventListener('click', () => {
  const email = document.getElementById('login_email').value.trim();
  const senha = document.getElementById('login_password').value;

  const usuario = JSON.parse(localStorage.getItem('finsight-user') || 'null');
  if (usuario && usuario.email === email && usuario.senha === senha) {
    localStorage.setItem('finsight-session', 'true');
    window.location.href = 'dashboard.html';
  } else {
    alert('Email ou senha incorretos');
  }
});
```

### Renderizar dados dinamicamente

```js
// Exemplo: renderizar transações na página
function renderizarTransacoes() {
  const lista = loadData('finsight-transactions');
  const container = document.querySelector('.tx_list');
  container.innerHTML = '';

  lista.forEach(tx => {
    const div = document.createElement('div');
    div.className = 'tx_row';
    div.innerHTML = `
      <div class="tx_icon" style="...">
        <span class="material-symbols-outlined">${tx.icone}</span>
      </div>
      <div class="tx_info">
        <p class="tx_name">${tx.descricao}</p>
        <p class="tx_meta">${tx.categoria}</p>
      </div>
      <span class="tx_amount ${tx.tipo === 'income' ? 'tx_amount_income' : 'tx_amount_expense'}">
        ${tx.tipo === 'income' ? '+' : '-'}R$ ${tx.valor.toFixed(2)}
      </span>
    `;
    container.appendChild(div);
  });
}
```

---

## Modais

### Como funciona o sistema

Cada modal é um `div.modal_overlay` com `id` único. Por padrão está invisível (`opacity: 0; pointer-events: none`).

```html
<!-- Estrutura padrão -->
<div id="modal_new_transaction" class="modal_overlay">
  <div class="modal_sheet">
    <div class="modal_handle"></div>
    <div class="modal_header">
      <h2 class="modal_title">Título</h2>
      <button class="modal_close" data-close="modal_new_transaction">
        <span class="material-symbols-outlined">close</span>
      </button>
    </div>
    <div class="modal_body">
      <!-- conteúdo -->
    </div>
  </div>
</div>
```

**Abrir via HTML:** `<button data-modal="modal_new_transaction">`
**Fechar via HTML:** `<button data-close="modal_new_transaction">`
**Fechar via JS:** `closeModal('modal_new_transaction')`
**Fechar todos:** `closeAllModals()` ou tecla `Escape`
**Fechar clicando fora:** clicar no overlay (`.modal_overlay`) fecha

### Animação

- Overlay: `opacity 0→1` em 0.25s
- Sheet: `translateY(100%)→translateY(0)` em 0.35s (cubic-bezier)
- `max-height: 90dvh` com `overflow-y: auto` para conteúdo longo

---

## Layout responsivo

### Breakpoints

| Breakpoint | Comportamento |
|---|---|
| `< 768px` | Mobile: nav inferior, conteúdo centralizado, max 480px |
| `768px–1023px` | Tablet: nav inferior centralizada (480px), fundo mais escuro |
| `≥ 1024px` | Desktop: sidebar lateral (240px), nav inferior oculta, conteúdo em grid |

### Classes de layout (body)

- `body.has_sidebar` — adicionada por JS quando sidebar é criada (telas ≥1024px)
- `body.modal_open` — adicionada quando modal está aberta (bloqueia scroll)

### Sidebar desktop

Criada dinamicamente por `setupDesktopSidebar()`. Detecta a página ativa pelo `window.location.pathname`. Não precisa ser adicionada no HTML — o JS insere automaticamente antes de qualquer outro elemento do body.

---

## Ícones

Projeto usa **Google Material Symbols Outlined** via CDN:
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

**Uso básico:**
```html
<span class="material-symbols-outlined">nome_do_icone</span>
```

**Ícone preenchido:**
```html
<span class="material-symbols-outlined icon_fill">nome_do_icone</span>
<!-- ou via style: font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24 -->
```

Busca de ícones: [fonts.google.com/icons](https://fonts.google.com/icons)
