const rows = document.querySelectorAll(".row");
const numAttempts = document.querySelector(".puzzle").childElementCount;
const dayWordUrl = "https://words.dev-apis.com/word-of-the-day";
let wordOfTheDay = "";
let numOfChars = {};
let userInputWord = "";

// GET word from API
async function getWordOfDay() {
  const response = await fetch(dayWordUrl);
  const json = await response.json();
  console.log("word of the day is >>> ", json.word);
  wordOfTheDay = json.word;
}

// Handle spinner animation
async function spinTillNoWord() {
  document.querySelector(".spinner").setAttribute("class", "spinnerAnimate");
  await getWordOfDay();
  document.querySelector(".spinnerAnimate").setAttribute("class", "hidden");
}

// Call spinner method
spinTillNoWord();

// POST request to API to validate word
async function validateWord(word) {
  console.log("Word sent by user ??? ", word);

  const options = {
    method: "POST",
    body: JSON.stringify({ word: word }),
  };
  const request = await fetch(
    "https://words.dev-apis.com/validate-word",
    options
  );
  const response = await request.json();

  // console.log("POST response >>>>> ", response);
  return response;
}

// Handle attempts
for (let i = 0; i < rows.length; i++) {
  // console.log("ROW Number >> ", i + 1);
  rows[i].addEventListener("keydown", handleRow);
}

async function handleRow(e) {
  // Stop bubbling event to adjacent input and prevent default browser behavior for input field focus
  e.stopPropagation();
  e.preventDefault();

  // console.log(e.target);
  console.log(`Pressed >> ${e.key} with code >> ${e.key.charCodeAt(0)}`);

  // Construct array of children of event.target
  const parent = e.currentTarget;
  const children = Array.from(parent.children);
  // console.log("Children ?? ", children);
  const nthChild = children.indexOf(e.target) + 1;

  // User input word in current row
  userInputWord = children.reduce((a, c) => a + c.value, "");

  if (checkAlphabet(e.key) && e.key.length == 1) {
    // console.log(`Focused on child : ${children.indexOf(e.target) + 1}`);
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
    // console.log(children.reduce((a,c) => a + c.value, ''))
    // finally shift focus to 2nd attempt i.e 2nd row
    // const userInputWord = children.reduce((a, c) => a + c.value, "");
    const isValidWord = await validateWord(userInputWord);
    console.log("Response from server >>> ", isValidWord);
    if (!isValidWord.validWord) {
      invalidWord(children);
    } else {
      validWord(isValidWord.word, children);
    }
  }
}

function invalidWord(children) {
  children.map((el) => el.setAttribute("class", "redanimate"));
}

function validWord(word, children) {
  // let numOfCharsUserWord = letterOccurence(word);
  // numOfChars = letterOccurence(wordOfTheDay);
  let seen = [];

  for (let i = 0; i < word.length; i++) {
    const currentChar = word[i];
    const regex = new RegExp(currentChar, "gi");
    seen.push(currentChar);

    const currentCharIdx = findIndices(currentChar, wordOfTheDay);
    const currentCharIdxUser = findIndices(currentChar, userInputWord);

    console.log(
      `Character ${word[i]} present in word of the day at ${currentCharIdx}`
    );

    console.log(
      `Character ${word[i]} present in user word at ${currentCharIdxUser}`
    );

    // Char does not exist in word

    if (!wordOfTheDay.includes(currentChar)) {
      children[i].setAttribute("class", "gray");
    } else {
      // Char exists
      // Char appears only once in the word of day
      if (
        seen.filter((el) => el == currentChar).length ==
        wordOfTheDay.match(regex).length
      ) {
        if (word.indexOf(currentChar) == wordOfTheDay.indexOf(currentChar)) {
          children[i].setAttribute("class", "green");
        } else {
          children[i].setAttribute("class", "yellow");
        }
      }
      if (
        seen.filter((el) => el == currentChar).length >
        wordOfTheDay.match(regex).length
      ) {
        children[i].setAttribute("class", "gray");
      }
    }
  }
}

// Compare char positions between user word and word of the day
function comparePosOfChar(arrA, arrB) {
  let numIterations = arrA.length;
  if (arrA.length === arrB.length) {
    for (let el of arrA) {
      return arrB.indexOf(el) === arrA.indexOf(el);
    }
  }
  if (arrA.length < arrB.length) {
    let rejectedIdx = arrB.slice(arrA.length);
  }
}

// find all indices of char in word of the day
function findIndices(char, word) {
  let idxArr = [];
  for (let i = 0; i < word.length; i++) {
    if (word[i] === char) {
      idxArr.push(i);
    }
  }
  return idxArr;
}

// Count the occurence of letters
// console.log("occ. obj >>> ", numOfChars);

function letterOccurence(word) {
  let occurences = {};
  for (let char of word) {
    if (occurences[char]) {
      occurences[char]++;
    } else {
      occurences[char] = 1;
    }
  }
  return occurences;
}

function checkAlphabet(char) {
  return /[a-z]{1}/i.test(char);
}
