const express = require("express");
const app = express();
const port = 3000;

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
    res.status(400).send("Feil: Begge parametere må være tall.");
  } else {
    res.send(`Summen av ${a} og ${b} er ${a + b}`);
  }
});

app.listen(port, () => {
  console.log(`Server kjører på http://localhost:${port}`);
});
