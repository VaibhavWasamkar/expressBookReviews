const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
const public_users = express.Router();

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found for given ISBN" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  let results = [];

  for (let key in books) {
    if (books[key].author.toLowerCase() === author) {
      results.push({ isbn: key, ...books[key] });
    }
  }

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found for the given author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let results = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title) {
      results.push({ isbn: key, ...books[key] });
    }
  }

  if (results.length > 0) {
    return res.status(200).json(results);
  } else {
    return res.status(404).json({ message: "No books found for the given title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

/* Task 10: Async-Await Version
const getBooksAsync = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log("Books (using async/await):");
    console.log(response.data);
  } catch (error) {
    // Print the full error
    if (error.response) {
      console.error("Error Response:", error.response.status, error.response.statusText);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
};

// Call the function for testing
getBooksAsync(); */

/* Task 11: Using async/await
async function fetchBookByISBN(isbn) {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    console.log(`Book Details (ISBN ${isbn}):`);
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching book by ISBN:", error.message);
  }
}

// Call the function for testing
fetchBookByISBN("2"); */

/* Task 12: Using async/await
async function fetchBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    console.log(`Books by ${author}:`);
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching books by author:", error.message);
  }
}

// Call the function for test
fetchBooksByAuthor("Jane Austen"); */

/* Task 13: Using async/await
async function fetchBooksByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    console.log(`Books with title "${title}":`);
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching books by title:", error.message);
  }
}

// Call the function
fetchBooksByTitle("Fairy tales"); */

module.exports.general = public_users;
