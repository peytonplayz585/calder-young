
var allowedLettersInField = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var letterTriedFields = [];
var guessButton = null;
var clearButton = null;
var newGameButton = null;
var guessWrapper = null;
var currentGuessLine = null;
var resultList = null;
var resultListContainer = null;
var resultListWord = null;
var tries = 6;
var triesRemainingText = null;
var noneRemaining = null;
var notAWord = null;
var debugCheckbox = null;
var debugTextContainer = null;
var debugText = null;
var scores = null;
var score = 0;
var wins = 0;
var losses = 0;
const knownWords = [];
const knownNotWords = [];

var currentWord = "";

// uses fetch() to get a new word from https://api.eags.us/wordle.php
// returns null and replaces the page on failure
function getNewWord() {
	return new Promise(resolve => {
		fetch("https://api.eags.us/wordle.php?action=new_word")
			.then(response => response.json())
			.then(data => {
				if(data["type"] == "error") {
					document.body.innerHTML = "<h1 style=\"color:red;\">Request Error: " + data["error"] + "</h1>";
					resolve(null);
				}else if(data["type"] == "new_word") {
					resolve(data["word"]);
				}else {
					document.body.innerHTML = "<h1 style=\"color:red;\">Request Error: " + JSON.stringify(data) + "</h1>";
					resolve(null);
				}
			})
			.catch(error => {
				document.body.innerHTML = "<h1 style=\"color:red;\">Request Error: " + error + "</h1>";
				resolve(null);
			});
	});
}

// uses fetch() on https://api.eags.us/wordle.php to check if a word exists
// returns null and replaces the page on failure
function verifyWord(word) {
	return new Promise(resolve => {
		if(knownWords.includes(word)) {
			resolve({result: true});
		}else if(knownNotWords.includes(word)) {
			resolve({result: false});
		}else {
			fetch("https://api.eags.us/wordle.php?action=check_word&word=" + word)
				.then(response => response.json())
				.then(data => {
					if(data["type"] == "error") {
						document.body.innerHTML = "<h1 style=\"color:red;\">Request Error: " + data["error"] + "</h1>";
						resolve(null);
					}else if(data["type"] == "check_word") {
						if(data["result"]) {
							knownWords.push(word);
							resolve({result: true});
						}else {
							knownNotWords.push(word);
							resolve({result: false});
						}
					}else {
						document.body.innerHTML = "<h1 style=\"color:red;\">Request Error: " + JSON.stringify(data) + "</h1>";
						resolve(null);
					}
				})
				.catch(error => {
					document.body.innerHTML = "<h1 style=\"color:red;\">Request Error: " + error + "</h1>";
					resolve(null);
				});
		}
	});
}
	
// class for wrapping one of the five text fields of the current guess
class GuessField {
	
	constructor(line, elemt) {
		this.line = line;
		this.elemt = elemt;
		this.letter = "";
		this.nextElemt = null;
		const self = this;
		this.elemt.classList.add("letterField");
		
		// select all text when clicked
		this.elemt.addEventListener("focus", () => {
			self.elemt.select();
		});
		
		// detects and validates any text input
		this.elemt.addEventListener("input", () => {
			var v = self.elemt.value.trim().toUpperCase(); // make uppercase
			if(v.length > 0) {
				if(v.length > 1) {
					v = v.substring(v.length - 1); // take the last character
				}
				if(allowedLettersInField.indexOf(v) < 0) { // check if it is A-Z
					self.elemt.value = ""; // clear letter
					self.letter = "";
				}else {
					self.elemt.value = v; // replace value with the uppercase A-Z
					self.letter = v; // sets letter variable for this object
					if(self.nextElemt != null) {
						self.elemt.blur();
						self.nextElemt.elemt.focus(); // auto jump to the next field (if any)
					}else {
						disableOrEnableButtons();
						if(!guessButton.disabled) {
							self.elemt.blur();
							guessButton.focus(); // jump to guess button (if enabled)
						}
						return;
					}
				}
			}else {
				self.letter = "";
			}
			disableOrEnableButtons();
		});
		
	}
	
	// sets the next element to jump to on sucessful input
	setNext(nextElemt) {
		this.nextElemt = nextElemt;
	}
	
	// disables the field
	disable() {
		this.elemt.disabled = true;
	}
	
	// clears the field and current letter variable
	clear() {
		this.elemt.value = "";
		this.letter = "";
	}
	
	// sets the background and foreground color of the field
	setColor(hex, txt) {
		if(txt) {
			this.elemt.style.color = txt;
		}else {
			this.elemt.style.color = "white";
		}
		this.elemt.style.backgroundColor = hex;
	}
	
	// makes field bold and with sans font
	setBoldFont() {
		this.elemt.style.fontFamily = "Ubuntu";
		this.elemt.style.fontWeight = "bold";
	}
	
}

// class to wrap a group of 5 fields for a guess
class GuessLine {
	
	constructor(elemt) {
		this.elemt = elemt;
		this.elemt.style.textAlign = "center";
		this.letters = [];
		
		// create field objects
		for(var i = 0; i < 5; ++i) {
			var f = document.createElement("input");
			var newField = new GuessField(this, f)
			this.letters.push(newField);
			if(i > 0) {
				this.letters[i - 1].setNext(newField); // set next field
			}
			this.elemt.appendChild(f);
			if(i < 4) {
				var s = document.createElement("span");
				s.innerHTML = "&emsp;";
				this.elemt.appendChild(s); // add spacing
			}
		}
	}
	
	// disables all fields
	disable() {
		for(var i = 0; i < this.letters.length; ++i) {
			this.letters[i].disable();
		}
	}
	
	// checks if any fields have a letter
	checkCanClear() {
		for(var i = 0; i < this.letters.length; ++i) {
			if(this.letters[i].letter.length > 0) {
				return true;
			}
		}
		return false;
	}
	
	// checks if all fields have a letter
	checkCanGuess() {
		for(var i = 0; i < this.letters.length; ++i) {
			if(this.letters[i].letter.length == 0) {
				return false;
			}
		}
		return true;
	}
	
	// clears all fields
	clear() {
		for(var i = 0; i < this.letters.length; ++i) {
			this.letters[i].clear();
		}
	}
	
	// inserts a header above the fields of this guess
	insertHeader(str) {
		var span = document.createElement("span");
		span.style.fontSize = "1.5em";
		span.style.fontWeight = "bold";
		span.innerText = str;
		this.elemt.insertBefore(document.createElement("br"), this.elemt.firstChild);
		this.elemt.insertBefore(document.createElement("br"), this.elemt.firstChild);
		this.elemt.insertBefore(span, this.elemt.firstChild);
		this.elemt.style.margin = "40px 0px";
	}
	
	// converts the letters in the fields to a string
	wordToString() {
		var str = "";
		for(var i = 0; i < this.letters.length; ++i) {
			str += this.letters[i].letter;
		}
		return str;
	}
	
}

// disable or enable Guess and Clear based on what fields contain a value
function disableOrEnableButtons() {
	newGameButton.disabled = false;
	guessButton.disabled = !currentGuessLine.checkCanGuess();
	clearButton.disabled = !currentGuessLine.checkCanClear();
}

// locks (disables) the current guess and adds a new line of fields
function pushGuess() {
	if(currentGuessLine != null) {
		currentGuessLine.disable();
	}
	var p = document.createElement("p");
	currentGuessLine = new GuessLine(p);
	guessWrapper.appendChild(p);
}

// remove a letter from a string by index
function removeLetter(str, i) {
	if(str.length == 0) {
		return "";
	}
	if(i == 0) {
		return str.substring(1);
	}else if(i == str.length - 1) {
		return str.substring(0, str.length - 1);
	}else if(i >= str.length) {
		return str;
	}else {
		return str.substring(0, i) + str.substring(i + 1);
	}
}

// 1 = first, 2 = second, 3 = third, 4+ = #th
function getTH(v) {
	return v == 1 ? "first" : (v == 2 ? "second" : (v == 3 ? "third" : v + "th"))
}

// updates the wins, losses, and score. Changes score text color to red if wins < losses
function displayScores() {
	scores.style.display = "block";
	scores.innerHTML = "<span style=\"color:#004400;\">Wins: " + wins + "</span>&emsp;" + 
		"<span style=\"font-weight:bold;color:#" + (wins < losses ? "770000" : "004400") +
		";\">Score: " + score + "</span>&emsp;<span style=\"color:#770000;\">Losses: "
		+ losses + "</span>";
}

// initializes all variables once the page loads
window.addEventListener("load", async function() {
	guessButton = document.getElementById("guess");
	clearButton = document.getElementById("clear");
	newGameButton = document.getElementById("newGame");
	guessWrapper = document.getElementById("guessWrapper");
	resultList = document.getElementById("resultList");
	resultListContainer = document.getElementById("result");
	resultListWord = document.getElementById("resultWord");
	triesRemainingText = document.getElementById("remaining");
	noneRemaining = document.getElementById("noneRemaining");
	notAWord = document.getElementById("notAWord");
	debugCheckbox = document.getElementById("enableDebug");
	debugTextContainer = document.getElementById("debug");
	debugText = document.getElementById("debugText");
	scores = document.getElementById("scores");
	
	currentWord = await getNewWord(); // get the first word
	if(currentWord == null) {
		return; // document has been replaced with error
	}
	currentWord = currentWord.toUpperCase();
	
	pushGuess(); // create first line of fields
	
	guessButton.disabled = true;
	clearButton.disabled = true;
	newGameButton.disabled = true;
	
	clearButton.addEventListener("click", () => { // clear letters from all current fields
		currentGuessLine.clear();
		guessButton.disabled = true;
		clearButton.disabled = true;
		currentGuessLine.letters[0].elemt.focus(); // focuses to the first field
	});
	
	newGameButton.addEventListener("click", async function() { // new game button
	
		//reset all values
		guessButton.disabled = true;
		clearButton.disabled = true;
		newGameButton.disabled = true;
		noneRemaining.style.display = "none";
		notAWord.style.display = "none";
		currentGuessLine = null;
		resultListContainer.style.display = "none";
		resultList.innerHTML = "";
		triesRemainingText.innerText = "";
		tries = 6;
		
		// reset guesses
		guessWrapper.innerHTML = "";
		pushGuess();
		
		currentWord = await getNewWord(); // gets a new word
		if(currentWord == null) {
			return; // document has been replaced with error
		}
		currentWord = currentWord.toUpperCase();
		
		if(debugCheckbox.checked) {
			debugTextContainer.style.display = "block";
			debugText.innerText = "Solution: " + currentWord; // update debug text (if any)
		}else {
			debugTextContainer.style.display = "none";
		}
		
	});
	
	guessButton.addEventListener("click", async function() { // guess button clicked
		var currentStr = currentGuessLine.wordToString();
		var res = await verifyWord(currentStr.toLowerCase()); // requests api.eags.us to check if the word exists
		
		if(res == null) {
			return; // page contents was replaced with error
		}
		
		if(!res.result) { // api reports the word does not exist
			notAWord.style.display = "block";
			notAWord.innerText = "'" + currentStr + "' is not a word!";
			// clear fields:
			currentGuessLine.clear();
			guessButton.disabled = true;
			clearButton.disabled = true;
			currentGuessLine.letters[0].elemt.focus();
			return;
		}else {
			notAWord.style.display = "none"; // hide 'not a word' (if visible)
		}
		
		// locks (confirms) the current guess
		guessButton.disabled = true;
		clearButton.disabled = true;
		currentGuessLine.disable();
		
		var resultHTML = "";
		
		var win = true;
		var theLetters = currentWord;
		var theLettersCorrect = [];
		var theLetterCount = {};
		
		// figure out which letters are in the correct place
		for(var i = 0; i < 5; ++i) {
			var l = currentGuessLine.letters[i].letter;
			if(currentWord.substring(i, i + 1) == l) {
				theLettersCorrect.push(true);
				theLetters = removeLetter(theLetters, theLetters.indexOf(l));
			}else {
				theLettersCorrect.push(false);
			}
		}
		
		// check all letters
		for(var i = 0; i < 5; ++i) {
			var letterField = currentGuessLine.letters[i];
			var l = letterField.letter;
			var j = theLetters.indexOf(l);
			var k = currentWord.indexOf(l);
			if(j == -1 && k == -1) { // not in the word
				resultHTML += "&bull; <b>The " + l + "</b> is not in the word<br />";
				letterField.setColor("#AAAAAA");
				win = false;
			}else {
				var c = theLetterCount[l];
				if(typeof c === "undefined") {
					c = 0;
				}
				theLetterCount[l] = ++c; // increase number of the current letter
				if(theLettersCorrect[i]) {
					resultHTML += "&bull; <b>The " + l + "</b> is correct!<br />"; // print in correct place
					letterField.setColor("#33CC33"); // set color to green
				}else if(j == -1) {
					resultHTML += "&bull; <b>The " + getTH(c) + " " + l + "</b> is not in the word<br />"; // letter isn't in the word
					letterField.setColor("#AAAAAA"); // set color gray
					win = false;
				}else {
					theLetters = removeLetter(theLetters, j);
					if(k != i && !theLettersCorrect[i]) { // letter is in the wrong place
						resultHTML += "&bull; <b>The " + l + "</b> is in the wrong place<br />";
						letterField.setColor("#BBBB00");
						win = false;
					}
				}
			}
		}
		
		// decrease and show remaining tries
		triesRemainingText.innerText = "" + --tries + " " + (tries == 1 ? "try" : "tries") + " remaining";
		
		if(!win) { // a letter was incorrect in the previous checks
			resultListContainer.style.display = "inline-block";
			resultListWord.innerText = currentGuessLine.wordToString() + ":";
			resultList.innerHTML = resultHTML; // show reasons incorrect
			if(tries <= 0) {
				triesRemainingText.innerText = "";
				noneRemaining.style.display = "block"; // none remaining
				currentGuessLine.disable();
				guessButton.disabled = true;
				clearButton.disabled = true;
				losses += 1;
				displayScores(); // update and show scores text
			}else {
				pushGuess(); // ask for next guess
				currentGuessLine.letters[0].elemt.focus(); // focus first letter of next guess
			}
		}else { // USER WINS
			for(var i = 0; i < 5; ++i) {
				currentGuessLine.letters[i].setColor("#009900", "#FFFF33"); // set fields to green and yellow
				currentGuessLine.letters[i].setBoldFont(); // set fields bold
			}
			currentGuessLine.disable();
			currentGuessLine.insertHeader("You guessed the word!"); // show win header
			resultListContainer.style.display = "none";
			score += Math.max(tries, 1);
			wins += 1;
			displayScores();  // update and show scores text
		}
	});
	
	debugCheckbox.addEventListener("change", () => { // handle debug checkbox
		if(debugCheckbox.checked) {
			debugTextContainer.style.display = "block";
			debugText.innerText = "Solution: " + currentWord;
		}else {
			debugTextContainer.style.display = "none";
			debugText.innerText = "";
		}
	});
	
});
