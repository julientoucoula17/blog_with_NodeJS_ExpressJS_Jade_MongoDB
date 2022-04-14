const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const config = require("./config/database");
let User = require("./models/user");
let Like = require("./models/like");
const mongo = require("mongodb").MongoClient;
const client = require("socket.io").listen(5000).sockets;
mongoose.connect(config.database);
let db = mongoose.connection;

// Mail
require("dotenv").config();
const nodemailer = require("nodemailer");

mongo.connect("mongodb://localhost/blog", function (err, db) {
  if (err) {
    throw err;
  }
  client.on("connection", function (socket) {
    let chat = db.collection("comments");
    sendStatus = function (s) {
      socket.emit("status", s);
    };

    socket.on("input", function (data) {
      let article_id = data.article;
      let name = data.name;
      let message = data.message;

      if (name == "" || message == "") {
        sendStatus("Enter your message");
      } else {
        chat.insert(
          { name: name, message: message, article_id: article_id },
          function () {
            //MAIL Step 1
            let transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
              },
            });
            //Step 2
            let mailOptions = {
              from: "contact.3web.project@gmail.com",
              to: "julien.toucoula@supinfo.com",
              subject: "Comments: " + name,
              html: "<h3>" + message + "</h3>",
            };
            // Step 3
            transporter.sendMail(mailOptions, function (err, data) {
              if (err) {
                console.log("Error Occurs for the send mail");
              } else {
                req.flash("success", "New Messages");
                console.log("Email sent :) ");
              }
            });

            client.emit("output", [data]);

            sendStatus({
              message: "Send Message",
              clear: true,
            });
          }
        );
      }
    });
  });
});

//Check connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

//check for db errors
db.on("error", function (err) {
  console.log(err);
});

// Init App
const app = express();
//Bring in Models
let Article = require("./models/article");

//Load View Engine (Use template engines with Express)
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//Expressjs : Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

//******** Express Session Middleware *********
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
  })
);
//******** Express Messages Middleware *********
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});
//******** Express Validator Middleware *********
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
  })
);

//Passport config
require("./config/passport")(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  //console.log(res.locals.user);
  next();
});

//Home Route
app.get("/likes", function (req, res) {
  if (req.user) {
    Like.find({ username: req.user.username }, function (err, likes) {
      if (err) {
        console.log(err);
      } else {
        res.render("likes", {
          title: "Loved Articles",
          likes: likes,
        });
      }
    });
  } else {
    req.flash("error", "You must authenticate");
    res.redirect("/users/login");
  }
});

/* test */
app.post("/:choice", function (req, res) {
  orderOfPublication = req.params.choice;
  if (orderOfPublication == 1) {
    //Oldest
    console.log("latest");
  } else if (orderOfPublication == 0) {
    console.log("newest");
  }
});

//Home Route
app.get("/", function (req, res) {
  if (req.user) {
    //console.log(req.user.role);
    if (req.user.role == "user") {
      Article.find({ visibility: "visible" }, function (err, articles) {
        if (err) {
          console.log(err);
        } else {
          res.render("index", {
            title: "Articles",
            articles: articles,
          });
        }
      });
    } else if (req.user.role == "admin") {
      Article.find({}, function (err, articles) {
        if (err) {
          console.log(err);
        } else {
          res.render("index", {
            title: "Articles",
            articles: articles,
          });
        }
      });
    }
  } else {
    req.flash("error", "You must authenticate");
    res.redirect("/users/login");
  }
});

//Routes Files
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);

//Start Server
app.listen(3000, function () {
  console.log("Server started on port 3000....");
});
