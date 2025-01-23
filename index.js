// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs'); // Module to work with file system

// Initialize the Express app
const app = express();
const PORT = 6969;

// Middleware
app.use(bodyParser.json());

// Path to the data file
const dataFilePath = './data.json';

// Helper function to read books from the file
function readBooksFromFile() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading data file:', err);
    return [];
  }
}

// Helper function to write books to the file
function writeBooksToFile(books) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2));
  } catch (err) {
    console.error('Error writing to data file:', err);
  }
}

// Helper function to validate book input
function validateBookInput(book) {
  const { book_id, title, author, genre, year, copies } = book;
  if (!book_id || !title || !author || !genre || !year || !copies) {
    return 'All fields (book_id, title, author, genre, year, copies) are required.';
  }
  if (typeof year !== 'number' || typeof copies !== 'number') {
    return 'Year and copies must be numbers.';
  }
  return null;
}

// Create a new book (POST /books)
app.post('/books', (req, res) => {
  const newBook = req.body;
  const validationError = validateBookInput(newBook);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const books = readBooksFromFile();

  // Check if the book already exists
  if (books.some(book => book.book_id === newBook.book_id)) {
    return res.status(400).json({ error: 'Book with the same ID already exists.' });
  }

  books.push(newBook);
  writeBooksToFile(books);
  res.status(201).json(newBook);
});

// Retrieve all books (GET /books)
app.get('/books', (req, res) => {
  const books = readBooksFromFile();
  res.json(books);
});

// Retrieve a specific book by ID (GET /books/:id)
app.get('/books/:id', (req, res) => {
  const books = readBooksFromFile();
  const book = books.find(b => b.book_id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }
  res.json(book);
});

// Update book information (PUT /books/:id)
app.put('/books/:id', (req, res) => {
  const books = readBooksFromFile();
  const bookIndex = books.findIndex(b => b.book_id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const updatedData = req.body;
  const validationError = validateBookInput({ ...books[bookIndex], ...updatedData });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  books[bookIndex] = { ...books[bookIndex], ...updatedData };
  writeBooksToFile(books);
  res.json(books[bookIndex]);
});

// Delete a book (DELETE /books/:id)
app.delete('/books/:id', (req, res) => {
  const books = readBooksFromFile();
  const bookIndex = books.findIndex(b => b.book_id === req.params.id);
  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  books.splice(bookIndex, 1);
  writeBooksToFile(books);
  res.json({ message: 'Book deleted successfully.' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Library Management System API is running on http://localhost:${PORT}`);
});
