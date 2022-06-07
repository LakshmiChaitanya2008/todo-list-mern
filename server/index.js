const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const User = require("./models/user.model");
const Todos = require("./models/todo.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = express();

mongoose.connect(process.env.MONGODB_URL);
dotenv.config();

app.use(cors());
app.use(express.json());

app.delete("/api/todos", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { id } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email });

    const todos = await Todos.deleteOne({ _id: id });

    return res.json({ todos });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/api/todos", async (req, res) => {
  const token = req.headers["x-access-token"];
  const { title } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email });

    const todos = await Todos.create({ title, user: user._id });

    return res.json({ todos });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.get("/api/todos", async (req, res) => {
  const token = req.headers["x-access-token"];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email });

    const todos = await Todos.find({ user: user._id });

    return res.json({ todos });
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Check if entered details are correct
  if (!name || !email || !password) {
    res.status(400).json({ message: "Please enter all the details" });
  }

  const userExists = await User.findOne({ email });
  // Check if user already exists

  if (userExists) {
    res.status(400).json({ message: "User already exists" });
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User created successfully" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Please enter all the details" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ message: "User does not exist" });
  }

  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { name: user.name, email: user.email, id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
      res.status(200).json({ message: "Login successful", token: token });
    } else {
      res.status(400).json({ message: "Password incorrect" });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
