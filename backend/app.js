import fs from 'node:fs/promises';

import bodyParser from 'body-parser';
import express from 'express';

// NOTE: start me with node app.js. use in conjunction with the react app 
// to simulate a db for now
const app = express();

//app.use(express.static('images'));
app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all domains
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

app.get('/books', async (req, res) => {
  const fileContent = await fs.readFile('./data/books.json');

  const booksData = JSON.parse(fileContent);

  res.status(200).json({ books: booksData });
});

app.put('/books', async (req, res) => {
  const books = req.body.books;

  await fs.writeFile('./data/books.json', JSON.stringify(books));

  res.status(200).json({ message: 'Books updated!' });
});

// app.get('/user-places', async (req, res) => {
//   const fileContent = await fs.readFile('./data/user-places.json');

//   const places = JSON.parse(fileContent);

//   res.status(200).json({ places });
// });

// app.put('/user-places', async (req, res) => {
//   const places = req.body.places;

//   await fs.writeFile('./data/user-places.json', JSON.stringify(places));

//   res.status(200).json({ message: 'User places updated!' });
// });

// 404
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  res.status(404).json({ message: '404 - Not Found' });
});

app.listen(3000);
