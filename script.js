let jogador = '';
let acertos = 0;
let erros = 0;
let inicio;
let questoes = [];
let questaoAtual = 0;

function iniciarJogo() {
  const nomeInput = document.getElementById("nome");
  jogador = nomeInput.value.trim();
  if (!jogador) {
    alert("Digite seu nome para começar.");
    return;
  }

  // Reset
  acertos = 0;
  erros = 0;
  questaoAtual = 0;
  questoes = [];

  for (let i = 0; i < 10; i++) {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    questoes.push({ a, b });
  }

  document.getElementById("inicio").style.display = "none";
  document.getElementById("jogo").style.display = "block";
  document.getElementById("resultado").style.display = "none";

  inicio = new Date();
  mostrarQuestao();
}

function mostrarQuestao() {
  const { a, b } = questoes[questaoAtual];
  document.getElementById("questao").textContent = `Quanto é ${a} x ${b}?`;
  document.getElementById("resposta").value = '';
  document.getElementById("feedback").textContent = '';
  document.getElementById("progresso").textContent = `Pergunta ${questaoAtual + 1} de ${questoes.length}`;
  document.getElementById("resposta").focus();
}

function verificarResposta() {
  const respostaInput = document.getElementById("resposta");
  const resposta = parseInt(respostaInput.value);
  const { a, b } = questoes[questaoAtual];

  if (resposta === a * b) {
    acertos++;
    document.getElementById("feedback").textContent = "✔️ Correto!";
  } else {
    erros++;
    document.getElementById("feedback").textContent = `❌ Errado! Resposta correta: ${a * b}`;
  }

  questaoAtual++;
  if (questaoAtual < questoes.length) {
    setTimeout(mostrarQuestao, 1000);
  } else {
    finalizarJogo();
  }
}

function finalizarJogo() {
  const tempo = Math.floor((new Date() - inicio) / 1000);
  const pontuacao = acertos * 100 - erros * 50 - tempo * 10;

  const resultadoAtual = {
    nome: jogador,
    acertos,
    erros,
    tempo,
    pontuacao,
    data: new Date().toLocaleString()
  };

  const ranking = JSON.parse(localStorage.getItem("rankingTabuada") || "[]");
  const ultimaTentativa = ranking.find(j => j.nome === jogador);
  
  const comparativoEl = document.getElementById("comparativo");
  if (ultimaTentativa) {
    if (pontuacao > ultimaTentativa.pontuacao) {
      comparativoEl.textContent = "🎉 Você foi melhor que a última vez!";
    } else if (pontuacao < ultimaTentativa.pontuacao) {
      comparativoEl.textContent = "😓 Você foi pior que a última vez.";
    } else {
      comparativoEl.textContent = "😐 Mesmo desempenho da última tentativa.";
    }
  } else {
    comparativoEl.textContent = "📌 Primeira tentativa registrada!";
  }

  // Atualiza ranking (substitui se já existir)
  const atualizado = ranking.filter(j => j.nome !== jogador);
  atualizado.push(resultadoAtual);

  // Ordena por pontuação
  atualizado.sort((a, b) => b.pontuacao - a.pontuacao);
  localStorage.setItem("rankingTabuada", JSON.stringify(atualizado));

  // Atualiza resultado
  document.getElementById("resumo").textContent = `Você acertou ${acertos}, errou ${erros}, e levou ${tempo}s.`;
  const rankingDiv = document.getElementById("ranking");

  rankingDiv.innerHTML = atualizado.map((j, i) => {
    const destaque = j.nome === jogador ? 'style="font-weight:bold; color:green;"' : '';
    return `<p ${destaque}>${i + 1}. ${j.nome} - ${j.acertos} acertos - ${j.erros} erros - ${j.tempo}s - ${j.data}</p>`;
  }).join('');

  document.getElementById("jogo").style.display = "none";
  document.getElementById("resultado").style.display = "block";
}

function recomecar() {
  document.getElementById("inicio").style.display = "block";
  document.getElementById("jogo").style.display = "none";
  document.getElementById("resultado").style.display = "none";
  document.getElementById("nome").value = '';
}
