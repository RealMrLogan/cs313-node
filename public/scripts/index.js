var socket = io.connect();

function startChatting(option) {
  switch (option) {
    case "generic":
      console.log("Assigning generic name");
      giveUsername();
      break;
    case "create":
      console.log("created an account");
      
      break;
  }

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
    
    startChatting("create");
  });
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

function checkForUser() {
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