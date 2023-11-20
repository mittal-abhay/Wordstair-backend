const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
dotenv.config();
// express app
const app = express();
const PORT = process.env.PORT || 5000;

// connect to database
// mongodb
mongoose.connect(process.env.MONGODB_URL);
const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.once("open", () => console.log("Connected to Database!"));

// middlewares
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// base route
app.get("/", (req, res) => {
  res.send("Welcome to Staircase Server!");
});

// routes
const auth = require("./routes/auth.js");
const game = require("./routes/game.js");
const user = require("./routes/user.js");
const authenticateToken = require("./middlewares/auth.js");
app.use("/auth", auth);
app.use("/game", authenticateToken, game);
app.use("/user", authenticateToken, user);

// start server
app.listen(PORT, () => {
  console.log("Staircase Server listening on port " + PORT + "!");
});
