'use strict';

const pg = require('pg');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const requestProxy = require('express-request-proxy'); // REVIEW: We've added a new package here to our requirements, as well as in the package.json
const PORT = process.env.PORT || 3000;
const app = express();
// const conString = 'postgres://USERNAME:PASSWORD@HOST:PORT';
const conString = 'postgres://localhost:5432';
const client = new pg.Client(conString);
client.connect();
client.on('error', function(error) {
  console.error(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));
// Done:
// COMMENT: What is this function doing? Why do we need it? Where does it receive a request from?
// (put your response in a comment here)
// The proxyGitHub function passes the two parameters request and response through to get the url and pass our GITHUB_TOKEN and then it calls the request and response.
function proxyGitHub(request, response) {
  console.log('Routing GitHub request for', request.params[0]);
  (requestProxy({
    url: `https://api.github.com/${request.params[0]}`,
    headers: {Authorization: `token ${process.env.GITHUB_TOKEN}`}
  }))(request, response);
}


app.get('/', (request, response) => response.sendFile('index.html', {root: '.'}));
app.get('/new', (request, response) => response.sendFile('new.html', {root: '.'}));
app.get('/github/*', proxyGitHub);
// Done:
// COMMENT: What is this route doing? Where does it receive a request from?
// (put your response in a comment here)
// app.get sends an ajax request at port articles/find to the let sql query, where we select all articles table and joins it with the authors table.
app.get('/articles/find', (request, response) => {
  let sql = `SELECT * FROM articles
            INNER JOIN authors
            ON articles.author_id=authors.author_id
            WHERE ${request.query.field}=$1`

  client.query(sql, [request.query.val])
  .then(result => response.send(result.rows))
  .catch(console.error);
})
//  Done:
// COMMENT: What is this route doing? Where does it receive a request from?
// (put your response in a comment here)
// app.get is an ajax request to port categories which uses a client.query to select a distinct category from articles, then takes the results and sends it to result.rows.
app.get('/categories', (request, response) => {
  client.query(`SELECT DISTINCT category FROM articles;`)
  .then(result => response.send(result.rows))
  .catch(console.error);
})

app.get('/articles', (request, response) => {
  client.query(`
    SELECT * FROM articles
    INNER JOIN authors
      ON articles.author_id=authors.author_id;`
  )
  .then(result => response.send(result.rows))
  .catch(console.error);
});

app.post('/articles', (request, response) => {
  client.query(
    'INSERT INTO authors(author, "authorUrl") VALUES($1, $2) ON CONFLICT DO NOTHING',
    [request.body.author, request.body.authorUrl]
  )
  .then(() => {
    client.query(`
      INSERT INTO
      articles(author_id, title, category, "publishedOn", body)
      SELECT author_id, $1, $2, $3, $4
      FROM authors
      WHERE author=$5;
      `,
      [
        request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body,
        request.body.author
      ]
    )
  })
  .then(() => response.send('Insert complete'))
  .catch(console.error);
});
// Done:
// COMMENT: What is this route doing? Where does it receive a request from?
// (put your response in a comment here)
// is an ajax put request to port articles/:id with a client query to updates the information to the authors and the articles tables using sql.
app.put('/articles/:id', (request, response) => {
  client.query(`
    UPDATE authors
    SET author=$1, "authorUrl"=$2
    WHERE author_id=$3
    `,
    [request.body.author, request.body.authorUrl, request.body.author_id]
  )
  .then(() => {
    client.query(`
      UPDATE articles
      SET author_id=$1, title=$2, category=$3, "publishedOn"=$4, body=$5
      WHERE article_id=$6
      `,
      [
        request.body.author_id,
        request.body.title,
        request.body.category,
        request.body.publishedOn,
        request.body.body,
        request.params.id
      ]
    )
  })
  .then(() => response.send('Update complete'))
  .catch(console.error);
});

app.delete('/articles/:id', (request, response) => {
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`,
    [request.params.id]
  )
  .then(() => response.send('Delete complete'))
  .catch(console.error);
});

app.delete('/articles', (request, response) => {
  client.query('DELETE FROM articles')
  .then(() => response.send('Delete complete'))
  .catch(console.error);
});

loadDB();

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));


//////// ** DATABASE LOADERS ** ////////
////////////////////////////////////////
function loadAuthors() {
  fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
    JSON.parse(fd.toString()).forEach(ele => {
      client.query(
        'INSERT INTO authors(author, "authorUrl") VALUES($1, $2) ON CONFLICT DO NOTHING',
        [ele.author, ele.authorUrl]
      )
      .catch(console.error);
    })
  })
}

function loadArticles() {
  client.query('SELECT COUNT(*) FROM articles')
  .then(result => {
    if(!parseInt(result.rows[0].count)) {
      fs.readFile('./public/data/hackerIpsum.json', (err, fd) => {
        JSON.parse(fd.toString()).forEach(ele => {
          client.query(`
            INSERT INTO
            articles(author_id, title, category, "publishedOn", body)
            SELECT author_id, $1, $2, $3, $4
            FROM authors
            WHERE author=$5;
          `,
            [ele.title, ele.category, ele.publishedOn, ele.body, ele.author]
          )
          .catch(console.error);
        })
      })
    }
  })
}

function loadDB() {
  client.query(`
    CREATE TABLE IF NOT EXISTS
    authors (
      author_id SERIAL PRIMARY KEY,
      author VARCHAR(255) UNIQUE NOT NULL,
      "authorUrl" VARCHAR (255)
    );`
  )
  .then(loadAuthors)
  .catch(console.error);

  client.query(`
    CREATE TABLE IF NOT EXISTS
    articles (
      article_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL REFERENCES authors(author_id),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL
    );`
  )
  .then(loadArticles)
  .catch(console.error);
}
