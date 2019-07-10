var socket = io.connect();

function checkResponse(result, user) { // FIXME: this might be DRY
  switch (result) {
    case "success":
      startChatting("created", user);
      break;
    case "duplicate":
      startChatting("duplicate", user);
      break;
    case "loggedin":
      startChatting("loggedin", user);
      break;
    case "unauthorized":
      startChatting("unauthorized", user);
      break;
    case "failure":
      startChatting("failure", user);
      break;
  }
}

function startChatting(option, username) {
  switch (option) {
    case "generic":
      console.log("Assigning generic name");
      giveUsername();
      break;
    case "created":
      console.log("created an account");
      setAndAddUser(username);
      socket.emit('username', username);
      break;
    case "loggedin":
      console.log("logged in succesfully");
      setAndAddUser(username);
      socket.emit('username', username);
      break;
    case "unauthorized":
      console.log("incorrect credentials");
      alert("Your credentials are incorrect");
      modalLoadingScreen("hide");
      return;
      break;
    case "duplicate":
      console.log(`${username} already exists!`);
      alert("That username already exists, please choose another one");
      modalLoadingScreen("hide");
      return;
      break;
    case "failure":
      console.log("There has been an error");
      modalLoadingScreen("hide");
      return;
      break;
  }
  // hide the modal
  document.getElementById("login-modal").style.display = "none";
  // show the message box
  document.getElementById("send-message").style.display = "flex";
}

function setAndAddUser(username) {
  document.cookie = "username=" + username;
  fetch('/add-user', {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      username: username
    })
  }).then(res => console.log("Added user", 200))
    .catch(err => console.log(err));
}

function modalLoadingScreen(action) {
  switch (action) {
    case "show":
      $(".modal-content").addClass("blur");
      break;
    case "hide":
      $(".modal-content").removeClass("blur");
      break;
  }
}

// create a user
$('#create-user').submit((e) => {
  modalLoadingScreen("show");
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
    checkResponse(response.result, response.user);
  }).catch(err => {
    console.log(err);
  })
});

// log in
document.getElementById("log-in").addEventListener('submit', e => {
  modalLoadingScreen("show");
  e.preventDefault();
  fetch('/log-in', {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      username: document.getElementsByName("username")[1].value,
      password: document.getElementsByName("password")[1].value
    })
  }).then(res => res.json()).then(response => {
    checkResponse(response.result, response.user);
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

// call this function every 2.5 seconds to update the UI
setInterval(getUsers, 2500);
function getUsers() {
  fetch('/getConnectedUsers').then(res => res.json()).then(response => {
    console.log(response);
    if (response.length > 0) { // there is at least 1 user
      updateUsers(response);
    }
  });
}

function updateUsers(data) {
  // show or hide the icon if there are users there
  if (data.length > 0) {
    document.getElementById('users').style.display = "block"
  } else {
    document.getElementById('users').style.display = "none"
  }

  const icon = document.getElementById("user-icon");
  switch (data.length) {
    case 1:
      icon.src = "../images/single.svg"
      break;
    case 2:
      icon.src = "../images/double.svg"
      break;
    case 3:
    default:
      icon.src = "../images/multiple.svg"
      break;
  }
  document.getElementById("num-users").innerHTML = data.length;
}

function isTyping() {
  console.log(document.cookie);


}

function giveUsername() {
  const firstName = ["purple", "ivory", "beige", "green", "honeydew", "amethyst", "chartreuse", "coral", "aqua", "blue"];
  const lastName = ["salamander", "tapir", "lamb", "meerkat", "addax", "sloth", "lynx", "jaquar", "mustang", "alpaca", "dugong", "rhino"];
  const username = firstName[Math.floor(Math.random() * firstName.length)] + '_' + lastName[Math.floor(Math.random() * lastName.length)] + "_" + Math.round(Math.random() * 1000);
  setAndAddUser(username);
  socket.emit('username', username);
}