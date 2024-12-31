const p = document.querySelectorAll("p");
const input = document.querySelector(".val");

let display = "";
let operands = [];
let operator = "";

for (let i = 0; i < p.length; i++) {
  p[i].addEventListener("click", clickEventListener);
}

function clickEventListener(event) {
  console.log(event.target.innerText);
  const char = event.target.innerText;
  if(!["⬅", "+", "−", "×", "÷", "=", "C"].includes(char)) {
    // add number to display and add number to operands array
    display += char;
    input.value = display;
    // operands.push(Number(display));
  }
  if (char == "C") {
    display = "0";
    input.value = display;
    operands = [];
    operator = "";
  }
  if (char == "⬅") {
    // keep deleting the chars from display 1 character at a time with
    // newest char deleted first
    display = display.substring(0, display.length - 1);
    input.value = display;
    // if the display string becomes empty, make sure the last element
    // from operands array is removed
    if (display == "") {
      operands = operands.pop();
    }
  }
  if (["+", "−", "×", "÷"].includes(char)) {
    operands.push(Number(display));
    display = "";
    operator = char;
    input.value = operator;
  }
  if (char == "=") {
    operands.push(Number(display));
    input.value = calculateResult("=");
    operands = [];
    operator = "";
    display = "";
  }
}

function calculateResult(op) {
  console.log(`Current operands >>> ${operands} and operator >> ${operator}`);

  // if '=' is pressed and only one operand is present , then return the operand
  if (operands.length == 1) {
    if (op == "=") {
      return operands[0];
    }
  } else {
    // SUM
    if (operator == "+") {
      // console.log(operands.reduce((a, c) => a + c));
      operands = [operands.reduce((a, c) => a + c)];
      return operands[0];
    }
    // DIFF
    if (operator == "−") {
      operands = [operands.reduce((a, c) => a - c)];
      return operands[0];
    }
    // MULTIPLY
    if (operator == "×") {
      operands = [operands.reduce((a, c) => a * c)];
      return operands[0];
    }
    // DIVISION
    if (operator == "÷") {
      operands = [operands.reduce((a, c) => a / c)];
      return operands[0];
    }
  }
}
