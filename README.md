# FullStack (Blogging Application)

# Installation for Backend

- npm init -y
- npm i express mongoose dotenv jsonwebtoken bcrypt
- npm install nodemon
- in package.json file add inside script

```java
"start" : "nodemon index.js",
```

# Creating server using express

- write inside index.js

```java
const express = require("express");

const app = express();

app.get("/",(req,res)=>{
    res.send("Base API endpoint");
})

app.listen(8000, () => {
  console.log("listing on port 8000");
});

```

- create config (folder) --> db.js --> create connection

```java
const mongoose = require("mongoose");

require("dotenv").config();

const connection = mongoose.connect(proocess.env.MONGO_URL);

module.exports = { connection };

```

- create .env file inside backend folder and paste mongodb atlas connection string

```java
MONGO_URL = mongodb+srv://<username>:<password>@cluster0.wpxdpyd.mongodb.net/<database_name>
```

- import connection in index.js

```java
const connection = require("./config/db");

```

- add try catch block for catching error if any while connecting to database

```java
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

```

- add a post request in index.js and it's good to check every point , use postman for post request

```java
app.post("/signup", (req, res) => {
  const { name, email, password, age, phone_number } = req.body;
  console.log(req.body);
  res.send("sign up successfull");
});
```

- http://localhost:8000/signup

```java
{
    "name" : "Spiderman",
    "email" : "parker@gmail.com",
    "password": "spi@123",
    "age" : 18,
    "phone_number": 987654321
}
```

- don't forget to use middleware for json in index.js

```java
    app.use(express.json());
```

- Now we need to make model create folder inside backend --> models

- inside models folder make model files and first character should be capital --> User.model.js

```java
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  phone_number: { type: Number, required: true },
});

const UserModel = mongoose.model("user", userSchema);

module.exports = { UserModel };

```

- import this UserModel in index.js

```java
const { UserModel } = require("./models/User.model");
```

- update post request to store data in db and don't forget to add status code (refer http error code cheat sheet)

```java
app.post("/signup", async (req, res) => {
  const { name, email, password, age, phone_number } = req.body;
  //   console.log(req.body);

  const new_user = new UserModel({
    name,
    email,
    password,
    age,
    phone_number,
  });

  try {
    await new_user.save();
    res.send("data stored successfully");
  } catch (err) {
    console.log("error while storing data in db");
    console.log(err);
    res.status(500).send("Something went wrong please try again later");
  }

  res.send("sign up successfull");
});
```

- now before storing it in to the database we need to hash the password using bcrypt

- refer bcrypt npm documentation and update post request

```java
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
```

- now check with postman post request and check in atlas database. (it's working :P)

# Sign in request

- refer npm bcrypt documentation for comparing hashed password

```java
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.send("Sign up first");
  }
  else {

    const hashed_password = user.password;

    bcrypt.compare(password, hashed_password, function (err, result) {
      if (result) {
        res.send("Login successful");
      } else {
        res.send("Login failed , invalid credentials");
      }
    });
  }
});
```

# JWT (JSON Web Token)

- Now the only way is to check wether user loged in or not is "token" using jwt "JSON Web Token"
- const jwt = require ("jsonwebtoken");
- var token = jwt.sign({ foo: 'bar' }, 'shhhhh');

```java
require("dotenv").config();
```

```java
app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    res.send("Sign up first");
  } else {
    const hashed_password = user.password;
    bcrypt.compare(password, hashed_password, function (err, result) {
      if (result) {
        let token = jwt.sign({ user_id: user._id }, process.env.SCREAT_KEY); // we will pass user._id
        res.send({ msg: "Login successful", token: token });
      } else {
        res.send("Login failed , invalid credentials");
      }
    });
  }
});
```

- update .env file => which we will not push on github

```java
MONGO_URL = mongodb+srv://divyam:admin@cluster0.wpxdpyd.mongodb.net/blog
SCREAT_KEY = divyam123dc
```

# CRUD operation using routes endpoint

- GET => "/blogs"
- POST=> "/blogs/create"
- PUT => "/blogs/edit/:blogID"
- DELETE => "/blog/delete/:blogID"

# =====================================

- create folder inside backend routes --> blogs.routes.js

```java
const { Router } = require("express");

const blogRouter = Router();

blogRouter.get("/", (req, res) => {
  res.send("blogs");
});
blogRouter.post("/create", (req, res) => {
  res.send("blog created");
});
blogRouter.put("/edit/:blogID", (req, res) => {
  res.send("blog edited");
});
blogRouter.delete("/delete/:blogID", (req, res) => {
  res.send("blog deleted");
});

module.exports = { blogRouter };

```

- add inside index.js

```java
const { blogRouter } = require("./routes/blogs.routes");
```

```java
app.use("/blogs", blogRouter);
```

# CRUD Logic

- now we need to write logic for CRUD operations

- need blog model for Create new Blog

- Blog.model.js inside models folder

```java
const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, require: true },
    description: { type: String, require: true },
    author_name: { type: String },
    author_email: { type: String },
  },
  {
    timestamps: true,
  }
);

const BlogModel = mongoose.model("blog", blogSchema);

module.exports = { BlogModel };

```

- create and write authentication middleware 


1:32 min