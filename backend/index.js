import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";

const mongodbConnectionUrl = process.env.MONGODB_CONNECTION_STRING;
const port = process.env.PORT;

var app = express();

const client = new MongoClient(mongodbConnectionUrl);
await client.connect();
console.log("connected to database successfully");
const database = client.db("nora");

app.get("/", async (req, res) => {
  await database.collection("users").insertOne({ test: "hello 456" });
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});