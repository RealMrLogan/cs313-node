// For the database
require('dotenv').config();
const psql = process.env.DATABASE_URL;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: psql
});

// for routing
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 8080;
const app = express();

// For storing the users information
var cookieSession = require('cookie-session')
app.use(cookieSession({
  key: "user_id",
  secret: "asi7294gghs8v92jhg7sj4"
}))

// For connecting user
const http = require('http').Server(app);
const io = require('socket.io')(http);
const users = [];

// For hashing the password
const bcrypt = require('bcrypt');
const saltRounds = 10;

io.sockets.on('connection', function (socket) {
  socket.on('username', function (username) {
    socket.username = username;
    io.emit('is_online', '🔵 <i>' + socket.username + ' joined the chat..</i>');
  });

  socket.on('disconnect', function (username) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].name == socket.username) users.splice(i, 1); // remove the user
    }
    io.emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
  })

  socket.on('chat_message', function (message) {
    io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
  });
}); // this has to be declared before the server starts listening

app.use(express.static(path.join(__dirname, 'public')))
  .use(express.json()) // Sent from an API or AJAX
  .use(express.urlencoded({ extended: true })) // sent from HTML form
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  // .get('/', (req, res) => res.render('pages/index')) // send an EJS for the root
  .get('/', (req, res) => { res.sendFile("index.html", { root: __dirname + "/public/content" }) }) // have a staic page
// .listen(PORT, () => console.log(`EXPRESS Listening on ${PORT}`));
http.listen(PORT, () => console.log(`HTTP Listening on ${PORT}`)); // socket.io uses http and not express

app.get('/getConnectedUsers', (req, res) => {
  res.status(200).send(users);
});

app.post('/add-user', (req, res) => {
  users.push({
    name: req.body.username
  });
})

app.post('/create-user', (req, res) => {
  // check for duplicate username
  checkForDuplicateUsername(req.body.username).then(response => {
    if (response.rowCount == 0) { // there is not a duplicate
      createUser(req.body.username, req.body.password, res);
    } else { // there is a duplicate
      res.status(200).send({
        result: "duplicate",
        user: req.body.username
      });
    }
  }).catch(err => {
    console.log("There has been an error:", err);
  });
});

app.post('/log-in', (req, res) => {
  const myPSQLStatement = `SELECT user_name, password_hash FROM users WHERE user_name='${req.body.username}';`
  pool.query(myPSQLStatement, (err, result) => {
    if (err) console.log(err);
    if (result.rows.length == 0) { // it did not match the username
      res.status(401).send({
        result: "unauthorized"
      });
      return;
    }
    bcrypt.compare(req.body.password, result.rows[0].password_hash).then(response => { // hash the new password to check
      const data = {};
      let statusCode = 0;
      if (response == true) { // they match
        data.result = "loggedin";
          statusCode = 201;
      } else {
        data.result = "unauthorized";
        statusCode = 401;
      }
      data.user = req.body.username;

      res.status(statusCode).send(data);
    }).catch(err => {
      console.log(err);
    })
  });
});

function createUser(username, password, res) {
  // hash the password
  bcrypt.hash(password, saltRounds).then(hash => {
    // create the user and add it to the database
    const myPSQLStatement = `INSERT INTO users(user_name, password_hash) VALUES('${username}', '${hash}');`;
    // query the DB
    pool.query(myPSQLStatement, (err, result) => {
      const data = {};
      let statusCode = 0;
      // If an error occurred...
      if (err) {
        console.log("Error in query:", err);
        data.result = "failure";
        data.error = err;
        statusCode = 400;
      } else {
        data.result = "success";
        statusCode = 201;
      }
      data.user = username;

      res.status(statusCode).send(data);
    });
  });
}

function checkForDuplicateUsername(username) {
  return new Promise((resolve, reject) => {
    const myPSQLStatement = `SELECT user_name FROM users WHERE user_name='${username}';`
    pool.query(myPSQLStatement, (err, result) => {
      if (err) reject(err);
      resolve(result);
    });
  });
}