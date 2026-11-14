
const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Register a new user
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user. Username and password are required." });
  }
  if (!isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Task 10: Get the book list available in the shop (Promise)
public_users.get('/', function (req, res) {
  const getBooks = new Promise((resolve) => {
    resolve(books);
  });

  getBooks
    .then((bookList) => res.status(200).send(JSON.stringify(bookList, null, 4)))
    .catch((err) => res.status(500).json({ message: "Error retrieving books", error: err.message }));
});

// Task 11: Get book details based on ISBN (Promise)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getBook = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error(`Book with ISBN ${isbn} not found`));
    }
  });

  getBook
    .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 12: Get book details based on author (Promise)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const getByAuthor = new Promise((resolve, reject) => {
    const result = Object.keys(books)
      .filter((isbn) => books[isbn].author.toLowerCase() === author.toLowerCase())
      .map((isbn) => ({ isbn: isbn, title: books[isbn].title, reviews: books[isbn].reviews }));
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error(`No books found by author ${author}`));
    }
  });

  getByAuthor
    .then((booksbyauthor) => res.status(200).send(JSON.stringify({ booksbyauthor }, null, 4)))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Task 13: Get all books based on title (Promise)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const getByTitle = new Promise((resolve, reject) => {
    const result = Object.keys(books)
      .filter((isbn) => books[isbn].title.toLowerCase() === title.toLowerCase())
      .map((isbn) => ({ isbn: isbn, author: books[isbn].author, reviews: books[isbn].reviews }));
    if (result.length > 0) {
      resolve(result);
    } else {
      reject(new Error(`No books found with title ${title}`));
    }
  });

  getByTitle
    .then((booksbytitle) => res.status(200).send(JSON.stringify({ booksbytitle }, null, 4)))
    .catch((err) => res.status(404).json({ message: err.message }));
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

/* ------------------------------------------------------------------
 * Tasks 10-13 using Axios with async/await and Promise callbacks.
 * These functions call the endpoints above over HTTP.
 * ------------------------------------------------------------------ */

// Task 10: Get all books - async/await with Axios
const getAllBooks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching all books: ${error.message}`);
  }
};

// Task 11: Search by ISBN - Promise callbacks with Axios
const getBookByISBN = (isbn) => {
  return axios.get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(`Error fetching book with ISBN ${isbn}: ${error.message}`);
    });
};

// Task 12: Search by author - async/await with Axios
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books by author ${author}: ${error.message}`);
  }
};

// Task 13: Search by title - async/await with Axios
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    throw new Error(`Error fetching books with title ${title}: ${error.message}`);
  }
};

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
