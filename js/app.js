function addTransacao(dados) {
    const transacoes = loadData("finsight-transactions");
    const id = transacoes.length + 1;
    dados.id = id;
    transacoes.push(dados);
    saveData("finsight-transactions", transacoes)
}