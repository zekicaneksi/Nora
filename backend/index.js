import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";

// Env Variables
const mongodbConnectionUrl = process.env.MONGODB_CONNECTION_STRING;
const port = process.env.PORT;

// MongoDB Connection
const client = new MongoClient(mongodbConnectionUrl);
const database = (await client.connect()).db("nora");
console.log("connected to database successfully");

// Express Setup
var app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: process.env.FRONTEND_ADDRESS,
  })
);

app.use(
  session({
    secret: process.env.SECRET,
    saveUninitialized: false,
    resave: false,
    store: MongoStore.create({ mongoUrl: mongodbConnectionUrl }),
  })
);

// Middleware

function checkSession(req, res, next) {
  if (!req.session.user) return res.status(403).send();
  else next();
}

// Routes
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  const checkUsernameSpaces = username.indexOf(" ") !== -1;
  const checkPasswordSpaces = password.indexOf(" ") !== -1;
  const checkUsernameLength = username.length < 10;
  const checkPasswordLength = password.length < 10;

  if (
    checkUsernameLength ||
    checkPasswordLength ||
    checkUsernameSpaces ||
    checkPasswordSpaces
  ) {
    return res.status(400).send();
  }

  const collection = database.collection("users");

  const user = await collection.findOne({ username });

  if (user) res.status(401).send();
  else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await collection.insertOne({
      username: username,
      password: hashedPassword,
    });
    res.status(200).send();
  }
});

app.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const collection = database.collection("users");

  const user = await collection.findOne({ username });
  if (!user) return res.status(401).send("username");
  else {
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).send("password");
    else return res.status(200).send();
  }
});

// Start Express
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
