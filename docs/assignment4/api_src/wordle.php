<?php

// error if no 'action' is specified
$error_must_pass = '
{
	"type": "error",
	"error": "Must pass \'?action\' GET query string."
}
';

// error if invalid 'action' is specified
$error_must_pass_type = '
{
	"type": "error",
	"error": "Must pass \'?action=new_word\' or \'?action=check_word\' as action."
}
';

// error if no 'word' is specified when action is 'check_word'
$error_must_pass_word = '
{
	"type": "error",
	"error": "Must pass \'?word=\' GET query string for action \'check_word\'."
}
';

// response if 'check_word' returns false
$error_mispelled_word = '
{
	"type": "check_word",
	"result": false,
	"error": "The word is not in the list of valid 5 letter words."
}
';

// response if 'check_word' is given a string that is not 5 characters
$error_mispelled_word_length = '
{
	"type": "check_word",
	"result": false,
	"error": "The word is not a 5 character word."
}
';

// response if 'check_word' is given a valid 5 letter word
$success_spelled_word = '
{
	"type": "check_word",
	"result": true,
	"status": "The word is on the list of valid 5 letter words."
}
';

// response if PHP fails to load the word files
$error_file_io = '
{
	"type": "error",
	"error": "Internal Server Error: file IO exception"
}
';

// handler for action 'new_word', reads 'words.txt' and gets a random line
function makeNewWord() {
	$file = fopen("words.txt", "r");
	$firstLine = fgets($file);
	if($firstLine == false || substr($firstLine, 0, 9) !== "#length: ") {
		fclose($file);
		return $error_file_io;
	}
	$nextLineOffset = strlen($firstLine);
	$totalWords = intval(substr($firstLine, 9, $nextLineOffset - 10)); // parse #length header
	fseek($file, rand(0, $totalWords - 1) * 6 + $nextLineOffset); // seek to random word
	$word = fgets($file, 6); // read 5 letters
	fclose($file);
	return $word; // return word
}

// handler for action 'check_word', searches for the word in a line of a file
function hasWordInFile($f, $w) {
	$file = fopen($f, "r");
	$line = false;
	while(($line = fgets($file)) !== false) { // read next line
		if(substr($line, 0, 5) == $w) { // check first 5 characters (6th is newline)
			fclose($file);
			return true; // word was found
		}
	}
	fclose($file);
	return false; // word was not found
}

// process query string
if(isset($_GET["action"])) {
	if($_GET["action"] == "new_word") {
		echo '{"type": "new_word", "word": "'.makeNewWord().'"}'; // return new word
	}else if($_GET["action"] == "check_word") {
		if(isset($_GET["word"])) {
			if(strlen($_GET["word"]) == 5) {
				if(hasWordInFile("spell.txt", $_GET["word"])) { // check word spelling
					echo $success_spelled_word;
				}else {
					echo $error_mispelled_word; // error
				}
			}else {
				echo $error_mispelled_word_length; // error
			}
		}else {
			echo $error_must_pass_word; // error
		}
	}else {
		echo $error_must_pass_type; // error
	}
}else {
	echo $error_must_pass; // error
}

?>