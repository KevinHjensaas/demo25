// models/deckModel.js
const pool = require("../db");

class DeckModel {
  // Opprett en ny kortstokk i DB
  static async createDeck() {
    // 1) Opprett en ny rad i decks og få deck_id
    const deckResult = await pool.query(`
      INSERT INTO decks DEFAULT VALUES
      RETURNING deck_id
    `);
    const deckId = deckResult.rows[0].deck_id;

    // 2) Lag 52 kort
    const suits = ["Hjerter", "Ruter", "Spar", "Kløver"];
    const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

    // Bygg en stor INSERT-spørring for alle kort
    let placeholders = [];
    let values = [];
    let i = 1;

    for (const suit of suits) {
      for (const rank of ranks) {
        placeholders.push(`($${i}, $${i+1}, $${i+2})`);
        values.push(deckId, suit, rank);
        i += 3;
      }
    }
    const query = `
      INSERT INTO cards (deck_id, suit, rank)
      VALUES ${placeholders.join(", ")}
    `;
    await pool.query(query, values);

    return deckId;
  }

  // Hent alle kort i en kortstokk
  static async getDeck(deckId) {
    const result = await pool.query(`
      SELECT suit, rank
      FROM cards
      WHERE deck_id = $1
      ORDER BY card_id ASC
    `, [deckId]);
    // Returner array av "Spar 2", "Kløver A", osv.
    return result.rows.map(row => `${row.suit} ${row.rank}`);
  }

  // "Stokk" - valgfritt om du vil persistere rekkefølgen
  static async shuffleDeck(deckId) {
    // For enkelhet, bare returner en melding
    // Hvis du vil lagre rekkefølgen, må du ha en 'position' kolonne i cards.
    return "Kortstokken er stokket.";
  }

  // Trekk et kort (slett fra DB)
  static async drawCard(deckId) {
    // Hent alle kort
    const result = await pool.query(`
      SELECT card_id, suit, rank
      FROM cards
      WHERE deck_id = $1
    `, [deckId]);

    if (result.rows.length === 0) {
      throw new Error("Kortstokken er tom eller finnes ikke.");
    }

    // Velg et tilfeldig kort
    const randomIndex = Math.floor(Math.random() * result.rows.length);
    const chosenCard = result.rows[randomIndex];

    // Slett kortet fra DB
    await pool.query(`
      DELETE FROM cards
      WHERE card_id = $1
    `, [chosenCard.card_id]);

    return `${chosenCard.suit} ${chosenCard.rank}`;
  }
}

module.exports = DeckModel;
