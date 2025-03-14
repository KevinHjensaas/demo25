<<<<<<< HEAD

# Node.js Tutorial Project

## Description

A simple Node.js project that demonstrates creating a basic server to display "Hello World!" in a web browser.

## How to Run

1. Clone this repository:
   ```bash
   git clone https://github.com/KevinHjensaas/NodeJS-Tutorial.git
   =======
   ```

# Tree API

Dette er et API for håndtering av trær. API-et støtter CRUD-operasjoner.

Live URL: [https://demo25-lntz.onrender.com]

- `GET /tree` → Henter hele trestrukturen
- `POST /tree` → Legger til en ny node
- `PUT /tree/:id` → Oppdaterer en node
- `DELETE /tree/:id` → Sletter en node

Opprett ny kortstokk:
- POST `/temp/deck`
Oppretter en ny kortstokk i databasen og returnerer et unikt deck_id.
Hent kortstokk:
- `GET /temp/deck/:deck_id`
Henter alle kort i en kortstokk, sortert etter en forhåndsdefinert rekkefølge.
Stokk kortstokk:
- PATCH `/temp/deck/shuffle/:deck_id`
Stokker kortene (returnerer en melding). (Merk: I denne implementasjonen returneres en melding uten at rekkefølgen oppdateres i databasen.)
Trekk et kort:
- GET `/temp/deck/:deck_id/card`
Trekker et tilfeldig kort fra kortstokken og fjerner det fra databasen.