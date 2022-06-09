// imports
import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";
import mongoData from "./mongoData.js";

// app config
const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
  appId: "1418212",
  key: "dca71628aa5aab9dc11d",
  secret: "770d670686e6fc2674cc",
  cluster: "us3",
  useTLS: true,
});

// middleware
app.use(cors());
app.use(express.json());

// db config
// mYO5Id8Fb5xfjURh
const mongoURI =
  "mongodb+srv://admin:mYO5Id8Fb5xfjURh@cluster0.yrykoi3.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useCreateIndex: true,
  //   serverApi: ServerApiVersion.v1,
});

mongoose.connection.once("open", () => {
  console.log("MongoDB connected...");

  const changeStream = mongoose.connection.collection("conversations").watch();

  changeStream.on("change", (change) => {
    console.log(change);
    if (change.operationType === "insert") {
      pusher.trigger("chats", "newChat", {
        change: change,
      });
    } else if (change.operationType === "update") {
      pusher.trigger("messages", "newMessage", {
        change: change,
      });
    } else {
      console.log("AN error occurred while triggering the Pusher...");
    }
  });
});
// api routes
app.get("/", (req, res) => res.status(200).send("Hello World! "));

app.post("/new/conversation", (req, res) => {
  const dbData = req.body;

  mongoData.create(dbData, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.post("/new/message", (req, res) => {
  mongoData.updateOne(
    { _id: req.query.id },
    { $push: { conversation: req.body } },
    // { new: true },
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      } else {
        res.status(201).send(data);
      }
    }
  );
});

app.get("/get/conversationList", (req, res) => {
  mongoData.find((err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      data.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });

      let conversations = [];

      data.map((conversationData) => {
        const conversationInfo = {
          id: conversationData._id,
          name: conversationData.chatName,
          timestamp: conversationData.conversation[0].timestamp,
        };

        conversations.push(conversationInfo);
      });

      res.status(200).send(conversations);
    }
  });
});

app.get("/get/conversation", (req, res) => {
  mongoData.find({ _id: req.query.id }, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

app.get("/get/lastMessage", (req, res) => {
  mongoData.find({ _id: req.query.id }, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      let conversationData = data[0].conversation;
      conversationData.sort((b, a) => {
        return a.timestamp - b.timestamp;
      });
      res.status(200).send(conversationData[0]);
    }
  });
});

// listen
app.listen(port, () => console.log("listening on port " + port));
