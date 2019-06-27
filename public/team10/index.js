// document.getElementById("ajax-submit").addEventListener("click", e => {
//    fetch('/getPerson', {
//       method: "POST",
//       headers: {
//          "content-type": "application/json"
//       },
//       body: JSON.stringify({
//          id: document.getElementById("user-id").value
//       })
//    }).then(res => res.json()).then(res => {
//       document.getElementById("response").innerHTML = JSON.stringify(res);
//    }).catch(err => {
//       console.log(err);
      
//    });
// });

// For GET
document.getElementById("ajax-submit").addEventListener("click", e => {
   fetch('/getPerson?id=' + document.getElementById("user-id").value)
   .then(res => res.json()).then(res => {
      document.getElementById("response").innerHTML = JSON.stringify(res);
   }).catch(err => {
      console.log(err);
      
   });
});