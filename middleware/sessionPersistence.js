const session = require("express-session");
const FileStore = require("session-file-store")(session);

console.log("✅ Initialiserer sessionMiddleware...");

const sessionMiddleware = session({
    store: new FileStore({
        path: "./sessions",
        ttl: 3600,
        retries: 3,
    }),
    secret: "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true }
});

console.log("✅ sessionMiddleware lastet som en funksjon:", typeof sessionMiddleware);
module.exports = sessionMiddleware;
