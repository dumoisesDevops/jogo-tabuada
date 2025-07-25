// backend.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;
const RANKING_FILE = './ranking.json';

app.use(cors());
app.use(express.json());

function lerRanking() {
  try {
    const data = fs.readFileSync(RANKING_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function salvarRanking(ranking) {
  fs.writeFileSync(RANKING_FILE, JSON.stringify(ranking, null, 2));
}

app.get('/ranking/:tabuada', (req, res) => {
  const tabuada = req.params.tabuada;
  const ranking = lerRanking();
  const rankingTabuada = ranking.filter(r => r.tabuada == tabuada);
  rankingTabuada.sort((a,b) => b.pontuacao - a.pontuacao);
  res.json(rankingTabuada);
});

app.post('/resultado', (req, res) => {
  const resultado = req.body;
  if (!resultado.nome || !resultado.tabuada) {
    return res.status(400).json({ error: 'Nome e tabuada são obrigatórios' });
  }

  const ranking = lerRanking();

  // Remove registro antigo do jogador naquela tabuada
  const novoRanking = ranking.filter(r => !(r.nome === resultado.nome && r.tabuada == resultado.tabuada));
  
  novoRanking.push(resultado);
  salvarRanking(novoRanking);

  res.json({ message: 'Resultado salvo com sucesso' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
