// server.js
const express = require("express");
const sessionMiddleware = require("./middleware/sessionPersistence");
const treeRouter = require("./routes/treeRouter");

// 1) Importer pg og opprett en pool
const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false }, // Render krever SSL
});

const app = express();
const PORT = 8080;

// (FJERN/kommenter ut hvis du ikke vil ha minnelagring lenger)
// const decks = {};

console.log("Starter server.js...");
console.log("Importerer sessionMiddleware...");
console.log("sessionMiddleware:", sessionMiddleware);
console.log("sessionMiddleware type:", typeof sessionMiddleware);

console.log("Starter server.js...");

app.use(express.static("public"));
app.use(express.json());
app.use(sessionMiddleware);
console.log("sessionMiddleware type:", typeof sessionMiddleware);

// Resterende endepunkter du hadde
app.get("/", (req, res) => {
  res.send(" Serveren fungerer!");
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

// ---------- KORTSTOKK-API MED POSTGRESQL ----------

// POST /temp/deck - Opprett ny kortstokk i databasen
app.post("/temp/deck", async (req, res) => {
  try {
    // 1) Opprett en ny rad i 'decks' for å representere selve kortstokken
    const deckResult = await pool.query(`
      INSERT INTO decks DEFAULT VALUES
      RETURNING deck_id;
    `);
    const deckId = deckResult.rows[0].deck_id;

    // 2) Opprett 52 kort og legg dem i 'cards'
    const suits = ["Hjerter", "Ruter", "Spar", "Kløver"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    const allCards = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        allCards.push(`(${deckId}, '${suit}', '${rank}')`);
      }
    }
    const valuesString = allCards.join(", ");
    // Kjør ett samlet INSERT for alle 52 kort
    await pool.query(`
      INSERT INTO cards (deck_id, suit, rank)
      VALUES ${valuesString};
    `);

    // 3) Returner deck_id
    res.status(201).json({ deck_id: deckId });
  } catch (err) {
    console.error("Feil ved oppretting av kortstokk:", err);
    res.status(500).json({ error: "Feil ved oppretting av kortstokk." });
  }
});

// PATCH /temp/deck/shuffle/:deck_id - Stokk kortstokken (valgfritt om du persisterer rekkefølge)
app.patch("/temp/deck/shuffle/:deck_id", async (req, res) => {
  try {
    const { deck_id } = req.params;
    // Hent kort fra DB
    const cardResult = await pool.query(`
      SELECT card_id, suit, rank
      FROM cards
      WHERE deck_id = $1
    `, [deck_id]);

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: "Kortstokk finnes ikke." });
    }

    // Stokk lokalt i JS
    const deck = cardResult.rows;
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    // (Valgfritt) Du kan persistere rekkefølge i DB ved å legge til en "position" kolonne.
    // Her returnerer vi bare en melding
    res.json({ message: "Kortstokken er stokket." });
  } catch (err) {
    console.error("Feil ved stokking av kortstokk:", err);
    res.status(500).json({ error: "Feil ved stokk." });
  }
});

// GET /temp/deck/:deck_id - Hent hele kortstokken
app.get("/temp/deck/:deck_id", async (req, res) => {
  try {
    const { deck_id } = req.params;
    // Hent kort fra DB
    const cardResult = await pool.query(`
      SELECT suit, rank
      FROM cards
      WHERE deck_id = $1
    `, [deck_id]);

    if (cardResult.rows.length === 0) {
      return res.status(404).json({ error: "Kortstokk finnes ikke." });
    }

    // Bygg en array over "Spar 2", "Kløver 5", etc.
    const deck = cardResult.rows.map(row => `${row.suit} ${row.rank}`);
    res.json({ deck });
  } catch (err) {
    console.error("Feil ved henting av kortstokk:", err);
    res.status(500).json({ error: "Feil ved henting av kortstokk." });
  }
});

// GET /temp/deck/:deck_id/card - Trekk et kort
app.get("/temp/deck/:deck_id/card", async (req, res) => {
  try {
    const { deck_id } = req.params;
    // Hent alle kort i DB
    const cardResult = await pool.query(`
      SELECT card_id, suit, rank
      FROM cards
      WHERE deck_id = $1
    `, [deck_id]);

    const deck = cardResult.rows;
    if (deck.length === 0) {
      return res.status(404).json({ error: "Kortstokk finnes ikke eller er tom." });
    }

    // Velg tilfeldig kort
    const cardIndex = Math.floor(Math.random() * deck.length);
    const chosenCard = deck[cardIndex];

    // Fjern kortet fra DB
    await pool.query(`
      DELETE FROM cards
      WHERE card_id = $1
    `, [chosenCard.card_id]);

    res.json({ card: `${chosenCard.suit} ${chosenCard.rank}` });
  } catch (err) {
    console.error("Feil ved trekking av kort:", err);
    res.status(500).json({ error: "Feil ved trekking av kort." });
  }
});

// Ruter som var der fra før
app.use("/tree", treeRouter);

// Start serveren
app.listen(PORT, () => {
  console.log(` Server kjører på http://localhost:${PORT}`);
});
