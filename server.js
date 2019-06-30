// For the database
require('dotenv').config();
const psql = process.env.DATABASE_URL;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: psql
});
const bcrypt = require('bcrypt');

// for routing
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 8080;
const app = express();

// For connecting user
const http = require('http').Server(app);
const io = require('socket.io')(http);
const clients = [];

io.sockets.on('connection', function (socket) {
  socket.on('username', function (username) {
    socket.username = username;
    clients.push({
      name: username
    });
    io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
  });

  socket.on('disconnect', function (username) {
    for (let i = 0; i < clients.length; i++) {
      if (clients[i].name == socket.username) clients.splice(i, 1); // remove the user
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
  res.send(clients);
});

app.post('/create-user', (req, res) => {
  console.log("Username: ", req.body.username);
  console.log("Password: ", req.body.password);

  // check for duplicate username
  checkForDuplicateUsername(req.body.username).then(response => {
    console.log(response);
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

function createUser(username, password, res) {
    // hash the password
    const saltRounds = 10;
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