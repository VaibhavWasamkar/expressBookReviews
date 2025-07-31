const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username already exists
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Secret key for JWT
const accessTokenSecret = 'A1B2C3';

// User login and token generation
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  const token = jwt.sign({ username: user.username }, accessTokenSecret, { expiresIn: '1h' });

  req.session.authorization = {
    accessToken: token,
    username: user.username
  };

  return res.status(200).json({ message: "Login successful", token });
});

// Middleware to verify JWT or session
const verifyTokenOrSession = (req, res, next) => {
  // Check for session first
  if (req.session?.authorization?.username) {
    req.user = { username: req.session.authorization.username };
    return next();
  }

  // Check for JWT in Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or malformed Authorization header" });
  }

  const token = authHeader && authHeader.split(' ')[1];

  jwt.verify(token, accessTokenSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// PUT /auth/review/:isbn – Add/update review
regd_users.put("/auth/review/:isbn", verifyTokenOrSession, (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user.username;

  if (!review) {
    return res.status(400).json({ message: "Review query is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully" });
});

// DELETE /auth/review/:isbn – Delete review by logged-in user
regd_users.delete("/auth/review/:isbn", verifyTokenOrSession, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user to delete" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
