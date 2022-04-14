const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Mail
require("dotenv").config();
const nodemailer = require("nodemailer");

//User Model
let User = require("../models/user");

//Confirm MAIL
router.get("/confirm/:id", function (req, res) {
  console.log(req.params.id);
  let user = {};
  user.confirmMail = "confirmed";
  let query = { _id: req.params.id };

  User.update(query, user, function (err) {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Verified Mail :)");
      res.redirect("/users/login");
    }
  });
});

// Register Form
router.get("/register", function (req, res) {
  res.render("register");
});

// Register Proccess
router.post("/register", function (req, res) {
  const role = "user"; //For Default, it's a user and not admin
  const confirmMail = "not-confirmed"; //only register   | not-confirmed
  const name = req.body.name;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const password2 = req.body.password2;
  var id;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Email is not valid").isEmail();
  req.checkBody("password", "Password is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render("Register", {
      title: "Register",
      name: name,
      username: username,
      email: email,
      errors: errors,
    });
  } else {
    let newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      confirmMail: confirmMail,
      role: role,
    });

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(newUser.password, salt, function (err, hash) {
        if (err) {
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function (err) {
          if (err) {
            console.log(err);
            return;
          } else {
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
              to: email,
              subject: "Confirmation email " + email,
              html:
                '<html><body><div align="center"><a href="http://localhost:3000/users/confirm/' +
                newUser._id +
                '">Confirm your account! </a></div></body></html>',
            };
            // Step 3
            transporter.sendMail(mailOptions, function (err, data) {
              if (err) {
                console.log("Error Occurs for the send mail");
              } else {
                console.log("Email sent :) ");
              }
            });
            req.flash(
              "success",
              "Check your mailbox, for the validate of the registration"
            );
            res.redirect("/users/login");
          }
        });
      });
    });
  }
});

// Login Form
router.get("/login", function (req, res) {
  res.render("login");
});

// Login Proccess
router.post("/login", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// Logout Process
router.get("/logout", function (req, res) {
  req.logout();
  req.flash("success", "You are logged out ");
  res.redirect("/users/login");
});

module.exports = router;
