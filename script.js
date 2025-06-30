let tabuada = null;
let perguntas = [];
let atual = 0;
let acertos = 0;
let respostas = [];  // guarda histórico respostas
let temporizadorId = null;
let tempoRestante = 30;

window.onload = () => {
  const select = document.getElementById('tabuada');
  for (let i = 0; i <= 10; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    select.appendChild(option);
  }
};

function iniciarJogo() {
  const valor = document.getElementById('tabuada').value;
  if (!valor) return alert('Escolha uma tabuada');

  tabuada = parseInt(valor);
  perguntas = Array.from({ length: 11 }, (_, i) => ({ fator: i, resultado: i * tabuada }))
    .sort(() => Math.random() - 0.5);

  atual = 0;
  acertos = 0;
  respostas = [];

  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('resultado').style.display = 'none';
  document.getElementById('reiniciar').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';

  mostrarPergunta();
}

function mostrarPergunta() {
  const pergunta = perguntas[atual];
  document.getElementById('pergunta').textContent = `Quanto é ${tabuada} x ${pergunta.fator}?`;
  const inputResposta = document.getElementById('resposta');
  inputResposta.value = '';
  inputResposta.focus();
  document.getElementById('feedback').textContent = '';

  // reset e iniciar temporizador
  tempoRestante = 30;
  atualizarTemporizador();
  if (temporizadorId) clearInterval(temporizadorId);
  temporizadorId = setInterval(() => {
    tempoRestante--;
    atualizarTemporizador();

    if (tempoRestante <= 0) {
      clearInterval(temporizadorId);
      registrarResposta(null, true); // resposta = null e timeout = true
    }
  }, 1000);
}

function atualizarTemporizador() {
  document.getElementById('temporizador').textContent = `Tempo restante: ${tempoRestante}s`;
}

function responder() {
  if (temporizadorId) {
    clearInterval(temporizadorId);
    temporizadorId = null;
  }
  const inputResposta = document.getElementById('resposta');
  const valor = parseInt(inputResposta.value);
  registrarResposta(valor, false);
}

function registrarResposta(valor, timeout) {
  const pergunta = perguntas[atual];
  const correta = pergunta.resultado;
  let acertou = false;
  let feedbackMsg = '';

  if (timeout) {
    feedbackMsg = `⏰ Tempo esgotado! Resposta correta: ${correta}`;
  } else if (isNaN(valor)) {
    alert('Digite um número válido!');
    // reinicia temporizador para continuar respondendo
    mostrarPergunta();
    return;
  } else if (valor === correta) {
    acertou = true;
    acertos++;
    feedbackMsg = '✅ Correto!';
  } else {
    feedbackMsg = `❌ Errado! Resposta correta: ${correta}`;
  }

  document.getElementById('feedback').textContent = feedbackMsg;

  respostas.push({
    fator: pergunta.fator,
    respostaUsuario: valor,
    respostaCorreta: correta,
    acertou,
    tempoEsgotado: timeout
  });

  atual++;

  if (atual < perguntas.length) {
    setTimeout(mostrarPergunta, 1500);
  } else {
    setTimeout(mostrarResultado, 1500);
  }
}

function finalizarJogo() {
  // Para o temporizador se estiver rodando
  if (temporizadorId) {
    clearInterval(temporizadorId);
    temporizadorId = null;
  }

  // Se a pergunta atual não foi respondida, registra como não respondida (tempo esgotado)
  if (atual < perguntas.length) {
    const perguntaAtual = perguntas[atual];
    respostas.push({
      fator: perguntaAtual.fator,
      respostaUsuario: null,
      respostaCorreta: perguntaAtual.resultado,
      acertou: false,
      tempoEsgotado: true,
    });
  }

  atual = perguntas.length; // marca fim do jogo
  mostrarResultado();
}

function mostrarResultado() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('resultado').style.display = 'block';
  document.getElementById('reiniciar').style.display = 'inline-block';

  const totalPerguntas = perguntas.length;
  const erros = respostas.filter(r => !r.acertou).length;

  let relatorioHTML = `
    <h2>Você acertou ${acertos} de ${totalPerguntas} perguntas!</h2>
    <h3>Erros: ${erros}</h3>
    <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th>Fórmula</th>
          <th>Sua resposta</th>
          <th>Correta</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  respostas.forEach(r => {
    let status = r.acertou ? '✅ Acertou' : r.tempoEsgotado ? '⏰ Tempo esgotado' : '❌ Errou';
    let respostaUsuario = (r.respostaUsuario === null || r.respostaUsuario === undefined) ? '-' : r.respostaUsuario;
    relatorioHTML += `
      <tr>
        <td>${tabuada} x ${r.fator}</td>
        <td style="text-align: center;">${respostaUsuario}</td>
        <td style="text-align: center;">${r.respostaCorreta}</td>
        <td style="text-align: center;">${status}</td>
      </tr>
    `;
  });

  relatorioHTML += `
      </tbody>
    </table>
  `;

  document.getElementById('resultado').innerHTML = relatorioHTML;
}

function reiniciarJogo() {
  if (temporizadorId) clearInterval(temporizadorId);
  document.getElementById('resultado').style.display = 'none';
  document.getElementById('reiniciar').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';

  // reset variables
  tabuada = null;
  perguntas = [];
  atual = 0;
  acertos = 0;
  respostas = [];

  // clear input and feedback
  document.getElementById('tabuada').value = '';
  document.getElementById('feedback').textContent = '';
  document.getElementById('resposta').value = '';
  document.getElementById('temporizador').textContent = 'Tempo restante: 30s';
}
