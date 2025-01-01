const buttons = document.querySelectorAll("button");
const input = document.querySelector(".val");

let display = "";
let operands = [];
let operator = "";

for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener("click", clickEventListener);
}

function clickEventListener(event) {
  console.log(event.target.innerText);
  const char = event.target.innerText;
  if (!["⬅", "+", "−", "×", "÷", "=", "C"].includes(char)) {
    // add character input to display string
    display += char;
    input.value = display;
  }
  // CLEAR
  if (char == "C") {
    display = "0";
    input.value = display;
    operands = [];
    operator = "";
  }
  // BACKSPACE
  if (char == "⬅") {
    // keep deleting the chars from display 1 character at a time with
    // newest char deleted first
    display = display.substring(0, display.length - 1);
    input.value = display;
    // if the display string becomes empty, set the display to 0
    if (display == "") {
      display = "0";
      input.value = display;
    }
  }
  // OPERATOR CLICKED
  if (["+", "−", "×", "÷"].includes(char)) {
    operands.push(Number(display));
    display = "";
    operator = char;
    input.value = operator;
  }
  // EQUAL CLICKED
  // if "=" is pressed, there are two situations
  // 1. = is pressed without any OPERATION performed, then return the number input in the display
  // 2. = is pressed after OPERATION is performed and operator is non empty, then return result of "calculateResult"
  if (char == "=") {
    if (!operator) {
      input.value = display;
    } else {
      operands.push(Number(display));
      input.value = calculateResult();
      // EXTREMELY IMPORTANT : set the display to the result so that any subsequent operator click takes this result as one of the operand for the subsequent operations
      display = input.value;
    }
  }
}

function calculateResult() {
  console.log(`Current operands >>> ${operands} and operator >> ${operator}`);

  // SUM
  if (operator == "+") {
    // console.log(operands.reduce((a, c) => a + c));
    let result = operands.reduce((a, c) => a + c);
    operands = [];
    return result;
  }
  // DIFF
  if (operator == "−") {
    let result = operands.reduce((a, c) => a - c);
    operands = [];
    return result;
  }
  // MULTIPLY
  if (operator == "×") {
    let result = operands.reduce((a, c) => a * c);
    operands = [];
    return result;
  }
  // DIVISION
  if (operator == "÷") {
    let result = operands.reduce((a, c) => a / c);
    operands = [];
    return result;
  }
}
