# CLAUDE.md — FinSight

> Leia este arquivo antes de qualquer ação no projeto.

---

## Regras do projeto

1. **Usar sempre a skill `/caveman ultra`** em todas as interações.
2. **Atualizar este documento** sempre que houver mudança no projeto — nova tela, nova função, nova estrutura, refactor. O CLAUDE.md deve refletir o estado real do código.
3. **Antes de qualquer mudança no front-end**, acionar raciocínio de UI/UX:
   - Pensar na melhor experiência para o usuário antes de implementar
   - Propor a solução com justificativa visual/funcional
   - Se o usuário já tiver algo em mente, perguntar antes de decidir por conta própria
   - **Pedir aprovação apenas para decisões que impactam a lógica central ou a estrutura da interface** — fluxo de navegação, arquitetura de dados, mudança de layout global
   - Ajustes visuais, componentes isolados e melhorias pontuais: implementar direto sem pedir permissão
4. **Commits:** total liberdade — fazer commits a qualquer momento, com mensagens descritivas no padrão Conventional Commits.

---

## O que é o FinSight

Aplicação web de gestão financeira pessoal. Projeto acadêmico (ADS - SENAI).

**Stack:** HTML5 + CSS3 (native nesting) + JavaScript vanilla  
**Persistência:** LocalStorage (sem backend, sem banco de dados)  
**Localização:** `C:\Users\Amós\Desktop\finsight`

---

## Estrutura de arquivos

```
finsight/
├── index.html              ← redireciona para login.html
├── CLAUDE.md               ← este arquivo
├── DOCS.md                 ← documentação técnica detalhada
├── css/
│   ├── global.css          ← design system (variáveis, componentes, responsivo)
│   └── modals.css          ← estilos dos modais e seletores
├── js/
│   └── modals.js           ← toda a lógica JS (dark mode, modais, formulários)
└── pages/
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── transactions.html
    ├── wallets.html
    ├── goals.html
    ├── categories.html
    └── profile.html
```

---

## Telas

| Tela | Arquivo | Status |
|---|---|---|
| Login | `pages/login.html` | UI pronta, lógica pendente |
| Cadastro | `pages/register.html` | UI pronta, lógica pendente |
| Dashboard | `pages/dashboard.html` | UI pronta, dados hardcoded |
| Transações | `pages/transactions.html` | UI pronta, dados hardcoded |
| Carteiras | `pages/wallets.html` | UI pronta, dados hardcoded |
| Metas | `pages/goals.html` | UI pronta, dados hardcoded |
| Categorias | `pages/categories.html` | UI pronta, preview dinâmico funciona |
| Perfil | `pages/profile.html` | UI pronta, dark mode funciona |

---

## JavaScript — onde está cada coisa

**Arquivo único:** `js/modals.js`

| Função | O que faz |
|---|---|
| `initDarkMode()` | Lê `finsight-theme` do localStorage e aplica classe no body |
| `toggleDarkMode()` | Alterna dark/light e salva no localStorage |
| `openModal(id)` | Abre modal pelo ID |
| `closeModal(id)` | Fecha modal pelo ID |
| `closeAllModals()` | Fecha todos os modais abertos |
| `setupDesktopSidebar()` | Cria sidebar lateral dinamicamente em telas ≥1024px |
| `updateCatPreview()` | Atualiza preview em tempo real no modal de nova categoria |

**Atributos HTML que ativam lógica via JS (sem addEventListener manual):**
- `data-modal="modal_id"` → abre modal ao clicar
- `data-close="modal_id"` → fecha modal ao clicar
- `data-pw-toggle` → alterna visibilidade de senha

---

## Sistema de modais

Cada modal é um `div.modal_overlay` + `div.modal_sheet`. Invisível por padrão (`opacity: 0; pointer-events: none`).

**Abrir:** `data-modal="modal_id"` no botão, ou `openModal('modal_id')` via JS  
**Fechar:** `data-close="modal_id"`, ou `closeModal('modal_id')`, ou Escape, ou clicar no overlay

**Modais existentes:**

| Modal ID | Onde aparece |
|---|---|
| `modal_new_transaction` | dashboard, transactions |
| `modal_tx_detail` | transactions |
| `modal_confirm_delete` | transactions, goals, profile |
| `modal_new_wallet` | wallets |
| `modal_new_goal` | goals |
| `modal_new_category` | categories |

---

## LocalStorage — chaves do projeto

| Chave | Conteúdo |
|---|---|
| `finsight-theme` | `'dark'` ou `'light'` |
| `finsight-user` | objeto do usuário logado |
| `finsight-session` | `'true'` quando logado |
| `finsight-transactions` | array de transações |
| `finsight-wallets` | array de carteiras |
| `finsight-goals` | array de metas |
| `finsight-categories` | array de categorias |

**Helper padrão para leitura/escrita:**
```js
function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function loadData(key) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
}
```

---

## Estrutura de dados

```js
// Transação
{ id, tipo: 'expense'|'income', valor, descricao, categoria, carteira, data, notas }

// Carteira
{ id, nome, saldo, tipo, cor, principal: bool }

// Meta
{ id, nome, icone, valorAtual, valorAlvo, prazo, status: 'active'|'done' }

// Categoria
{ id, nome, icone, cor, tipo: 'expense'|'income' }

// Usuário
{ nome, email, senha, iniciais }
```

`id` sempre gerado por `Date.now()`.

---

## Design system

**Variáveis CSS principais** (em `css/global.css`):

```css
--clr-bg              /* fundo da página */
--clr-surface         /* cards */
--clr-surface-high    /* superfícies mais claras */
--clr-accent          /* roxo #7C5CFC — botões, itens ativos */
--clr-income          /* verde #4ade80 */
--clr-expense         /* vermelho #f87171 */
--clr-on-surface      /* texto principal */
--clr-on-surface-variant /* texto secundário */
--clr-outline         /* bordas */
```

**Ícones:** Google Material Symbols Outlined via CDN  
Uso: `<span class="material-symbols-outlined">nome_icone</span>`  
Preenchido: adicionar classe `icon_fill`

**Responsivo:**

| Breakpoint | Layout |
|---|---|
| `< 768px` | Mobile, nav inferior, max-width 480px |
| `768px–1023px` | Tablet, nav inferior centralizada |
| `≥ 1024px` | Desktop, sidebar lateral 240px (criada por JS), nav inferior oculta |

---

## Histórico de atualizações

- [2026-05-25] CLAUDE.md criado com documentação completa do estado atual do projeto
