var socket = io.connect();

function startChatting(option, username) {
  switch (option) {
    case "generic":
      console.log("Assigning generic name");
      giveUsername();
      break;
    case "created":
      console.log("created an account");
      socket.emit('username', username);
      break;
    case "duplicate":
      console.log(`${username} already exists!`);
      alert("That username already exists, please choose another one");
      return;
      break;
    case "failure":
      console.log("There has been an error");
      
      break;
  }
  // hide the modal
  document.getElementById("login-modal").style.display = "none";
  // show the message box
  document.getElementById("send-message").style.display = "block";
}

// submit text message without reload/refresh the page
$('#create-user').submit((e) => {
  e.preventDefault(); // prevents page reloading
  fetch('/create-user', {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      username: document.getElementsByName("username")[0].value,
      password: document.getElementsByName("password")[0].value
    })
  }).then(res => res.json()).then(response => {
    console.log(response);
    switch (response.result) {
      case "success":
        startChatting("created", response.user);
        break;
      case "duplicate":
        startChatting("duplicate", response.user);
        break;
      case "failure":
        startChatting("failure", response.user);
        break;
    }
  }).catch(err => {
    console.log(err);

  })
});

// submit text message without reload/refresh the page
$('#send-message').submit((e) => {
  e.preventDefault(); // prevents page reloading
  socket.emit('chat_message', $('#txt').val());
  $('#txt').val('');
  return false;
});

// append the chat text message
socket.on('chat_message', (msg) => {
  $('#messages').append($('<li>').html(msg));
});

// append text if someone is online
socket.on('is_online', (username) => {
  $('#messages').append($('<li>').html(username));
});

function getUser() {
  fetch('/getConnectedUsers').then(res => res.json()).then(response => {
    console.log(response);
    if (response.length > 0) { // there is at least 1 user

    }

  });
}

function isTyping() {

}

function giveUsername() {
  const firstName = ["gatorade", "tomatoe", "bagel", "pudding", "icecream", "burrito", "cake"];
  const lastName = ["sunrise", "crab", "tophat", "wedding", "wheelchair", "eggplant", "mosque"];
  const username = firstName[Math.floor(Math.random() * firstName.length)] + '_' + lastName[Math.floor(Math.random() * lastName.length)];
  socket.emit('username', username);
}