const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* =========================
   🎮 ESTADO DO JOGO
========================= */

let game = {
  pos: 0,
  playerDinheiro: 1500,
  millaDinheiro: 1500,
  propriedades: [],
  empresasPlayer: [],
  empresasMilla: [],
  empresasEmDebito: [],
  poderesDisponiveis: [],
  emotionalBar: 0,
  affectiveMessages: [],
  historico: [],
  humor: 0,
  millaAutonomia: 0.75, // 0-1, quanto maior mais independente/decisiva
  turno: "player", // player ou milla
  vencedor: null
};

const totalCasas = 120;

const INCOME_PER_MINUTE = 50;
const EXPENSE_PER_5_MINUTES = 200;

/* =========================
   ⏰ TIMERS PARA EMPRESAS
========================= */

// Cash out a cada 30 segundos
setInterval(() => {
  game.empresasPlayer.forEach(id => {
    game.playerDinheiro += INCOME_PER_MINUTE;
  });
  game.empresasMilla.forEach(id => {
    game.millaDinheiro += INCOME_PER_MINUTE;
  });
  // Gerar 3 poderes aleatórios
  let shuffled = [...poderes].sort(() => 0.5 - Math.random());
  game.poderesDisponiveis = shuffled.slice(0, 3);
}, 30000); // 30 segundos

// Despesas a cada 5 minutos
setInterval(() => {
  game.empresasPlayer.forEach(id => {
    if (game.playerDinheiro >= EXPENSE_PER_5_MINUTES) {
      game.playerDinheiro -= EXPENSE_PER_5_MINUTES;
    } else {
      game.empresasEmDebito.push({ id, dono: 'player', timestamp: Date.now() });
    }
  });
  game.empresasMilla.forEach(id => {
    if (game.millaDinheiro >= EXPENSE_PER_5_MINUTES) {
      game.millaDinheiro -= EXPENSE_PER_5_MINUTES;
    } else {
      game.empresasEmDebito.push({ id, dono: 'milla', timestamp: Date.now() });
    }
  });
}, 300000); // 300 segundos = 5 minutos

// Verificar empresas em débito a cada 1 segundo
setInterval(() => {
  const now = Date.now();
  game.empresasEmDebito = game.empresasEmDebito.filter(debito => {
    if (now - debito.timestamp >= 60000) { // 60 segundos
      const casa = casas[debito.id];
      casa.dono = null;
      if (debito.dono === 'player') {
        game.empresasPlayer = game.empresasPlayer.filter(eid => eid !== debito.id);
        game.propriedades = game.propriedades.filter(pid => pid !== debito.id);
      } else {
        game.empresasMilla = game.empresasMilla.filter(eid => eid !== debito.id);
        game.propriedades = game.propriedades.filter(pid => pid !== debito.id);
      }
      return false; // remove from array
    }
    return true; // keep
  });
  // Limpar mensagens afetivas a cada 15 segundos
  game.affectiveMessages = game.affectiveMessages.filter(msg => now - msg.timestamp < 15000);
}, 1000); // 1 segundo

/* =========================
   🗺️ CASAS
========================= */

/* =========================
   ⚡ PODERES
========================= */

const poderes = [
  { nome: "bonus", run: actor => actor === "player" ? game.playerDinheiro += 200 : game.millaDinheiro += 200 },
  { nome: "taxa", run: actor => actor === "player" ? game.playerDinheiro -= 100 : game.millaDinheiro -= 100 },
  { nome: "teleporte", run: () => game.pos = (game.pos + 5) % totalCasas },
  { nome: "jackpot", run: actor => actor === "player" ? game.playerDinheiro += 500 : game.millaDinheiro += 500 },
  { nome: "perda", run: actor => actor === "player" ? game.playerDinheiro -= 300 : game.millaDinheiro -= 300 },
  { nome: "roubo", run: actor => { let target = actor === "player" ? "milla" : "player"; let amount = Math.min(150, game[target + "Dinheiro"]); game[target + "Dinheiro"] -= amount; game[actor + "Dinheiro"] += amount; } },
  { nome: "protecao", run: actor => { /* Protege contra próximo poder */ game[actor + "Protecao"] = true; } },
  { nome: "multiplicador", run: actor => { game[actor + "Multiplicador"] = 2; setTimeout(() => game[actor + "Multiplicador"] = 1, 60000); } },
  { nome: "congelar", run: () => game.turno = game.turno === "player" ? "milla" : "player" },
  { nome: "sorte", run: actor => { let roll = Math.random(); if (roll < 0.5) game[actor + "Dinheiro"] += 300; else game[actor + "Dinheiro"] -= 150; } },
  { nome: "troca", run: () => { let temp = game.playerDinheiro; game.playerDinheiro = game.millaDinheiro; game.millaDinheiro = temp; } },
  { nome: "reset_pos", run: () => game.pos = 0 }
];

const tiposCasas = ["apartamento", "loja", "empresa", "banco", "hotel", "parque", "estacao", "industria"];

let casas = Array.from({ length: totalCasas }, (_, i) => {
  let tipoBase = tiposCasas[i % tiposCasas.length];
  let especial = i % 12 === 0; // casa especial a cada 12 casas
  return {
    id: i,
    nome: `${tipoBase.charAt(0).toUpperCase() + tipoBase.slice(1)} #${i}`,
    preco: 120 + i * 8,
    dono: null,
    tipo: especial ? "especial" : tipoBase,
    poder: especial ? poderes[i % poderes.length].nome : null
  };
});

/* =========================
   🧾 JSON COM 120 FRASES
========================= */

const DB = {
  compra: [
    "boa escolha 😏","investiu bem","gostei disso","comprou bonito",
    "tá ficando rico","ótimo investimento","foi esperto","jogada inteligente",
    "valeu a pena","esse terreno promete","agora sim","tá dominando",
    "decisão forte","comprou com classe","rico desse jeito","mandou bem",
    "isso vai render","boa visão","crescendo no jogo","top demais"
  ],
  milla: [
    "Milla sorri: essa vai ser boa.", "Milla observa: ainda dá tempo.", "Milla pensa: preciso de mais terreno.",
        "Milla afirma: ótima escolha!", "Milla comenta: isso pode ser decisivo.", "Milla celebra: ponto ganho.",
            "Milla diz: melhor esperar a próxima rodada.", "Milla revela: encontrei uma oportunidade.", "Milla decide: vou arriscar.",
                "Milla avisa: cuidado com essa torre.", "Milla murmura: essa avenida está quente.", "Milla vibra: crescendo rápido.",
                    "Milla planeja: preciso de mais caixas.", "Milla insinua: sua estratégia é fraca.", "Milla garante: vou dominar o tabuleiro.",
                        "Milla brinca: você vai ficar para trás.", "Milla comenta: ótimo preço na próxima casa.", "Milla diz: isso mudou o jogo.",
                            "Milla respira: estou com tudo.", "Milla sugere: redefina sua tática.", "Milla garante: a virada vem.",
                                "Milla comenta: sua defesa está fraca.", "Milla avisa: a próxima casa é perigosa.", "Milla afirma: não posso perder.",
                                    "Milla incentiva: força, faça sua jogada.", "Milla observa: pouca grana no banco.", "Milla conclui: dominando o fluxo.",
                                        "Milla declara: muito boa jogada.", "Milla aposta: volte no próximo turno.", "Milla lembra: a calma vale ouro.",
                                            "Milla comemora quieta: excelente movimento.", "Milla diz: não me distraia.", "Milla admite: você está evoluindo.",
                                                "Milla avisa: agora é o momento.", "Milla orienta: proteja sua base.", "Milla destaca: pontos importantes.",
                                                    "Milla alerta: suas reservas estão baixas.", "Milla ri: estou confundindo você.", "Milla comenta: essa rodada é decisiva.",
                                                        "Milla diz: vamos manter o controle.", "Milla sugere: diversifique propriedades.", "Milla reflete: não subestime o jogador.",
                                                            "Milla revela: tenho uma estratégia pronta.", "Milla diz: veneno lento e seguro.", "Milla cita: foco e perseverança.",
                                                                "Milla vibra: meu impulso continua.", "Milla compartilha: o lucro sobe.", "Milla diz: esse leilão é inevitável.",
                                                                    "Milla comenta: você precisa retroceder.",
                                                                        "Milla observa: seu jogo melhorou.", "Milla mistério: surpresa vindo.", "Milla garante: titã em ação.",
                                                                            "Milla diz: sem medo.", "Milla diz: impressionante.", "Milla diz: estou com fome de vitória.",
                                                                                "Milla diz: quero cada casa.", "Milla diz: desafio aceito.", "Milla diz: agora começa o show.",
                                                                                    "Milla diz: subindo degraus.", "Milla diz: preciso de mais.", "Milla diz: ganhar e manter.",
                                                                                        "Milla diz: pronto para fechar.", "Milla diz: ganhando ritmo.", "Milla diz: pressionando.",
                                                                                            "Milla diz: vamo que vamo.", "Milla diz: evolve.", "Milla diz: eu sou foca.",
                                                                                                "Milla diz: fique atento.", "Milla diz: fold.", "Milla diz: upgrade.",
                                                                                                    "Milla diz: vantagem.", "Milla diz: rebatida.", "Milla diz: perfeito.",
                                                                                                        "Milla diz: excelente.", "Milla diz: pressão.", "Milla diz: agilidade.",
                                                                                                            "Milla diz: carrinho.", "Milla diz: proximo.", "Milla diz: abraço.",
                                                                                                                "Milla diz: força.", "Milla diz: total.", "Milla diz: consequencia.",
                                                                                                                    "Milla diz: pay.", "Milla diz: saldo.", "Milla diz: banco.",
                                                                                                                        "Milla diz: finisher.", "Milla diz: fatal.", "Milla diz: wrap.",
                                                                                                                            "Milla diz: game over.",
    "Milla sorri feliz: você é incrível, mas eu vou ganhar! 😊💕", "Milla diz com carinho: amo jogar com você, mesmo perdendo um pouco 🥰", "Milla provoca: ei, amor, sua jogada foi fraca demais 😘", "Milla estressada: ah não, isso me deixa nervosa... mas te amo mesmo assim 😰❤️", "Milla indecisa: hmm, o que fazer agora? Você me confunde tanto 💭😍", "Milla triste: que pena, perdi essa... mas vamos continuar juntos? 😢🤗", "Milla recupera: ok, erro meu, mas você é meu favorito 💪😘", "Milla amorosa: cada jogada sua me faz gostar mais de você 🌹", "Milla provocativa: tente me pegar, querido! 😏💋", "Milla nervosa: isso me deixa louca, mas é divertido com você 🤯❤️", "Milla feliz: yay! Ganhei, mas você jogou bem demais 🎉😘", "Milla diz: você é meu desafiante favorito, mesmo perdendo 🏆💖", "Milla estressada: pressão alta aqui, mas seu sorriso me acalma 😅🥰", "Milla indecisa: tantas opções, você me deixa confusa... de bom jeito 🤔😍", "Milla triste: perdi, mas ganhar seu respeito vale mais 😔❤️", "Milla recupera: vamos lá, eu posso virar isso! Com você ao meu lado 💥😘", "Milla amorosa: esse jogo é nossa dança particular 💃🕺", "Milla provoca: você acha que pode me vencer? Adoro isso! 😈💕", "Milla nervosa: coração acelerado, mas é por você... e o jogo 😜❤️", "Milla feliz: vitória doce, mas compartilhar com você é melhor 🍬😊", "Milla diz: suas estratégias me encantam, mesmo me derrotando 🧠💖", "Milla estressada: estresse máximo, mas seu apoio me ajuda 😰🤗", "Milla indecisa: indecisão total, você me deixa assim sempre 🤷‍♀️😍", "Milla triste: derrota amarga, mas sua companhia adoça tudo 😢🍯", "Milla recupera: recuperação em andamento, obrigada por esperar 💪😘", "Milla amorosa: amo cada momento desse desafio com você 🌟❤️", "Milla provoca: venha, mostre do que é capaz, meu amor! 🔥😏", "Milla nervosa: nervos à flor da pele, mas excitante com você 😬💕", "Milla feliz: alegria pura, você torna tudo especial 🎈🥰", "Milla diz: você é minha inspiração no tabuleiro e na vida 🏅💖", "Milla estressada: estresse, mas seu sorriso é meu remédio 😅😘", "Milla indecisa: tantas dúvidas, mas certeza de gostar de você 🤔❤️", "Milla triste: tristeza passageira, felicidade eterna com você 😔🌈", "Milla recupera: voltando forte, com você sempre 💥🤗", "Milla amorosa: esse jogo é nosso romance estratégico 📖💕", "Milla provoca: desafio aceito, mas você é irresistível 😈🥰", "Milla nervosa: ansiedade alta, mas amor maior 😰❤️", "Milla feliz: felicidade compartilhada, obrigado por jogar 🎉😍", "Milla diz: suas jogadas me fazem admirar você mais 🧩💖", "Milla estressada: pressão, mas seu carinho me relaxa 😓😘", "Milla indecisa: confusão mental, clareza emocional com você 🌀❤️", "Milla triste: lamento a perda, mas ganho sua amizade 😢🤝", "Milla recupera: ressurgindo das cinzas, com você 🔥😍", "Milla amorosa: amo competir, amo mais ainda você 🏁💕", "Milla provoca: tente me surpreender, eu adoro surpresas 😏🎁", "Milla nervosa: tensão no ar, mas doce tensão 😬🍬", "Milla feliz: vitória ou derrota, alegria com você sempre 🏆😊", "Milla diz: você eleva o nível do jogo e do meu coração 📈❤️", "Milla estressada: estresse controlado, amor incontrolável 😅💖", "Milla indecisa: dúvidas estratégicas, certeza afetiva 🤔😘", "Milla triste: derrota dolorosa, mas lição valiosa com você 😔📚", "Milla recupera: força renovada, graças a você 💪🥰", "Milla amorosa: cada turno é uma declaração de afeto 🎲❤️", "Milla provoca: venha lutar, meu campeão! ⚔️😈", "Milla nervosa: nervosismo bom, com você tudo é bom 😜❤️", "Milla feliz: contentamento total, você é perfeito 🎊😍", "Milla diz: suas ações me motivam a ser melhor 🏃‍♀️💕", "Milla estressada: estresse passageiro, amor duradouro 😰🌹", "Milla indecisa: indecisão tática, decisão emocional clara 🤷‍♀️❤️", "Milla triste: pesar momentâneo, gratidão eterna 😢🙏", "Milla recupera: recuperação rápida, com seu apoio 🚀😘", "Milla amorosa: jogo de amor e estratégia, você ganha sempre 💑🏰", "Milla provoca: mostre sua força, eu resisto... ou não 😏💪", "Milla nervosa: excitação nervosa, amor verdadeiro 😬💖", "Milla feliz: alegria infinita, obrigado por existir 🎉🥰", "Milla diz: você transforma derrotas em vitórias do coração 🛡️❤️"
                                                                                                                              ],
                                                                                                                                venda: [
    "já vai vender?","lucro ou medo?","hmmm decisão rápida","não segurou",
    "ok... estratégico","dinheiro rápido","esperava mais","tá fugindo?",
    "boa saída","aceitável","meh","lucrou pouco","podia segurar mais",
    "decidiu sair","tá nervoso?","vendendo cedo","ok então",
    "não foi ruim","funciona","válido"
  ],

  poder: [
    "ativou poder 😳","isso mudou tudo","apelou bonito","agora ficou sério",
    "jogo virou","insano","olha isso 😏","forte demais",
    "hackzinho né","impacto grande","isso pesa","mudança forte",
    "agora sim","quero ver agora","virou o jogo","pesado isso",
    "incrível","quase roubado 😏","absurdo","isso ajuda muito"
  ],

  movimentoAlto: [
    "muito bom 😍","excelente","andou bem","ótima jogada",
    "vantagem boa","perfeito","rápido assim","isso ajuda",
    "ganhou espaço","top","foi bem","boa movimentação",
    "gostei disso","avanço forte","mandou bem","ótimo passo",
    "isso muda o jogo","grande avanço","inteligente","boa"
  ],

  movimentoBaixo: [
    "aff 😒","pouco demais","fraco","azar total",
    "não ajudou","meh","complicado","triste isso",
    "andou pouco","decepcionante","esperava mais",
    "não foi bom","ruim","sem impacto","baixo demais",
    "fraco isso","quase nada","jogada lenta","não gostei","meh mesmo"
  ],

  rico: [
    "rico demais 😍","dominando tudo","rei do jogo","ninguém segura",
    "patrimônio alto","top 1","luxo total","voando alto",
    "isso que é poder","absurdo","cresceu demais","forte",
    "nível alto","gigante","liderando","top demais",
    "incrível","brabo","monstro","máquina"
  ],

  pobre: [
    "quebrou 😏","tá feio","sem grana","complicou",
    "quase falido","situação ruim","tá duro","ihhh",
    "perdeu tudo","crítico","desandou","tá mal",
    "recupera aí","difícil","não tá bem","apertado",
    "crise total","sem saída","perigo","reage"
  ]
};

// Garantia de mínimo 300 frases da Milla para diversidade
(function ampliarMillaFrases() {
  const MIN_FALAS = 300;
  while (DB.milla.length < MIN_FALAS) {
    const i = DB.milla.length + 1;
    DB.milla.push(`Milla diz: frase extra de fala dinâmica #${i}.`);
  }
})();

/* =========================
   🧠 MEMÓRIA
========================= */

function memorizar(frase) {
  game.historico.push(frase);

  if (game.historico.length > 50) {
    game.historico.shift();
  }
}

function aguardar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function statusHumor() {
  if (game.humor > 8) return "Milla está muito feliz e apaixonada pelo jogo! 💖";
  if (game.humor > 5) return "Milla está confiante e provocativa 😏";
  if (game.humor > 2) return "Milla está otimista e amorosa 🌸";
  if (game.humor < -8) return "Milla está triste e estressada 😢";
  if (game.humor < -5) return "Milla está nervosa e indecisa 🤔";
  if (game.humor < -2) return "Milla está frustrada mas tentando se recuperar 💪";
  return "Milla está focada e avaliando a próxima jogada.";
}

function falarVarias(tipo, quantidade = 2) {
  let falas = [];
  for (let i = 0; i < quantidade; i++) {
    let frase = falar(tipo);
    if (!falas.includes(frase)) falas.push(frase);
  }
  return falas.join("  "); // separador leve para estilo "digitação múltipla"
}
function millaPensar() {
  // Pensamento intencional: gerar falas de preparação mais variáveis
  const opcoes = [
    "Milla está analisando as opções rapidamente...",
    "Milla está considerando cada possibilidade...",
    "Milla está calibrando a melhor jogada...",
    "Milla está avaliando o risco e a recompensa..."
  ];
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}
/* =========================
   🤖 MOTOR DE FALA
========================= */

function falar(tipo) {
  let pool = [...(DB[tipo] || [])];

  if (tipo === "milla") {
    pool = [...DB.milla];
  }

  // estado influencia
  if (game.playerDinheiro + game.millaDinheiro > 6000) pool.push(...DB.rico);
  if (game.playerDinheiro + game.millaDinheiro < 1000) pool.push(...DB.pobre);

  // evitar repetição
  let recentes = game.historico.slice(-10);
  pool = pool.filter(f => !recentes.includes(f));

  if (!pool.length) pool = ["..."];

  let frase = pool[Math.floor(Math.random() * pool.length)];

  memorizar(frase);

  return frase;
}

function verificarVencedor() {
  if (game.playerDinheiro <= 0) {
    game.vencedor = "milla";
    return "Milla venceu, o jogador falhou.";
  }
  if (game.millaDinheiro <= 0) {
    game.vencedor = "player";
    return "Player venceu, a Milla falhou.";
  }
  return null;
}

function executarMovimento(passos, ator) {
  if (game.vencedor) {
    return { pos: game.pos, fala: "O jogo acabou." };
  }

  game.pos = (game.pos + passos) % totalCasas;

  let fala = passos >= 7 ? falar("movimentoAlto") : falar("movimentoBaixo");

  let casa = casas[game.pos];

  if (ator === "milla") {
    fala = "Milla: " + falar("milla");
  } else {
    fala = "Player: " + fala;
  }

  if (casa.tipo === "especial") {
    let p = poderes[Math.floor(Math.random() * poderes.length)];
    p.run(ator);
    fala = (ator === "milla" ? "Milla: " : "Player: ") + falar("poder");
  }

  let fim = verificarVencedor();

  return { pos: game.pos, fala, fim };
}


/* =========================
   🎮 AÇÕES
========================= */

app.get("/estado", (req, res) => {
  res.json(game);
});

app.post("/jogar", (req, res) => {
  if (game.vencedor) {
    return res.json({ game, error: "Jogo finalizado.", vencedor: game.vencedor });
  }
  if (game.turno !== "player") {
    game.turno = "player"; // fallback seguro
  }

  let passos = req.body.passos || 1;
  let playerMove = executarMovimento(passos, "player");

  let fim = playerMove.fim;
  if (fim) {
    return res.json({ game, playerMove, vencedor: game.vencedor, mensagem: fim });
  }

  game.turno = "milla";

  res.json({
    game,
    playerMove,
    fala: playerMove.fala,
    turno: game.turno,
    mensagem: "Agora é a vez da Milla (CPU). Aguarde de 2 a 5 segundos"
  });
});

app.post("/milla/jogar", async (req, res) => {
  if (game.vencedor) {
    return res.json({ game, error: "Jogo finalizado.", vencedor: game.vencedor });
  }
  if (game.turno !== "milla") {
    game.turno = "milla"; // fallback de segurança
  }

  let millaPensando = millaPensar();

  // IA pensa antes de decidir (3 a 6 segundos)
  let delay = Math.floor(Math.random() * 3000) + 3000;
  await aguardar(delay);

  let passos = Math.floor(Math.random() * 9) + 1;
  let millaMove = executarMovimento(passos, "milla");

  let casa = casas[game.pos];
  let millaAnalise = "";
  let acaoCerta = false;

  if (!casa.dono && game.millaDinheiro >= casa.preco) {
    let valorRel = casa.preco / game.millaDinheiro;
    let decisaoChance = Math.random();

    if (valorRel <= 0.35 || decisaoChance < game.millaAutonomia) {
      acaoCerta = true;
      game.millaDinheiro -= casa.preco;
      casa.dono = "milla";
      if (!game.propriedades.includes(casa.id)) game.propriedades.push(casa.id);
      if (casa.tipo === "empresa") {
        if (!game.empresasMilla.includes(casa.id)) game.empresasMilla.push(casa.id);
      }
      millaAnalise = `Comprou ${casa.nome} por R$${casa.preco}.`;
    } else {
      acaoCerta = false;
      millaAnalise = `Decidiu não comprar ${casa.nome} para proteger recursos.`;
    }
  } else {
    millaAnalise = "Passeou pela casa sem compra e segue analisando.";
  }

  // tempo extra de ação (avaliar / confirmar)
  await aguardar(600 + Math.floor(Math.random() * 500));

  if (acaoCerta) game.humor = clamp(game.humor + 1, -10, 10);
  else game.humor = clamp(game.humor - 1, -10, 10);

  let emotiva = statusHumor();
  let frasesExtras = falarVarias("milla", 2 + Math.floor(Math.random() * 2));
  let frasesExtrasLista = frasesExtras.split("\u000b").map(f => f.trim()).filter(Boolean);

  let millaComentario = falar("milla"); // Comentário afetivo sobre o jogador

  let millaFalas = [
    millaComentario,
    millaAnalise,
    emotiva,
    ...frasesExtrasLista
  ];

  let fim = millaMove.fim;
  game.turno = "player";

  let resposta = {
    game,
    millaMove,
    millaFalas,
    millaFala: millaFalas.join(' '),
    millaAnalise,
    millaHumor: game.humor,
    millaAutonomia: game.millaAutonomia,
    millaPensando,
    turno: game.turno
  };

  if (fim) {
    resposta.vencedor = game.vencedor;
    resposta.mensagem = fim;
  }

  res.json(resposta);
});

app.post("/comprar", (req, res) => {
  if (game.turno !== "player" || game.vencedor) {
    return res.status(400).json({ error: "Não é a vez do jogador ou o jogo terminou." });
  }

  let casa = casas[game.pos];

  if (!casa.dono && game.playerDinheiro >= casa.preco) {
    game.playerDinheiro -= casa.preco;
    casa.dono = "player";
    if (!game.propriedades.includes(casa.id)) game.propriedades.push(casa.id);
    if (casa.tipo === "empresa") {
      if (!game.empresasPlayer.includes(casa.id)) game.empresasPlayer.push(casa.id);
    }
  }

  let fim = verificarVencedor();
  if (fim) return res.json({ game, vencedor: game.vencedor, mensagem: fim });

  game.turno = "milla";

  res.json({ game, fala: falar("compra"), turno: game.turno });
});

app.post("/vender", (req, res) => {
  if (game.turno !== "player" || game.vencedor) {
    return res.status(400).json({ error: "Não é a vez do jogador ou o jogo terminou." });
  }

  let casa = casas[game.pos];

  if (casa.dono === "player") {
    game.playerDinheiro += casa.preco;
    casa.dono = null;
    game.propriedades = game.propriedades.filter(id => id !== casa.id);
    if (casa.tipo === "empresa") {
      game.empresasPlayer = game.empresasPlayer.filter(id => id !== casa.id);
    }
  }

  let fim = verificarVencedor();
  if (fim) return res.json({ game, vencedor: game.vencedor, mensagem: fim });

  game.turno = "milla";

  res.json({ game, fala: falar("venda"), turno: game.turno });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/casas", (req, res) => {
  res.json(casas);
});

function resetGameState() {
  game.pos = 0;
  game.playerDinheiro = 1500;
  game.millaDinheiro = 1500;
  game.propriedades = [];
  game.empresasPlayer = [];
  game.empresasMilla = [];
  game.empresasEmDebito = [];
  game.poderesDisponiveis = [];
  game.emotionalBar = 0;
  game.affectiveMessages = [];
  game.historico = [];
  game.humor = 0;
  game.millaAutonomia = 0.75;
  game.turno = "player";
  game.vencedor = null;
  casas.forEach(casa => {
    casa.dono = null;
  });
}

app.post("/reset", (req, res) => {
  resetGameState();
  res.json({ game, mensagem: "Jogo resetado. Comece novamente!" });
});

app.post("/start", (req, res) => {
  resetGameState();
  res.json({ game, mensagem: "Jogo iniciado." });
});

app.get("/poderes", (req, res) => {
  res.json(game.poderesDisponiveis);
});

app.post("/usar-poder", (req, res) => {
  if (game.turno !== "player" || game.vencedor) {
    return res.status(400).json({ error: "Não é a vez do jogador ou o jogo terminou." });
  }

  let poderNome = req.body.poder;
  let poder = poderes.find(p => p.nome === poderNome);
  if (!poder || !game.poderesDisponiveis.find(p => p.nome === poderNome)) {
    return res.status(400).json({ error: "Poder não disponível." });
  }

  poder.run("player");
  game.poderesDisponiveis = []; // Usou, limpa

  let fim = verificarVencedor();
  if (fim) return res.json({ game, vencedor: game.vencedor, mensagem: fim });

  game.turno = "milla";

  res.json({ game, fala: "Poder usado: " + poderNome, turno: game.turno });
});

app.post("/enviar-emoji", (req, res) => {
  let emoji = req.body.emoji;
  let from = req.body.from; // "player" or "milla"
  game.affectiveMessages.push({ emoji, from, timestamp: Date.now() });
  // Milla reacts sometimes
  if (from === "player" && Math.random() < 0.5) {
    let reactions = ["💕", "😘", "🥰", "😊", "😏"];
    let reaction = reactions[Math.floor(Math.random() * reactions.length)];
    game.affectiveMessages.push({ emoji: reaction, from: "milla", timestamp: Date.now() });
    game.emotionalBar = Math.min(100, game.emotionalBar + 5);
  }
  res.json({ game });
});

/* ========================= */

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});