/* ============================================================
   TREINO DE TABUADAS — JavaScript
   Organizado em blocos comentados para estudo.
   ============================================================ */

/* ------------------------------------------------------------
   1. ESTADO DA APLICAÇÃO
   ------------------------------------------------------------ */
const estado = {
  tabuada: 7,          // tabuada selecionada (1 a 10) ou "todas"
  modo: 'livre',       // 'livre' | 'desafio' | 'cronometro'
  a: 0,                // primeiro fator da conta atual
  b: 0,                // segundo fator da conta atual
  acertos: 0,
  tentativas: 0,
  questaoAtual: 0,     // contador de questões no modo desafio
  totalQuestoes: 10,   // total do modo desafio
  tempoRestante: 60,   // segundos do modo cronometrado
  cronometroId: null,  // id do setInterval do cronômetro
  inicioSessao: null,  // timestamp do início da sessão
  respondida: false,   // evita responder duas vezes a mesma conta
  ultimaConta: ''      // evita repetir a conta anterior
};

/* ------------------------------------------------------------
   2. REFERÊNCIAS DO DOM
   ------------------------------------------------------------ */
const el = {
  gradeTabuadas: document.getElementById('gradeTabuadas'),
  gradeModos: document.getElementById('gradeModos'),
  nomeAluna: document.getElementById('nomeAluna'),
  conta: document.getElementById('conta'),
  resposta: document.getElementById('resposta'),
  btnConfirmar: document.getElementById('btnConfirmar'),
  btnNova: document.getElementById('btnNova'),
  btnReiniciar: document.getElementById('btnReiniciar'),
  feedback: document.getElementById('feedback'),
  infoProgresso: document.getElementById('infoProgresso'),
  infoTempo: document.getElementById('infoTempo'),
  barraPreenchida: document.getElementById('barraPreenchida'),
  placarAcertos: document.getElementById('placarAcertos'),
  placarTentativas: document.getElementById('placarTentativas'),
  placarPercentual: document.getElementById('placarPercentual'),
  telaResultado: document.getElementById('telaResultado'),
  tituloResultado: document.getElementById('tituloResultado'),
  mensagemResultado: document.getElementById('mensagemResultado'),
  resAcertos: document.getElementById('resAcertos'),
  resErros: document.getElementById('resErros'),
  resPercentual: document.getElementById('resPercentual'),
  btnJogarNovamente: document.getElementById('btnJogarNovamente'),
  btnTrocarTabuada: document.getElementById('btnTrocarTabuada'),
  totalSessoes: document.getElementById('totalSessoes'),
  mediaGeral: document.getElementById('mediaGeral'),
  melhorGeral: document.getElementById('melhorGeral'),
  listaHistorico: document.getElementById('listaHistorico'),
  listaRanking: document.getElementById('listaRanking'),
  btnExportarAluna: document.getElementById('btnExportarAluna'),
  btnExportarTurma: document.getElementById('btnExportarTurma'),
  btnLimparHistorico: document.getElementById('btnLimparHistorico'),
  btnAtualizarRanking: document.getElementById('btnAtualizarRanking')
};

/* ------------------------------------------------------------
   3. MONTAGEM DOS BOTÕES DE TABUADA E MODO
   ------------------------------------------------------------ */
function montarTabuadas() {
  // Cria botões de 1 a 10 + opção "Todas"
  for (let i = 1; i <= 10; i++) {
    const botao = document.createElement('button');
    botao.className = 'botao-tabuada';
    botao.textContent = i;
    botao.dataset.tabuada = i;
    botao.setAttribute('aria-pressed', 'false');
    if (i === estado.tabuada) {
      botao.classList.add('ativo');
      botao.setAttribute('aria-pressed', 'true');
    }
    botao.addEventListener('click', () => selecionarTabuada(i));
    el.gradeTabuadas.appendChild(botao);
  }

  // Botão "Todas"
  const botaoTodas = document.createElement('button');
  botaoTodas.className = 'botao-tabuada';
  botaoTodas.textContent = 'Todas';
  botaoTodas.dataset.tabuada = 'todas';
  botaoTodas.setAttribute('aria-pressed', 'false');
  botaoTodas.addEventListener('click', () => selecionarTabuada('todas'));
  el.gradeTabuadas.appendChild(botaoTodas);
}

function selecionarTabuada(valor) {
  estado.tabuada = valor;

  // Atualiza visual dos botões
  document.querySelectorAll('.botao-tabuada').forEach(b => {
    const ativo = String(b.dataset.tabuada) === String(valor);
    b.classList.toggle('ativo', ativo);
    b.setAttribute('aria-pressed', ativo ? 'true' : 'false');
  });

  iniciarModo(estado.modo);
}

function selecionarModo(modo) {
  estado.modo = modo;

  document.querySelectorAll('.botao-modo').forEach(b => {
    b.classList.toggle('ativo', b.dataset.modo === modo);
  });

  iniciarModo(modo);
}

/* ------------------------------------------------------------
   4. CONTROLE DOS MODOS DE JOGO
   ------------------------------------------------------------ */
function iniciarModo(modo) {
  // Zera o placar e prepara a sessão
  estado.acertos = 0;
  estado.tentativas = 0;
  estado.questaoAtual = 0;
  estado.respondida = false;
  estado.ultimaConta = '';
  estado.inicioSessao = Date.now();

  pararCronometro();
  el.telaResultado.classList.add('oculto');
  el.cartaoJogoVisivel(true);
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';

  if (modo === 'desafio') {
    el.infoProgresso.textContent = `Questão 1 de ${estado.totalQuestoes}`;
    el.infoTempo.classList.add('oculto');
    atualizarBarra(0, estado.totalQuestoes);
  } else if (modo === 'cronometro') {
    estado.tempoRestante = 60;
    el.infoProgresso.textContent = 'Responda o máximo que puder';
    el.infoTempo.classList.remove('oculto', 'urgente');
    el.infoTempo.textContent = '60s';
    atualizarBarra(60, 60);
    iniciarCronometro();
  } else {
    el.infoProgresso.textContent = 'Modo livre';
    el.infoTempo.classList.add('oculto');
    atualizarBarra(0, 1);
  }

  atualizarPlacar();
  gerarQuestao();
}

function iniciarCronometro() {
  estado.cronometroId = setInterval(() => {
    estado.tempoRestante--;
    el.infoTempo.textContent = estado.tempoRestante + 's';
    atualizarBarra(estado.tempoRestante, 60);

    if (estado.tempoRestante <= 10) {
      el.infoTempo.classList.add('urgente');
    }

    if (estado.tempoRestante <= 0) {
      pararCronometro();
      finalizarSessao();
    }
  }, 1000);
}

function pararCronometro() {
  if (estado.cronometroId) {
    clearInterval(estado.cronometroId);
    estado.cronometroId = null;
  }
}

function atualizarBarra(atual, total) {
  const pct = total > 0 ? (atual / total) * 100 : 0;
  el.barraPreenchida.style.width = Math.min(100, pct) + '%';
}

/* ------------------------------------------------------------
   5. GERAÇÃO DE QUESTÕES
   ------------------------------------------------------------ */
function gerarQuestao() {
  let a, b, chave;

  // Sorteia até não repetir a conta anterior
  do {
    if (estado.tabuada === 'todas') {
      a = Math.floor(Math.random() * 10) + 1;
    } else {
      a = Number(estado.tabuada);
    }
    b = Math.floor(Math.random() * 10) + 1;
    chave = a + 'x' + b;
  } while (chave === estado.ultimaConta);

  estado.a = a;
  estado.b = b;
  estado.ultimaConta = chave;
  estado.respondida = false;

  el.conta.textContent = `${a} × ${b} = ?`;
  el.conta.className = 'conta';
  el.resposta.value = '';
  el.resposta.disabled = false;
  el.btnConfirmar.disabled = false;
  el.feedback.textContent = '';
  el.feedback.className = 'feedback';
  el.resposta.focus();
}

/* ------------------------------------------------------------
   6. VALIDAÇÃO DA RESPOSTA
   ------------------------------------------------------------ */
function validarResposta() {
  if (estado.respondida) return;

  const valor = el.resposta.value.trim();
  if (valor === '') {
    el.feedback.textContent = 'Digite um número antes de confirmar.';
    el.feedback.className = 'feedback errado';
    return;
  }

  const correta = estado.a * estado.b;
  const resposta = Number(valor);

  estado.tentativas++;
  estado.respondida = true;
  el.resposta.disabled = true;
  el.btnConfirmar.disabled = true;

  if (resposta === correta) {
    estado.acertos++;
    el.conta.classList.add('acerto');
    el.feedback.textContent = 'Acertou! Muito bem!';
    el.feedback.className = 'feedback certo';
  } else {
    el.conta.classList.add('erro');
    el.feedback.textContent = `Quase! ${estado.a} × ${estado.b} = ${correta}`;
    el.feedback.className = 'feedback errado';
  }

  atualizarPlacar();

  // No modo desafio, avança o contador de questões
  if (estado.modo === 'desafio') {
    estado.questaoAtual++;
    atualizarBarra(estado.questaoAtual, estado.totalQuestoes);

    if (estado.questaoAtual >= estado.totalQuestoes) {
      setTimeout(finalizarSessao, 900);
      return;
    }
    el.infoProgresso.textContent =
      `Questão ${estado.questaoAtual + 1} de ${estado.totalQuestoes}`;
  }

  // Avança automaticamente após um instante
  setTimeout(() => {
    if (estado.modo !== 'desafio' || estado.questaoAtual < estado.totalQuestoes) {
      gerarQuestao();
    }
  }, 1100);
}

/* ------------------------------------------------------------
   7. PLACAR
   ------------------------------------------------------------ */
function atualizarPlacar() {
  el.placarAcertos.textContent = estado.acertos;
  el.placarTentativas.textContent = estado.tentativas;

  const pct = estado.tentativas > 0
    ? Math.round((estado.acertos / estado.tentativas) * 100)
    : 0;
  el.placarPercentual.textContent = pct + '%';
}

/* ------------------------------------------------------------
   8. FINALIZAÇÃO DA SESSÃO
   ------------------------------------------------------------ */
function finalizarSessao() {
  pararCronometro();
  el.cartaoJogoVisivel(false);

  const erros = estado.tentativas - estado.acertos;
  const pct = estado.tentativas > 0
    ? Math.round((estado.acertos / estado.tentativas) * 100)
    : 0;

  el.resAcertos.textContent = estado.acertos;
  el.resErros.textContent = erros;
  el.resPercentual.textContent = pct + '%';

  el.tituloResultado.textContent =
    estado.modo === 'desafio' ? 'Desafio concluído!' : 'Tempo encerrado!';

  // Mensagem de desempenho
  let mensagem;
  if (pct >= 90) mensagem = 'Excelente! Você dominou a tabuada.';
  else if (pct >= 70) mensagem = 'Muito bom! Está quase perfeito.';
  else if (pct >= 50) mensagem = 'Bom trabalho! Continue praticando.';
  else mensagem = 'Continue treinando, você vai chegar lá!';
  el.mensagemResultado.textContent = mensagem;

  el.telaResultado.classList.remove('oculto');
  el.telaResultado.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Salva a sessão no histórico
  const segundos = Math.round((Date.now() - estado.inicioSessao) / 1000);
  salvarSessao({
    data: new Date().toISOString(),
    modo: estado.modo,
    tabuada: estado.tabuada === 'todas' ? 'Todas' : estado.tabuada,
    acertos: estado.acertos,
    tentativas: estado.tentativas,
    percentual: pct,
    tempo: segundos
  });

  renderizarDesempenho();
  renderizarRanking();
}

/* ------------------------------------------------------------
   9. ARMAZENAMENTO POR ALUNA
   ------------------------------------------------------------ */
const PREFIXO = 'tabuadas_aluna_';

function nomeAtual() {
  return el.nomeAluna.value.trim();
}

function chaveAluna(nome) {
  return PREFIXO + nome.toLowerCase();
}

function carregarHistorico(nome) {
  if (!nome) return [];
  try {
    return JSON.parse(localStorage.getItem(chaveAluna(nome))) || [];
  } catch (e) {
    return [];
  }
}

function salvarSessao(sessao) {
  const nome = nomeAtual();
  if (!nome) {
    el.feedback.textContent =
      'Preencha seu nome para salvar o desempenho.';
    el.feedback.className = 'feedback errado';
    return;
  }

  const historico = carregarHistorico(nome);
  historico.push(sessao);
  localStorage.setItem(chaveAluna(nome), JSON.stringify(historico));
}

/* ------------------------------------------------------------
   10. RENDERIZAÇÃO DO DESEMPENHO
   ------------------------------------------------------------ */
function renderizarDesempenho() {
  const nome = nomeAtual();
  const historico = carregarHistorico(nome);

  el.listaHistorico.innerHTML = '';

  if (historico.length === 0) {
    el.totalSessoes.textContent = '0';
    el.mediaGeral.textContent = '0%';
    el.melhorGeral.textContent = '0%';
    el.listaHistorico.innerHTML =
      '<p class="vazio">Nenhuma sessão registrada ainda. ' +
      'Complete um Desafio 10 ou um Cronometrado.</p>';
    return;
  }

  // Resumo
  const total = historico.length;
  const soma = historico.reduce((acc, s) => acc + s.percentual, 0);
  const media = Math.round(soma / total);
  const melhor = Math.max(...historico.map(s => s.percentual));

  el.totalSessoes.textContent = total;
  el.mediaGeral.textContent = media + '%';
  el.melhorGeral.textContent = melhor + '%';

  // Últimas 20 sessões, mais recentes primeiro
  const recentes = historico.slice(-20).reverse();

  recentes.forEach(s => {
    const data = new Date(s.data);
    const dataFormatada = data.toLocaleDateString('pt-BR');
    const horaFormatada = data.toLocaleTimeString('pt-BR',
      { hour: '2-digit', minute: '2-digit' });
    const modoNome = s.modo === 'desafio' ? 'Desafio 10' : 'Cronometrado';

    const linha = document.createElement('div');
    linha.className = 'linha-historico';
    linha.innerHTML = `
      <div class="dados">
        <strong>${modoNome} · Tabuada ${s.tabuada}</strong>
        <span class="detalhe">${dataFormatada} às ${horaFormatada} ·
          ${s.acertos}/${s.tentativas} acertos</span>
      </div>
      <span class="percentual">${s.percentual}%</span>
    `;
    el.listaHistorico.appendChild(linha);
  });
}

/* ------------------------------------------------------------
   11. RANKING DA TURMA
   ------------------------------------------------------------ */
function coletarTodasAsAlunas() {
  const alunas = {};

  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (!chave.startsWith(PREFIXO)) continue;

    const nome = chave.replace(PREFIXO, '');
    try {
      const historico = JSON.parse(localStorage.getItem(chave)) || [];
      if (historico.length > 0) {
        alunas[nome] = historico;
      }
    } catch (e) {
      // Ignora registros corrompidos
    }
  }

  return alunas;
}

function calcularRanking() {
  const alunas = coletarTodasAsAlunas();
  const lista = [];

  for (const nome in alunas) {
    const historico = alunas[nome];
    const sessoes = historico.length;
    const soma = historico.reduce((acc, s) => acc + s.percentual, 0);
    const media = soma / sessoes;
    const melhor = Math.max(...historico.map(s => s.percentual));
    const totalAcertos = historico.reduce((acc, s) => acc + s.acertos, 0);

    lista.push({ nome, sessoes, media, melhor, totalAcertos });
  }

  // Ordena por média, depois sessões, depois acertos
  lista.sort((x, y) => {
    if (y.media !== x.media) return y.media - x.media;
    if (y.sessoes !== x.sessoes) return y.sessoes - x.sessoes;
    return y.totalAcertos - x.totalAcertos;
  });

  return lista;
}

function renderizarRanking() {
  const lista = calcularRanking();
  const atual = nomeAtual().toLowerCase();

  el.listaRanking.innerHTML = '';

  if (lista.length === 0) {
    el.listaRanking.innerHTML =
      '<p class="vazio">Ainda não há sessões registradas. ' +
      'Complete um Desafio 10 ou um Cronometrado para entrar no ranking.</p>';
    return;
  }

  lista.forEach((aluna, indice) => {
    const posicao = indice + 1;
    let classePosicao = '';
    let medalha = posicao;

    if (posicao === 1) { classePosicao = 'ouro'; medalha = '1º'; }
    else if (posicao === 2) { classePosicao = 'prata'; medalha = '2º'; }
    else if (posicao === 3) { classePosicao = 'bronze'; medalha = '3º'; }

    const ehAtual = aluna.nome === atual;

    const linha = document.createElement('div');
    linha.className = 'linha-ranking' + (ehAtual ? ' atual' : '');
    linha.innerHTML = `
      <span class="posicao ${classePosicao}">${medalha}</span>
      <div class="dados">
        <strong>${aluna.nome.charAt(0).toUpperCase() + aluna.nome.slice(1)}</strong>
        <span class="detalhe">${aluna.sessoes} sessões ·
          melhor ${aluna.melhor}%</span>
      </div>
      <span class="percentual">${aluna.media.toFixed(1).replace('.', ',')}%</span>
    `;
    el.listaRanking.appendChild(linha);
  });
}

/* ------------------------------------------------------------
   12. EXPORTAÇÃO CSV
   ------------------------------------------------------------ */
function gerarLinhasCSV(historico, nome) {
  const linhas = [];

  historico.forEach(s => {
    const data = new Date(s.data);
    const dia = data.toLocaleDateString('pt-BR');
    const hora = data.toLocaleTimeString('pt-BR',
      { hour: '2-digit', minute: '2-digit' });
    const modoNome = s.modo === 'desafio' ? 'Desafio 10' : 'Cronometrado';
    const pct = s.percentual.toFixed(1).replace('.', ',');

    linhas.push([
      nome, dia, hora, modoNome, s.tabuada,
      s.acertos, s.tentativas, pct, s.tempo
    ].join(';'));
  });

  return linhas;
}

function exportarCSV(escopo) {
  const cabecalho =
    'Aluna;Data;Hora;Modo;Tabuada;Acertos;Tentativas;Percentual;Tempo (segundos)';
  let linhas = [];
  let nomeArquivo = '';

  const hoje = new Date().toISOString().slice(0, 10);

  if (escopo === 'aluna') {
    const nome = nomeAtual();
    const historico = carregarHistorico(nome);

    if (!nome || historico.length === 0) {
      alert('Não há registros desta aluna para exportar.');
      return;
    }

    linhas = gerarLinhasCSV(historico, nome);
    nomeArquivo = `desempenho-tabuadas-${hoje}.csv`;
  } else {
    const alunas = coletarTodasAsAlunas();
    const nomes = Object.keys(alunas);

    if (nomes.length === 0) {
      alert('Não há registros da turma para exportar.');
      return;
    }

    nomes.forEach(nome => {
      linhas = linhas.concat(gerarLinhasCSV(alunas[nome], nome));
    });

    nomeArquivo = `desempenho-tabuadas-turma-${hoje}.csv`;
  }

  // BOM UTF-8 para acentuação correta no Excel
  const conteudo = '\uFEFF' + [cabecalho, ...linhas].join('\r\n');
  baixarArquivo(conteudo, nomeArquivo);
}

function baixarArquivo(conteudo, nomeArquivo) {
  const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------
   13. LIMPEZA DO HISTÓRICO
   ------------------------------------------------------------ */
function limparHistorico() {
  const nome = nomeAtual();

  if (!nome) {
    alert('Preencha o nome da aluna primeiro.');
    return;
  }

  if (!confirm(`Apagar todo o histórico de ${nome}?`)) return;

  localStorage.removeItem(chaveAluna(nome));
  renderizarDesempenho();
  renderizarRanking();
}

/* ------------------------------------------------------------
   14. EVENTOS
   ------------------------------------------------------------ */
el.btnConfirmar.addEventListener('click', validarResposta);

el.resposta.addEventListener('keydown', e => {
  if (e.key === 'Enter') validarResposta();
});

el.btnNova.addEventListener('click', gerarQuestao);

el.btnReiniciar.addEventListener('click', () => {
  if (confirm('Reiniciar o treino? O placar será zerado.')) {
    iniciarModo(estado.modo);
  }
});

el.btnJogarNovamente.addEventListener('click', () => {
  iniciarModo(estado.modo);
});

el.btnTrocarTabuada.addEventListener('click', () => {
  el.telaResultado.classList.add('oculto');
  el.cartaoJogoVisivel(true);
  document.querySelector('.grade-tabuadas')
    .scrollIntoView({ behavior: 'smooth', block: 'center' });
});

el.gradeModos.addEventListener('click', e => {
  const botao = e.target.closest('.botao-modo');
  if (botao) selecionarModo(botao.dataset.modo);
});

el.nomeAluna.addEventListener('input', () => {
  localStorage.setItem('tabuadas_ultimo_nome', el.nomeAluna.value.trim());
  renderizarDesempenho();
  renderizarRanking();
});

el.btnExportarAluna.addEventListener('click', () => exportarCSV('aluna'));
el.btnExportarTurma.addEventListener('click', () => exportarCSV('turma'));
el.btnLimparHistorico.addEventListener('click', limparHistorico);
el.btnAtualizarRanking.addEventListener('click', renderizarRanking);

/* ------------------------------------------------------------
   15. INICIALIZAÇÃO
   ------------------------------------------------------------ */
function iniciar() {
  montarTabuadas();

  // Recupera o último nome usado
  const ultimoNome = localStorage.getItem('tabuadas_ultimo_nome');
  if (ultimoNome) el.nomeAluna.value = ultimoNome;

  iniciarModo('livre');
  renderizarDesempenho();
  renderizarRanking();
}

iniciar();