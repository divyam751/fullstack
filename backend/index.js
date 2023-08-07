const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const connection = require("./config/db");
const { UserModel } = require("./models/User.model");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Base API endpoint");
});

app.post("/signup", async (req, res) => {
  let { name, email, password, age, phone_number } = req.body;

  bcrypt.hash(password, 3, async function (err, hash) {
    const new_user = new UserModel({
      name,
      email,
      password: hash,
      age,
      phone_number,
    });

    try {
      await new_user.save();
      res.send("sign up successfull");
    } catch (err) {
      console.log("error while storing data in db");
      console.log(err);
      res.status(500).send("Something went wrong please try again later");
    }
  });
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.send("Sign up first");
  } else {
    const hashed_password = user.password;
    bcrypt.compare(password, hashed_password, function (err, result) {
      if (result) {
        let token = jwt.sign({ user_id: user._id }, process.env.SCREAT_KEY);
        res.send({ msg: "Login successful", token: token });
      } else {
        res.send("Login failed , invalid credentials");
      }
    });
  }
});

app.listen(8000, async () => {
  try {
    await connection;
    console.log("connected to db successfully");
  } catch (err) {
    console.log("error while connecting to db");
    console.log(err);
  }
  console.log("listing on port 8000");
});
