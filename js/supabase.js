'use strict';

const SUPABASE_URL = 'https://xvgrrvvbwxoyvgauspdd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z3JydnZid3hveXZnYXVzcGRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDc1NTcsImV4cCI6MjA5NTU4MzU1N30.bPJSQYnx2Xsa1hGEYGu5-fJaEj52Qo5FXYYPMaDvIPY';

const { createClient } = window.supabase;
const _db = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ─── Auth ─── */
async function dbRegister(username, email, password) {
  const { data, error } = await _db
    .from('cliente')
    .insert([{ username, email, password }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbLogin(email, password) {
  const { data, error } = await _db
    .from('cliente')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .single();
  if (error || !data) throw new Error('Email ou senha inválidos');
  return data;
}

/* ─── Contas / Carteiras ─── */
async function dbGetContas(id_cliente) {
  const { data, error } = await _db
    .from('conta')
    .select('*, tipo(*)')
    .eq('id_cliente', id_cliente);
  if (error) throw error;
  return data;
}

async function dbAddConta(id_cliente, nome_banco) {
  const { data, error } = await _db
    .from('conta')
    .insert([{ id_cliente, nome_banco }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbAddContaComSaldo(id_cliente, nome_banco, saldo_inicial = 0) {
  const conta = await dbAddConta(id_cliente, nome_banco);
  const tipo  = await dbAddTipo(conta.id_conta, nome_banco, null, saldo_inicial, null);
  return { conta, tipo };
}

async function dbDeleteConta(id_conta) {
  const tipos = await dbGetTipos(id_conta);
  for (const t of tipos) {
    await _db.from('transacao').delete().eq('id_tipo', t.id_tipo);
    await _db.from('tipo').delete().eq('id_tipo', t.id_tipo);
  }
  const { error } = await _db.from('conta').delete().eq('id_conta', id_conta);
  if (error) throw error;
}

// Retorna o tipo padrão de uma conta (saldo_objetivo === null)
function getTipoPadrao(conta) {
  const tipos = conta.tipo || [];
  return tipos.find(t => t.saldo_objetivo === null) || tipos[0] || null;
}

/* ─── Metas ─── */
async function dbGetMetas(id_cliente) {
  const contas = await dbGetContas(id_cliente);
  const contaIds = contas.map(c => c.id_conta);
  if (!contaIds.length) return [];
  const { data, error } = await _db
    .from('tipo')
    .select('*, conta(*)')
    .in('id_conta', contaIds)
    .not('saldo_objetivo', 'is', null);
  if (error) throw error;
  return data;
}

async function dbAddMeta(id_conta, nomeJson, saldo_objetivo, saldo_atual, data_limite) {
  const { data, error } = await _db
    .from('tipo')
    .insert([{ id_conta, nome: nomeJson, saldo_objetivo, saldo_atual: saldo_atual || 0, data_limite: data_limite || null }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbAporteMeta(id_tipo, novo_saldo) {
  const { data, error } = await _db
    .from('tipo')
    .update({ saldo_atual: novo_saldo })
    .eq('id_tipo', id_tipo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbDeleteMeta(id_tipo) {
  await _db.from('transacao').delete().eq('id_tipo', id_tipo);
  const { error } = await _db.from('tipo').delete().eq('id_tipo', id_tipo);
  if (error) throw error;
}

async function dbUpdateSaldo(id_tipo, delta) {
  const { data: t } = await _db.from('tipo').select('saldo_atual').eq('id_tipo', id_tipo).single();
  const novo = (parseFloat(t?.saldo_atual) || 0) + delta;
  const { error } = await _db.from('tipo').update({ saldo_atual: novo }).eq('id_tipo', id_tipo);
  if (error) throw error;
  return novo;
}

/* ─── Tipos ─── */
async function dbGetTipos(id_conta) {
  const { data, error } = await _db
    .from('tipo')
    .select('*')
    .eq('id_conta', id_conta);
  if (error) throw error;
  return data;
}

async function dbAddTipo(id_conta, nome, saldo_objetivo = null, saldo_atual = null, data_limite = null) {
  const { data, error } = await _db
    .from('tipo')
    .insert([{ id_conta, nome, saldo_objetivo, saldo_atual, data_limite }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbDeleteTipo(id_tipo) {
  const { error } = await _db.from('tipo').delete().eq('id_tipo', id_tipo);
  if (error) throw error;
}

/* ─── Categorias ─── */
async function dbGetCategorias() {
  const { data, error } = await _db.from('categoria').select('*');
  if (error) throw error;
  return data;
}

async function dbAddCategoria(nome_categoria) {
  const { data, error } = await _db
    .from('categoria')
    .insert([{ nome_categoria }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbDeleteCategoria(id_categoria) {
  const { error } = await _db.from('categoria').delete().eq('id_categoria', id_categoria);
  if (error) throw error;
}

/* ─── Transações ─── */
async function dbGetTransacoes(id_tipo) {
  const { data, error } = await _db
    .from('transacao')
    .select('*, categoria(*), tipo(*)')
    .eq('id_tipo', id_tipo)
    .order('data_transacao', { ascending: false });
  if (error) throw error;
  return data;
}

async function dbGetTodasTransacoes(id_cliente) {
  const contas = await dbGetContas(id_cliente);
  const tipoIds = contas.flatMap(c => (c.tipo || []).map(t => t.id_tipo));
  if (!tipoIds.length) return [];
  const { data, error } = await _db
    .from('transacao')
    .select('*, categoria(*), tipo(*, conta(*))')
    .in('id_tipo', tipoIds)
    .order('data_transacao', { ascending: false });
  if (error) throw error;
  return data;
}

async function dbAddTransacao({ valor, data_transacao, descricao, titulo, id_categoria, quantidade_parcelas, id_tipo, debitocredito, efetividade, data_efetividade }) {
  const { data, error } = await _db
    .from('transacao')
    .insert([{ valor, data_transacao, descricao, titulo, id_categoria, quantidade_parcelas, id_tipo, debitocredito, efetividade, data_efetividade }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function dbDeleteTransacao(id_transacao) {
  const { error } = await _db.from('transacao').delete().eq('id_transacao', id_transacao);
  if (error) throw error;
}

async function dbUpdateTransacao(id_transacao, campos) {
  const { data, error } = await _db
    .from('transacao')
    .update(campos)
    .eq('id_transacao', id_transacao)
    .select()
    .single();
  if (error) throw error;
  return data;
}
