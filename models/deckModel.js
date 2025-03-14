
const pool = require("../db");

class DeckModel {

  static async createDeck() {
 
    const deckResult = await pool.query(`
      INSERT INTO decks DEFAULT VALUES
      RETURNING deck_id
    `);
    const deckId = deckResult.rows[0].deck_id;


    const suits = ["Hjerter", "Ruter", "Spar", "Kløver"];
    const ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];


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


  static async getDeck(deckId) {
    const result = await pool.query(`
      SELECT suit, rank
      FROM cards
      WHERE deck_id = $1
      ORDER BY card_id ASC
    `, [deckId]);
 
    return result.rows.map(row => `${row.suit} ${row.rank}`);
  }

 
  static async shuffleDeck(deckId) {

    return "Kortstokken er stokket.";
  }


  static async drawCard(deckId) {

    const result = await pool.query(`
      SELECT card_id, suit, rank
      FROM cards
      WHERE deck_id = $1
    `, [deckId]);

    if (result.rows.length === 0) {
      throw new Error("Kortstokken er tom eller finnes ikke.");
    }

   
    const randomIndex = Math.floor(Math.random() * result.rows.length);
    const chosenCard = result.rows[randomIndex];


    await pool.query(`
      DELETE FROM cards
      WHERE card_id = $1
    `, [chosenCard.card_id]);

    return `${chosenCard.suit} ${chosenCard.rank}`;
  }
}

module.exports = DeckModel;
