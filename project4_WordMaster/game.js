const rows = document.querySelectorAll(".row");
const numAttempts = document.querySelector(".puzzle").childElementCount;
const dayWordUrl = "https://words.dev-apis.com/word-of-the-day?puzzle=361";
let wordOfTheDay = "";
let userInputWord = "";
let currentAttempt = 0;
let result = false;

// GET word from API
async function getWordOfDay() {
  startAnimation();
  const response = await fetch(dayWordUrl);
  const json = await response.json();
  console.log("word of the day is >>> ", json.word);
  wordOfTheDay = json.word;
  endAnimation();
}

// Start animation
function startAnimation() {
  document.querySelector(".spinner").classList.remove("hidden");
}

// End animation
function endAnimation() {
  document.querySelector(".spinner").classList.add("hidden");
}

// Call getWordOfDay method
getWordOfDay();

// POST request to API to validate word
async function validateWord(word) {
  console.log("Word sent by user ??? ", word);
  startAnimation();

  const options = {
    method: "POST",
    body: JSON.stringify({ word: word }),
  };
  const request = await fetch(
    "https://words.dev-apis.com/validate-word",
    options
  );

  const response = await request.json();
  endAnimation();

  return response;
}

// Add event listener to all rows
for (let i = 0; i < rows.length; i++) {
  rows[i].addEventListener("keydown", handleRow);
}

// Handle attempts
// while(currentAttempt <= numAttempts) {

// }

async function handleRow(e) {
  // Stop bubbling event to adjacent input and prevent default browser behavior for input field focus
  e.stopPropagation();
  e.preventDefault();

  console.log(e.currentTarget);
  console.log(`Pressed >> ${e.key} with code >> ${e.key.charCodeAt(0)}`);

  // Construct array of children of event.target
  const parent = e.currentTarget;
  const children = Array.from(parent.children);
  // console.log("Children ?? ", children);
  const nthChild = children.indexOf(e.target) + 1;

  // User input word in current row
  userInputWord = children.reduce((a, c) => a + c.value, "");

  if (checkAlphabet(e.key) && e.key.length == 1) {
    handleCharKey(e, nthChild);
  } else if (e.key == "Backspace") {
    handleBackspaceKey(e, nthChild, children);
  } else if (e.key == "Enter") {
    // Disallow user to press enter until user input word is 5 chars long
    if (userInputWord.length < 5) {
      e.preventDefault();
    } else {
      handleEnterKey(e, nthChild, children);
    }
  }

  function handleCharKey(event, nthChild) {
    event.target.value = event.key;
    // shift focus to next till 4th child
    if (nthChild >= 1 && nthChild < 5) {
      event.target.nextElementSibling.focus();
    }
  }

  function handleBackspaceKey(event, nthChild, children) {
    // remove the class "redanimate" so that css can be applied again
    children.map((el) => el.removeAttribute("class", "redanimate"));
    if (nthChild > 1) {
      // Case 1 --> back is pressed when current focused input has a value
      if (event.target.value) {
        event.target.value = "";
        event.target.previousElementSibling.focus();
        // console.log(`Focused on child : ${children.indexOf(e.target)}`);
      }
      // Case 2 --> back is pressed when current focused input is empty and need to delete the previous input value
      else {
        event.target.previousElementSibling.value = "";
        event.target.previousElementSibling.focus();
        // console.log(`Focused on child : ${children.indexOf(event.target)}`);
        // }
      }
    } else if (nthChild == 1) {
      event.target.value = "";
    }
  }

  async function handleEnterKey(event, nthChild, children) {
    // Remove the css class to ensure red outline is shown again
    children.map((el) => el.removeAttribute("class", "redanimate"));

    // send POST request to API and check if its a valid word
    // if it is valid , compare with word of the day
    // else show red borders around all the input borders
    // finally shift focus to 2nd attempt i.e 2nd row
    
    const isValidWord = await validateWord(userInputWord);
    console.log("Response from server >>> ", isValidWord);
    
    if (!isValidWord.validWord) {
      invalidWord(children);
    } else {
      children.forEach((el) => el.setAttribute("disabled", "disabled"));
      validWord(isValidWord.word, children);
      currentAttempt++;
      handleNextAttempt(currentAttempt);
    }
  }
}

function invalidWord(children) {
  children.map((el) => el.setAttribute("class", "redanimate"));
}

function validWord(word, children) {
  // Keep track of chars already seen
  let seen = [];

  for (let i = 0; i < word.length; i++) {
    const currentChar = word[i];
    const regex = new RegExp(currentChar, "gi");
    seen.push(currentChar);

    // Char does not exist in word

    if (!wordOfTheDay.includes(currentChar)) {
      children[i].setAttribute("class", "gray");
    }

    // User guessed entire word correctly
    else if(word === wordOfTheDay) {
      children.forEach(el => el.setAttribute("class", "green"));
      result = true;
      showGreetingMessage(result);
    }

    // Char exists
    else {
      // Case 1 --> current char in guessed word is less or equal to that in actual word
      if (
        seen.filter((el) => el == currentChar).length <=
        wordOfTheDay.match(regex).length
      ) {
        if (
          word.slice(i).indexOf(currentChar) ===
          wordOfTheDay.slice(i).indexOf(currentChar)
        ) {
          children[i].setAttribute("class", "green");
        } else {
          children[i].setAttribute("class", "yellow");
        }
      }
      // Case 2 -> current char in guessed word exceeds that in actual word, so we need to ignore them
      else {
        children[i].setAttribute("class", "gray");
      }
    }
  }
}

function handleNextAttempt(num) {
  if (num < numAttempts) {
    rows[currentAttempt].children[0].focus();
  } else {
    showGreetingMessage(result);
  }
}

function showGreetingMessage(result) {
  const element = document.querySelector(".greeting");
  if (!result) {
    element.classList.add("red");
    element.innerText = `You lose ! Correct word : ${wordOfTheDay}`;
  } else {
    document.querySelectorAll('input').forEach(el => el.setAttribute('disabled','disabled'));
    element.classList.add("green");
    element.innerText = `You guessed it right ! Correct word : ${wordOfTheDay}`;
  }
  element.classList.remove("hidden");
}

function checkAlphabet(char) {
  return /[a-z]{1}/i.test(char);
}
