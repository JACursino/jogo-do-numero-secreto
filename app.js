/* ═══════════════════════════════════════════════════════════════ */
/* 🎮 VARIÁVEIS GLOBAIS DO JOGO */
/* ═══════════════════════════════════════════════════════════════ */

let listaDeNumerosSorteados = [];
let numeroLimite = 50;
let numeroSecreto = gerarNumeroAleatorio();
let tentativas = 1;

/* ═══════════════════════════════════════════════════════════════ */
/* ⏱️ VARIÁVEIS DO TEMPORIZADOR */
/* ═══════════════════════════════════════════════════════════════ */

let tempoDecorrido = 0;
let intervaloTempo;
const CHAVE_PLACAR = 'placarJogoSecreto';

/* ═══════════════════════════════════════════════════════════════ */
/* 💾 FUNÇÕES DE LOCALSTORAGE - PLACAR PERMANENTE */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Carrega o placar salvo no navegador
 * @returns {Array} Array com os recordes, ou array vazio se nenhum existir
 */
function carregarPlacar() {
    const dadosSalvos = localStorage.getItem(CHAVE_PLACAR);
    return dadosSalvos ? JSON.parse(dadosSalvos) : [];
}

/**
 * Salva o placar no localStorage do navegador
 * @param {Array} placar - Array contendo os recordes
 */
function salvarPlacar(placar) {
    localStorage.setItem(CHAVE_PLACAR, JSON.stringify(placar));
}

/* ═══════════════════════════════════════════════════════════════ */
/* ⏱️ FUNÇÕES DE TEMPORIZADOR */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Atualiza a exibição do tempo na tela
 * Formata o tempo em MM:SS (ex: 01:35)
 */
function atualizarExibicaoTempo() {
    // Calcula minutos e segundos
    let minutos = Math.floor(tempoDecorrido / 60);
    let segundos = tempoDecorrido % 60;

    // Adiciona o zero à esquerda com padStart (ex: 5s -> 05s)
    let tempoFormatado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

    // Atualiza o elemento no HTML
    document.getElementById('temporizador').innerHTML = tempoFormatado;
}

/**
 * Inicia o temporizador do jogo
 * Executa atualizarExibicaoTempo a cada 1 segundo
 */
function iniciarTemporizador() {
    tempoDecorrido = 0;
    atualizarExibicaoTempo();

    // Executa a cada 1000ms (1 segundo)
    intervaloTempo = setInterval(() => {
        tempoDecorrido++;
        atualizarExibicaoTempo();
    }, 1000);
}

/**
 * Para o temporizador
 * Limpa o intervalo para que a contagem não continue
 */
function pararTemporizador() {
    clearInterval(intervaloTempo);
}

/* ═══════════════════════════════════════════════════════════════ */
/* 📺 FUNÇÕES DE EXIBIÇÃO NA TELA */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Exibe texto em uma tag HTML e reproduz em voz alta
 * @param {string} tag - Seletor CSS da tag (ex: 'h1', 'p')
 * @param {string} texto - Texto a ser exibido
 */
function exibirTextoNaTela(tag, texto) {
    let campo = document.querySelector(tag);
    campo.innerHTML = texto;

    // Síntese de voz - fala em português brasileiro
    responsiveVoice.speak(texto, 'Brazilian Portuguese Female', {rate: 1.2});
}

/**
 * Exibe a mensagem inicial do jogo
 */
function exibirMensagemInicial() {
    exibirTextoNaTela('h1', 'Jogo do número secreto');
    exibirTextoNaTela('p', `Escolha um número entre 1 e ${numeroLimite}`);

    // Inicia o timer
    iniciarTemporizador();
    atualizarRecordeExibido();
    // Exibe o placar na tela
    exibirPlacarNaTela(carregarPlacar());
}

/**
 * Exibe o placar de recordes na tela
 * @param {Array} placar - Array contendo os recordes
 */
function exibirPlacarNaTela(placar) {
    const listaPlacar = document.getElementById('placarLista');

    // Limpa a lista anterior
    listaPlacar.innerHTML = '';

    // Se não houver registros, mostra mensagem
    if (placar.length === 0) {
        listaPlacar.innerHTML = '<li>Nenhum recorde ainda</li>';
        return;
    }

    // Cria um item <li> para cada recorde
    placar.forEach((registro, index) => {
        const item = document.createElement('li');
        item.innerHTML = `${index + 1}. ${registro.nome} - ${registro.tempo}s (${registro.tentativas} tent.)`;
        listaPlacar.appendChild(item);
    });
}

/* ═══════════════════════════════════════════════════════════════ */
/* 🎮 LÓGICA PRINCIPAL DO JOGO */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Verifica se o chute do usuário está correto
 */
function verificarChute() {
    // Pega o valor do input e remove espaços extras
    let chuteValor = document.querySelector('input').value.trim();

    // ✅ VALIDAÇÃO 1: Verifica se está vazio
    if (chuteValor === '') {
        alert('Por favor, digite um número!');
        return;
    }

    // ✅ VALIDAÇÃO 2: Converte para número inteiro
    let chute = parseInt(chuteValor);

    // ✅ VALIDAÇÃO 3: Verifica se é um número válido e está no intervalo
    if (isNaN(chute) || chute < 1 || chute > numeroLimite) {
        alert(`Digite um número válido entre 1 e ${numeroLimite}`);
        limparCampo();
        return;
    }
    if (chute == numeroSecreto)
    {
        // 🎉 ACERTOU!
        pararTemporizador(); // Para o timer na vitória

        exibirTextoNaTela('h1', 'Acertou!');

        // Define se foi "tentativa" ou "tentativas" (plural/singular)
        let palavraTentativa = tentativas > 1 ? 'tentativas' : 'tentativa';
        let mensagemTentativas = `Você descobriu o número secreto com ${tentativas} ${palavraTentativa} em ${tempoDecorrido} segundos!`;

        exibirTextoNaTela('p', mensagemTentativas);

        // Habilita o botão "Novo jogo"
        document.getElementById('reiniciar').removeAttribute('disabled');

        // Salva o recorde no localStorage
        salvarNovoRecorde();

    } else {
        // ❌ ERROU - Dá uma dica
        if (chute > numeroSecreto) {
            exibirTextoNaTela('p', 'O número secreto é menor');
        } else {
            exibirTextoNaTela('p', 'O número secreto é maior');
        }

        tentativas++;
        limparCampo();
    }
}

/**
 * 🆕 FUNÇÃO PARA SALVAR NOVO RECORDE
 * Pede o nome do jogador e salva no localStorage
 */
function salvarNovoRecorde() {
    let placar = carregarPlacar();

    // Pior tempo atual no placar (se houver 3 ou mais entradas)
    const piorTempoAtual = placar.length >= 3 ? placar[placar.length - 1].tempo : Infinity;

    // Só pede o nome se o tempo for bom o suficiente para entrar no Top 3
    if (placar.length < 3 || tempoDecorrido < piorTempoAtual) {

        const nomeJogador = prompt(`NOVO RECORDE! Você conseguiu ${tempoDecorrido}s! Digite seu nome:`).toLocaleLowerCase();

        if (nomeJogador) {
            // Cria o novo registro
            const novoRegistro = {
                nome: nomeJogador.substring(0, 10), // Limita a 10 caracteres
                tempo: tempoDecorrido,
                tentativas: tentativas
            };

            placar.push(novoRegistro);

            // Ordena: 1º por tempo (menor primeiro), 2º por tentativas (desempate)
            placar.sort((a, b) => {
                if (a.tempo === b.tempo) {
                    return a.tentativas - b.tentativas;
                }
                return a.tempo - b.tempo;
            });

            // 🔧 CORREÇÃO: Mantém os TOP 3
            placar = placar.slice(0, 3);

            salvarPlacar(placar);
            exibirPlacarNaTela(placar);
            atualizarRecordeExibido();
            responsiveVoice.speak('Parabéns, você entrou no placar de melhores tempos!', 'Brazilian Portuguese Female', {rate: 1.2});
        }
    } else {
        alert(`Seu tempo de ${tempoDecorrido}s não foi suficiente para o Top 3!`);
    }
}

/* ═══════════════════════════════════════════════════════════════ */
/* 🆕 FUNÇÃO PARA LIMPAR O PLACAR */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Limpa o placar de recordes
 * @returns {void}
 */
function limparPlacar() {
    // Pede confirmação antes de deletar (previne acidentes)
    if (confirm('⚠️ Tem certeza que quer limpar todos os recordes?\n\nEsta ação não pode ser desfeita!')) {

        // Remove os dados do localStorage
        localStorage.removeItem(CHAVE_PLACAR);

        // Atualiza a exibição do placar (mostra vazio)
        exibirPlacarNaTela([]);

        // Atualiza o recorde exibido (volta para "N/A")
        atualizarRecordeExibido();

        // Confirma a ação com mensagem
        alert('✅ Placar limpo com sucesso!\n\nTodos os recordes foram deletados.');

        // Opcional: Reproduz mensagem em voz alta
        responsiveVoice.speak('Placar limpo com sucesso!', 'Brazilian Portuguese Female', {rate: 1.2});
    } else {
        // Se o usuário clicou "Cancelar"
        console.log('Limpeza de placar cancelada pelo usuário');
    }
}


/* ═══════════════════════════════════════════════════════════════ */
/* 🆕 NOVA FUNÇÃO - ATUALIZAR RECORDE EXIBIDO NA TELA */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * 🆕 FUNÇÃO PARA EXIBIR O MELHOR TEMPO (RECORDE) NA TELA
 * @returns {void}
 */
function atualizarRecordeExibido() {
    const placar = carregarPlacar();
    const elementoRecorde = document.getElementById('recordeAtual');

    // Se o placar tem pelo menos um registro
    if (placar.length > 0) {
        // Pega o PRIMEIRO item (melhor tempo)
        const melhorTempo = placar[0].tempo;
        const melhorNome = placar[0].nome;

        // Exibe o tempo do melhor recorde
        elementoRecorde.innerHTML = `${melhorTempo}s (${melhorNome})`;
    } else {
        // Se não há recorde ainda
        elementoRecorde.innerHTML = 'N/A';
    }
}

/* ═══════════════════════════════════════════════════════════════ */
/* 🎲 GERADOR DE NÚMEROS ALEATÓRIOS */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Gera um número aleatório entre 1 e numeroLimite
 * Garante que não repita números até completar o ciclo
 * @returns {number} Número aleatório gerado
 */
function gerarNumeroAleatorio() {
    let numeroEscolhido = parseInt(Math.random() * numeroLimite + 1);
    let quantidadeDeElementosNaLista = listaDeNumerosSorteados.length;

    // Se já usou todos os números, reseta a lista
    if (quantidadeDeElementosNaLista == numeroLimite) {
        listaDeNumerosSorteados = [];
    }

    // Se o número já foi sorteado, gera outro
    if (listaDeNumerosSorteados.includes(numeroEscolhido)) {
        return gerarNumeroAleatorio();
    } else {
        listaDeNumerosSorteados.push(numeroEscolhido);
        return numeroEscolhido;
    }
}

/* ═══════════════════════════════════════════════════════════════ */
/* 🛠️ FUNÇÕES UTILITÁRIAS */
/* ═══════════════════════════════════════════════════════════════ */

/**
 * Limpa o campo de input
 */
function limparCampo() {
    let chute = document.querySelector('input');
    chute.value = '';
    chute.focus();
}

/**
 * Reinicia o jogo completamente
 */
function reiniciarJogo() {
    numeroSecreto = gerarNumeroAleatorio();
    limparCampo();
    tentativas = 1;
    exibirMensagemInicial();
    atualizarRecordeExibido();
    // Desabilita o botão "Novo jogo"
    document.getElementById('reiniciar').setAttribute('disabled', true);
}

/* ═══════════════════════════════════════════════════════════════ */
/* 🚀 INICIALIZAÇÃO - EXECUTA QUANDO A PÁGINA CARREGA */
/* ═══════════════════════════════════════════════════════════════ */

exibirMensagemInicial();
