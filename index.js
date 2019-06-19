const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 8080;
const app = express();

app.use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

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