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
  historico: [],
  humor: 0,
  millaAutonomia: 0.75, // 0-1, quanto maior mais independente/decisiva
  turno: "player", // player ou milla
  vencedor: null
};

const totalCasas = 120;

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
  { nome: "perda", run: actor => actor === "player" ? game.playerDinheiro -= 300 : game.millaDinheiro -= 300 }
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
                                                                                                                            "Milla diz: game over."
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

// Garantia de mínimo 220 frases da Milla para diversidade
(function ampliarMillaFrases() {
  const MIN_FALAS = 220;
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
  if (game.humor > 7) return "Milla está muito confiante e agressiva.";
  if (game.humor > 3) return "Milla está otimista e calculada.";
  if (game.humor < -7) return "Milla está frustrada e cautelosa.";
  if (game.humor < -3) return "Milla está nervosa e defensiva.";
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

app.post("/jogar", (req, res) => {
  if (game.turno !== "player") {
    return res.status(400).json({ error: "Não é a vez do jogador." });
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
  if (game.turno !== "milla") {
    return res.status(400).json({ error: "Não é a vez da Milla." });
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

  let millaFalas = [
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

/* ========================= */

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});