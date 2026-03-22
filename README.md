# 🎮 Milla Banco Imobiliário

Um jogo web inspirado no clássico Banco Imobiliário, com uma **IA interativa (Milla)** que reage em tempo real às suas ações como se fosse uma pessoa.

---

## 🧠 Sobre o Projeto

O **Milla Banco Imobiliário** é um jogo desenvolvido com:

* **Node.js (Express)** no backend
* **HTML + CSS + JavaScript** no frontend
* Um sistema de “IA simulada” baseado em:

  * contexto de ações
  * estado do jogador
  * memória (histórico de frases)
  * seleção dinâmica de falas

A personagem **Milla** comenta tudo que acontece no jogo, criando uma experiência mais imersiva e “humana”.

---

## ⚙️ Funcionalidades

### 🎮 Gameplay

* Tabuleiro com até **120 casas**
* Movimento manual (1 a 9 passos)
* Sistema de:

  * 💰 Compra de imóveis
  * 💸 Venda de propriedades
  * ⚡ Poderes especiais (eventos aleatórios)

---

### 🤖 IA da Milla

* Mais de **120 frases organizadas em JSON**
* Reações baseadas em:

  * Jogadas boas ou ruins
  * Situação financeira
  * Eventos especiais
* Sistema de **memória (push + shift)**:

  * evita repetição de frases
  * simula comportamento humano
* Mistura de categorias:

  * `compra`, `venda`, `poder`
  * `rico`, `pobre`
  * `movimentoAlto`, `movimentoBaixo`
  * `zoeira`, `evento`

---

### 🎨 Interface

* Layout moderno (dark mode)
* Milla fixa no canto superior direito
* Tabuleiro visual estilo grid
* Animação no player
* Atualizações via `innerHTML`

---

## 📦 Tecnologias

* Node.js
* Express
* CORS
* Body-parser
* JavaScript puro (frontend)
* HTML5 + CSS3

---

## 🚀 Como Rodar o Projeto

### 1. Clone o projeto

```bash
git clone https://github.com/aceleradox/Milla-Imobiliary-Bank---Milla-IA-play-game.git
cd milla-banco-imobiliario
```

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Inicie o servidor

```bash
npm run dev
```

ou

```bash
npm start
```

---

### 4. Acesse no navegador

```
http://localhost:3000
```

---

## 📁 Estrutura

```
/milla-game
 ├── server.js
 ├── package.json
 ├── index.html
 └── node_modules/
```

---

## 🧠 Como Funciona a “IA”

A Milla não usa inteligência artificial real, mas sim um sistema inteligente baseado em:

```
ação + estado + memória + aleatoriedade = fala dinâmica
```

Exemplo:

* Jogador anda muito → reação positiva
* Jogador sem dinheiro → zoeira ou alerta
* Evento especial → frases específicas

---

## 🔒 Segurança

* ❌ Sem uso de cookies
* ❌ Sem armazenamento sensível
* ✔ Dados mantidos apenas em memória (runtime)

---

## 💡 Possíveis Melhorias

* 🗺️ Tabuleiro circular estilo real
* 🏠 Sistema de aluguel
* 👥 Multiplayer (Socket.io)
* 💾 Persistência (banco de dados)
* 🎭 Avatar animado da Milla
* 🔊 Voz mais realista (TTS avançado)
* 🧠 IA mais evolutiva (memória longa)

---

## 🎯 Objetivo

Criar um jogo simples, mas com uma camada de interação diferenciada através de uma IA simulada que:

* reage
* “julga”
* zoa
* incentiva

tornando a experiência mais divertida e dinâmica.

---

## 👤 Autor

Projeto desenvolvido por você 😄
com apoio de IA para estrutura e lógica.

---

## ⚠️ Aviso

Este projeto é experimental e focado em aprendizado, prototipagem e criatividade.

---

## ⭐ Dica

Se quiser evoluir esse projeto, o próximo passo ideal é:

👉 integrar Vue.js + backend + sistema multiplayer

---

**Divirta-se jogando 😏**
