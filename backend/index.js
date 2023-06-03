import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import { MongoClient, ObjectId } from "mongodb";
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
    credentials: true,
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

// Database Functions

async function addFieldForUser(userId, fieldPath, label) {
  const collection = database.collection("fields");
  const insertedPath =
    fieldPath === "/" && label === "home" ? "/home" : fieldPath + "/" + label;
  const checkIfExists = await collection.findOne({
    userId: userId,
    path: insertedPath,
  });
  if (checkIfExists) return "exists";

  if (fieldPath === "/" && label === "home") {
    await collection.insertOne({
      userId: userId,
      path: insertedPath,
      fields: [],
      todoBoxes: [],
    });
  } else {
    const field = await collection.findOne({ userId: userId, path: fieldPath });
    if (!field) return "err";
    else {
      field.fields.push({ label: label, path: insertedPath });
      await collection.updateOne(
        { userId: userId, path: fieldPath },
        { $set: { fields: field.fields } }
      );
      await collection.insertOne({
        userId: userId,
        path: insertedPath,
        fields: [],
        todoBoxes: [],
      });
      return "success";
    }
  }
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
    const result = await collection.insertOne({
      username: username,
      password: hashedPassword,
    });

    await addFieldForUser(result.insertedId, "/", "home");
    req.session.user = { username: username, userId: result.insertedId };
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
    else {
      req.session.user = { username: user.username, userId: user._id };
      return res.status(200).send();
    }
  }
});

app.get("/getUserInfo", checkSession, async (req, res) => {
  return res.status(200).send(JSON.stringify({ user: req.session.user }));
});

app.get("/signout", checkSession, async (req, res) => {
  req.session.user = null;
  req.session.save(function (err) {
    if (err) return res.status(500).send();

    req.session.regenerate(function (err) {
      if (err) return res.status(500).send();
      else return res.status(200).send();
    });
  });
});

app.post("/addField", checkSession, async (req, res) => {
  let { fieldPath, label } = req.body;
  if (
    fieldPath.match(/^[a-zA-Z0-9/-]+$/) === null ||
    label.match(/^[a-zA-Z0-9-]+$/) === null
  )
    return res.status(400).send("invalid");
  const result = await addFieldForUser(
    new ObjectId(req.session.user.userId),
    fieldPath,
    label
  );
  if (result !== "success") return res.status(400).send("exists");
  return res.status(200).send();
});

app.get("/getField/*", checkSession, async (req, res) => {
  const fieldPath = req.path.substring(req.path.indexOf("/", 1));
  const collection = database.collection("fields");
  const field = await collection.findOne({
    userId: new ObjectId(req.session.user.userId),
    path: fieldPath,
  });
  if (field) {
    delete field._id;
    delete field.userId;

    const nestedFields = (
      await database
        .collection("fields")
        .aggregate([
          {
            $match: {
              userId: new ObjectId(req.session.user.userId),
              path: fieldPath,
            },
          },
          {
            $graphLookup: {
              from: "fields",
              startWith: "$fields.path",
              connectFromField: "fields.path",
              connectToField: "path",
              as: "children",
              depthField: "level",
            },
          },
          {
            $unwind: "$children",
          },
          {
            $sort: { "children.level": 1 },
          },
        ])
        .toArray()
    ).map((nestedField) => {
      return nestedField.children;
    });

    let mainLevelFields = [];

    for (let i = 0; i < nestedFields.length; i++) {
      let elem = nestedFields[i];
      if (elem.level === 0) mainLevelFields.push(elem);
      else break;
    }

    function recursivelyGetTodoItemIds(field) {
      let todoItemIds = [];

      field.todoBoxes.forEach((todoBox) => {
        todoBox.todoItems.forEach((todoItem) => {
          todoItemIds.push(todoItem.todoItemId);
        });
      });

      field.fields.forEach((nestedField) => {
        const actualField = nestedFields.find(
          (elem) => elem.path === nestedField.path
        );
        todoItemIds = todoItemIds.concat(
          recursivelyGetTodoItemIds(actualField)
        );
      });
      return todoItemIds;
    }

    for (let i = 0; i < mainLevelFields.length; i++) {
      let todoItemIds = recursivelyGetTodoItemIds(mainLevelFields[i]);
      let index = field.fields.findIndex(
        (elem) => elem.path === mainLevelFields[i].path
      );
      if (index === -1) return res.status(404).send();
      if (
        await database
          .collection("todoItems")
          .findOne({
            _id: { $in: todoItemIds },
            "options.mustBeAttended": true,
          })
      )
        field.fields[index].mustAttend = true;
      else field.fields[index].mustAttend = false;
    }

    return res.status(200).send(JSON.stringify(field));
  } else return res.status(404).send();
});

app.post("/addTodoBox", checkSession, async (req, res) => {
  let { fieldPath, label } = req.body;
  if (
    fieldPath.match(/^[a-zA-Z0-9/-]+$/) === null ||
    label.match(/^[a-zA-Z0-9 ]+$/) === null
  )
    return res.status(400).send("invalid");
  const collection = database.collection("fields");
  const generatedId = new ObjectId();
  const inserted = await collection.updateOne(
    { path: fieldPath, userId: new ObjectId(req.session.user.userId) },
    { $push: { todoBoxes: { _id: generatedId, label: label, todoItems: [] } } }
  );
  if (inserted.matchedCount === 1)
    return res.status(200).send(JSON.stringify({ id: generatedId }));
  else return res.status(404).send();
});

app.post("/addTodoItem", checkSession, async (req, res) => {
  const { fieldPath, todoBoxId, label } = req.body;

  if (label.match(/^[a-zA-Z0-9 /-]+$/) === null) return res.status(400).send();
  const field = await database.collection("fields").findOne({
    userId: new ObjectId(req.session.user.userId),
    path: fieldPath,
  });
  if (!field || field.todoBoxes.find((elem) => elem._id === todoBoxId) === -1)
    return res.status(400).send();
  const inserted = await database.collection("todoItems").insertOne({
    label: label,
    options: {
      mustBeAttended: false,
      recurring: "---",
    },
    content: "",
  });
  await database.collection("fields").updateOne(
    { userId: new ObjectId(req.session.user.userId), path: fieldPath },
    {
      $push: {
        "todoBoxes.$[box].todoItems": { todoItemId: inserted.insertedId },
      },
    },
    { arrayFilters: [{ "box._id": new ObjectId(todoBoxId) }] }
  );
  const insertedItem = await database
    .collection("todoItems")
    .findOne({ _id: inserted.insertedId });
  return res.status(200).send(JSON.stringify(insertedItem));
});

app.post("/getTodoItems", checkSession, async (req, res) => {
  const { path, todoBoxId } = req.body;
  const field = await database
    .collection("fields")
    .findOne({ userId: new ObjectId(req.session.user.userId), path: path });
  const itemIds = field.todoBoxes.find(
    (box) => box._id.toString() === todoBoxId
  ).todoItems;
  const todoItems = await database
    .collection("todoItems")
    .find({ _id: { $in: itemIds.map((elem) => elem.todoItemId) } })
    .toArray();
  return res.status(200).send(JSON.stringify(todoItems));
});

app.post("/changeTodoItemContent", checkSession, async (req, res) => {
  const { todoId, content } = req.body;

  const doesUserHave = await database.collection("fields").findOne({
    userId: new ObjectId(req.session.user.userId),
    "todoBoxes.todoItems.todoItemId": new ObjectId(todoId),
  });
  if (!doesUserHave) return res.status(404).send();
  await database
    .collection("todoItems")
    .updateOne({ _id: new ObjectId(todoId) }, { $set: { content: content } });
  return res.status(200).send();
});

app.post("/removeTodoItem", checkSession, async (req, res) => {
  const { todoId } = req.body;

  const removeFromField = await database.collection("fields").updateOne(
    {
      userId: new ObjectId(req.session.user.userId),
      "todoBoxes.todoItems.todoItemId": new ObjectId(todoId),
    },
    {
      $pull: {
        "todoBoxes.$[].todoItems": { todoItemId: new ObjectId(todoId) },
      },
    }
  );
  if (removeFromField.matchedCount === 0) return res.status(404).send();
  await database
    .collection("todoItems")
    .deleteOne({ _id: new ObjectId(todoId) });
  return res.status(200).send();
});

app.post("/changeTodoItemOptions", checkSession, async (req, res) => {
  const { todoId, labelValue, mustAttendValue, recurringValue } = req.body;
  const doesUserHave = await database.collection("fields").findOne({
    userId: new ObjectId(req.session.user.userId),
    "todoBoxes.todoItems.todoItemId": new ObjectId(todoId),
  });
  if (!doesUserHave) return res.status(404).send();
  await database.collection("todoItems").updateOne(
    { _id: new ObjectId(todoId) },
    {
      $set: {
        label: labelValue,
        options: {
          mustBeAttended: mustAttendValue,
          recurring: recurringValue,
        },
      },
    }
  );
  return res.status(200).send();
});

app.post("/checkUTCTime", async (req, res) => {
  const { time } = req.body;

  if (Math.abs(Date.now() - time) > 180000) return res.status(200).send("BAD");
  else return res.status(200).send("GOOD");
});

// Start Express
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
