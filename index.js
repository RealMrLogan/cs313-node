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

app.use(express.static(path.join(__dirname, 'public')))
  .use(express.json()) // Sent from an API or AJAX
  .use(express.urlencoded({ extended: true })) // sent from HTML form
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

/* BEGIN TEAM 10 */
// app.post("/getPerson", (req, res) => {
//   const myPSQLStatement = `SELECT * FROM users WHERE id=${req.body.id}`;
//   // pool.connect().then(client => { // Non-blocking using a promise
//   //   return client.query(myPSQLStatement).then(response => {
//   //     client.release();
//   //     console.log("Back from DB with result:");
//   //     console.log(response.rows);
//   //     res.json(response.rows);
//   //   }).catch(err => {
//   //     console.log("Error in query: ")
//   //     console.log(err);
//   //   });
//   // });
//   pool.query(myPSQLStatement, (err, result) => {
//     // If an error occurred...
//     if (err) {
//       console.log("Error in query: ")
//       console.log(err);
//       return;
//     }

//     // Log this to the console for debugging purposes.
//     console.log("Back from DB with result:");
//     console.log(result.rows);
//     res.json(result.rows);
//   });
//   console.log("Test if blocking");
  
// })

app.get("/getPerson", (req, res) => {
  const myPSQLStatement = `SELECT * FROM users WHERE id=${req.query.id}`;
  pool.query(myPSQLStatement, (err, result) => {
    // If an error occurred...
    if (err) {
      console.log("Error in query: ")
      console.log(err);
      return;
    }

    // Log this to the console for debugging purposes.
    console.log("Back from DB with result:");
    console.log(result.rows);
    res.json(result.rows);
  });
  console.log("Test if blocking");
  
})
/* END TEAM 10 */

// begin PROVE 09
app.post("/getPostalRate", (req, res) => {
  const rate = calculateRate(req.body.weight, req.body.postalType);
  res.render("pages/postalResult", {
    rate: rate,
    postalType: req.body.postalType
  });
});

function calculateRate(weight, type) {
  switch (type) {
    case "Stamped Letters": {
      switch (true) {
        case weight <= 1:
          return .55;
        case weight <= 2:
          return .70;
        case weight <= 3:
          return .85;
        case weight <= 3.5:
          return 1.00;
        default:
          type = "Large Envelopes";
      }
    }
    case "Metered Letters": {
      switch (true) {
        case weight <= 1:
          return .50;
        case weight <= 2:
          return .65;
        case weight <= 3:
          return .80;
        case weight <= 3.5:
          return .95;
        default:
          type = "Large Envelopes";
      }
    }
    case "Large Envelopes": {
      switch (true) {
        case weight <= 1:
          return 1.00;
        case weight <= 2:
          return 1.15;
        case weight <= 3:
          return 1.30;
        case weight <= 4:
          return 1.45;
        case weight <= 5:
          return 1.60;
        case weight <= 6:
          return 1.75;
        case weight <= 7:
          return 1.90;
        case weight <= 8:
          return 2.05;
        case weight <= 9:
          return 2.20;
        case weight <= 10:
          return 2.35;
        case weight <= 11:
          return 2.50;
        case weight <= 12:
          return 2.65;
        case weight <= 13:
          return 2.80;
      }
    }
    case "First Class Package": {
      switch (true) {
        case weight <= 1:
          return 3.66;
        case weight <= 2:
          return 3.66;
        case weight <= 3:
          return 3.66;
        case weight <= 4:
          return 3.66;
        case weight <= 5:
          return 4.39;
        case weight <= 6:
          return 4.39;
        case weight <= 7:
          return 4.39;
        case weight <= 8:
          return 4.39;
        case weight <= 9:
          return 5.19;
        case weight <= 10:
          return 5.19;
        case weight <= 11:
          return 5.19;
        case weight <= 12:
          return 5.19;
        case weight <= 13:
          return 5.71;
      }
    }
  }
  return 0;
}
// end PROVE 09

// begin PROVE 08
app.get("/math", (req, res) => {
  const result = calculate(req.query);
  console.log(`${req.query.operand1} ${req.query.operation} ${req.query.operand2} = ${result}`);
  res.render('pages/math-result', {
    result: result
  });
});

app.get("/math_service", (req, res) => {
  const result = calculate(req.body, true);
  console.log(result);
});

function calculate(data, returnJSON = false) {
  const num1 = parseInt(data.operand1);
  const num2 = parseInt(data.operand2);
  let result = 0;
  switch (data.operation) {
    case "plus":
      result = num1 + num2;
    case "minus":
      result = num1 - num2;
    case "multiply":
      result = num1 * num2;
    case "divide":
      result = num1 / num2;
  }
  if (returnJSON) {
    return {
      operand1: num1,
      operand2: num2,
      operation: data.operation,
      result: result
    }
  } else {
    return result;
  }
}
// end PROVE 08
