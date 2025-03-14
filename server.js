// server.js

const express = require("express");
const sessionMiddleware = require("./middleware/sessionPersistence");
const treeRouter = require("./routes/treeRouter");
const DeckModel = require("./models/deckModel");  // Importer modellen

// Egen logging middleware
function myLoggingMiddleware(req, res, next) {
  console.log(`[LOG] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
}

const app = express();
const PORT = process.env.PORT || 8080;

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

// --- CRUD-endepunkter for kortstokk med PostgreSQL ---

// POST /temp/deck - Opprett ny kortstokk i databasen
app.post("/temp/deck", async (req, res) => {
  try {
    const deck_id = await DeckModel.createDeck();
    res.status(201).json({ deck_id });
  } catch (error) {
    console.error("Feil ved oppretting av kortstokk:", error);
    res.status(500).json({ error: "Feil ved oppretting av kortstokk" });
  }
});

// PATCH /temp/deck/shuffle/:deck_id - Stokk kortstokken
app.patch("/temp/deck/shuffle/:deck_id", async (req, res) => {
  try {
    const { deck_id } = req.params;
    const message = await DeckModel.shuffleDeck(deck_id);
    res.json({ message });
  } catch (error) {
    console.error("Feil ved stokking av kortstokk:", error);
    res.status(500).json({ error: "Feil ved stokking av kortstokk" });
  }
});

// GET /temp/deck/:deck_id - Hent hele kortstokken fra databasen
app.get("/temp/deck/:deck_id", async (req, res) => {
  try {
    const { deck_id } = req.params;
    const deck = await DeckModel.getDeck(deck_id);
    if (deck.length === 0) {
      return res.status(404).json({ error: "Kortstokk finnes ikke." });
    }
    res.json({ deck });
  } catch (error) {
    console.error("Feil ved henting av kortstokk:", error);
    res.status(500).json({ error: "Feil ved henting av kortstokk" });
  }
});

// GET /temp/deck/:deck_id/card - Trekk et kort (fjern fra databasen)
app.get("/temp/deck/:deck_id/card", async (req, res) => {
  try {
    const { deck_id } = req.params;
    const card = await DeckModel.drawCard(deck_id);
    res.json({ card });
  } catch (error) {
    console.error("Feil ved trekking av kort:", error);
    if (error.message.includes("tom") || error.message.includes("finnes ikke")) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Feil ved trekking av kort" });
  }
});

app.use("/tree", treeRouter);

app.listen(PORT, () => {
  console.log(`Server kjører på http://localhost:${PORT}`);
});
