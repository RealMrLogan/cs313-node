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

// For connecting user
const http = require('http').Server(app);
const io = require('socket.io')(http);

io.sockets.on('connection', function (socket) {
  socket.on('username', function (username) {
    socket.username = username;
    io.emit('is_online', '🔵 <i>' + socket.username + ' join the chat..</i>');
  });

  socket.on('disconnect', function (username) {
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
  .get('/', (req, res) => res.render('pages/index'))
  // .listen(PORT, () => console.log(`EXPRESS Listening on ${PORT}`));
http.listen(PORT, () => console.log(`HTTP Listening on ${PORT}`)); // socket.io uses http and not express