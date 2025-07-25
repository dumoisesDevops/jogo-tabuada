// backend.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const RANKING_FILE = path.join(__dirname, 'ranking.json');

app.use(express.json());
app.use(express.static('public')); // para servir frontend estático

// Função para ler ranking JSON
function lerRanking() {
  try {
    if (!fs.existsSync(RANKING_FILE)) return [];
    const dados = fs.readFileSync(RANKING_FILE);
    return JSON.parse(dados);
  } catch (e) {
    console.error('Erro lendo ranking:', e);
    return [];
  }
}

// Função para salvar ranking JSON
function salvarRanking(ranking) {
  fs.writeFileSync(RANKING_FILE, JSON.stringify(ranking, null, 2));
}

// Rota para receber resultado e atualizar ranking
app.post('/api/salvarResultado', (req, res) => {
  const { nome, tabuada, acertos, total, tempoSegundos } = req.body;
  if (!nome || tabuada === undefined || acertos === undefined || total === undefined || tempoSegundos === undefined) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  let ranking = lerRanking();

  // Filtra histórico do jogador na mesma tabuada (se quiser comparar só pela tabuada)
  const historicoJogador = ranking.filter(r => r.nome === nome && r.tabuada === tabuada);

  // Monta o objeto do resultado atual
  const resultadoAtual = {
    nome,
    tabuada,
    acertos,
    total,
    tempoSegundos,
    data: new Date().toISOString()
  };

  ranking.push(resultadoAtual);

  // Ordena ranking geral por acertos desc e tempo asc
  ranking.sort((a, b) => {
    if (b.acertos !== a.acertos) return b.acertos - a.acertos;
    return a.tempoSegundos - b.tempoSegundos;
  });

  // Mantém só top 50 resultados (ou outro limite)
  ranking = ranking.slice(0, 50);

  salvarRanking(ranking);

  // Compara resultado atual com último resultado do jogador na mesma tabuada
  let mensagemComparativo = '';
  if (historicoJogador.length) {
    const ultimo = historicoJogador[historicoJogador.length - 1];
    if (acertos > ultimo.acertos) mensagemComparativo = '🚀 Você foi melhor que na última vez!';
    else if (acertos < ultimo.acertos) mensagemComparativo = '😕 Você foi pior que da última vez.';
    else {
      // Mesmos acertos, compara tempo
      if (tempoSegundos < ultimo.tempoSegundos) mensagemComparativo = '🚀 Você acertou o mesmo, mas respondeu mais rápido!';
      else if (tempoSegundos > ultimo.tempoSegundos) mensagemComparativo = '😐 Mesmo resultado da última vez, mas demorou mais.';
      else mensagemComparativo = '😐 Mesmo resultado e tempo da última tentativa.';
    }
  }

  res.json({ mensagemComparativo, ranking: ranking.slice(0, 10) });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
