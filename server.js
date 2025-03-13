const express = require("express");
const sessionMiddleware = require("./middleware/sessionPersistence");
const treeRouter = require("./routes/treeRouter");

function myLoggingMiddleware(req, res, next) {
  console.log(`[LOG] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
}

const app = express();
const PORT = process.env.PORT || 8080;

const decks = {};

console.log("Starter server.js...");
console.log("Importerer sessionMiddleware...");
console.log("sessionMiddleware:", sessionMiddleware);
console.log("sessionMiddleware type:", typeof sessionMiddleware);
console.log("Starter server.js...");

app.use(express.static("public"));

app.use(express.json());

app.use(sessionMiddleware);

app.use(myLoggingMiddleware);

console.log("sessionMiddleware type:", typeof sessionMiddleware);

app.get("/", (req, res) => {
  res.send("Serveren fungerer!");
});

app.get("/tmp/poem", (req, res) => {
  res.send("En rose er en rose, er en rose.");
});

const quotes = [
  "Sitat 1: The only way to do great work is to love what you do.",
  "Sitat 2: You must be the change you wish to see in the world",
  "Sitat 3: In the middle of every difficulty lies opportunity.",
  "Sitat 4: It does not matter how slowly you go as long as you do not stop.",
  "Sitat 5: Everything should be made as simple as possible, but not simpler",
];

app.get("/tmp/quote", (req, res) => {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  res.send(quotes[randomIndex]);
});

app.post("/tmp/sum/:a/:b", (req, res) => {
  const a = parseFloat(req.params.a);
  const b = parseFloat(req.params.b);

  if (isNaN(a) || isNaN(b)) {
    return res.status(400).send("Feil: Begge parametere må være tall.");
  }
  res.send(`Summen av ${a} og ${b} er ${a + b}`);
});

app.post("/temp/deck", (req, res) => {
  const deckId = Date.now().toString();
  const suits = ["Hjerter", "Ruter", "Spar", "Kløver"];
  const ranks = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];

  const deck = suits.flatMap((suit) => ranks.map((rank) => `${suit} ${rank}`));

  decks[deckId] = deck;

  res.status(201).send({ deck_id: deckId });
});

app.patch("/temp/deck/shuffle/:deck_id", (req, res) => {
  const deck = decks[req.params.deck_id];
  if (!deck) return res.status(404).send({ error: "Kortstokk finnes ikke." });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  res.send({ message: "Kortstokken er stokket." });
});

app.get("/temp/deck/:deck_id", (req, res) => {
  const deck = decks[req.params.deck_id];
  if (!deck) return res.status(404).send({ error: "Kortstokk finnes ikke." });

  res.send({ deck });
});

app.get("/temp/deck/:deck_id/card", (req, res) => {
  const deck = decks[req.params.deck_id];
  if (!deck) return res.status(404).send({ error: "Kortstokk finnes ikke." });
  if (deck.length === 0) {
    return res.status(400).send({ error: "Kortstokken er tom." });
  }

  const cardIndex = Math.floor(Math.random() * deck.length);
  const card = deck.splice(cardIndex, 1)[0];

  res.send({ card });
});

app.use("/tree", treeRouter);

app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
