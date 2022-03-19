
const numbers = [
	"Ace",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"Jack",
	"Queen",
	"King",
	"Ace 11"
];

const values = [
	1,
	2,
	3,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	10,
	10,
	10,
	11
];

const suits = [
	"Diamonds",
	"Hearts",
	"Clubs",
	"Spades"
];

const deck = new Array();

const dealerHand = new Array();
const playerHand = new Array();

var bet = 0;
var youHave = 50.00;

function setCards(hand, names, forceShow) {
	var counter = 0;
	if(names.length <= 0) {
		document.getElementById(hand + "-1").style.display = "inline-block";
	}else {
		document.getElementById(hand + "-1").style.display = "none";
		names.forEach((v) => {
			var id = hand + counter++;
			if(counter > 5) {
				console.log("too many cards for " + hand + " (" + counter + " extra cards)");
			}else {
				if(hand === "dealer" && counter == 2 && names.length === 2 && !forceShow) {
					document.getElementById("dealerHidden").style.display = "inline-block";
				}else {
					if(hand === "dealer") document.getElementById("dealerHidden").style.display = "none";
					const card = document.getElementById(id);
					card.style.display = "inline-block";
					setTimeout(() => { card.style.opacity = "1.0"; }, 20);
					document.querySelector("#" + id + " .suit").innerText = suits[v.suit];
					document.querySelector("#" + id + " .count").innerText = numbers[v.number];
					document.querySelector("#" + id + " img").src = suits[v.suit].toLowerCase() + ".png";
				}
			}
		});
	}
	for(var i = (!forceShow && counter === 2) ? 1 : counter; i < 5; ++i) {
		var card = document.getElementById(hand + i);
		card.style.display = "none";
		card.style.opacity = "0.0";
	}
}

function formatPrice(p) {
	return "" +
		Math.floor(p) + "." +
		(Math.floor(p * 10.0) % 10) + "" +
		(Math.floor(p * 100.0) % 10);
}

function makeDeck(d) {
	var toShuffle = new Array();
	for(var i = 0; i < 4; ++i) {
		for(var j = 0; j < 13; ++j) {
			toShuffle.push({
				suit: i,
				number: j
			});
		}
	}
	while(toShuffle.length > 0) {
		d.push(toShuffle.splice(Math.floor(Math.random() * toShuffle.length * 0.999), 1)[0]);
	}
}

function getNextCard(w) {
	if(deck.length <= 0) {
		makeDeck(deck);
	}
	var c = deck.pop();
	if(c.number === 0 && checkWinnerCount(w) + 11 <= 21) {
		c.number = 13;
	}
	return c;
}

function checkWinnerCount(hand) {
	var playerTotal = 0;
	hand.forEach((v) => {
		playerTotal += values[v.number];
	});
	return playerTotal;
}

function win(player, bust) {
	if(player) {
		document.getElementById("pass").style.display = "none";
		document.getElementById("hit").style.display = "none";
		var winner = document.getElementById("winner");
		winner.style.display = "block";
		winner.style.color = "black";
		winner.innerText = "You win!";
		var betField = document.getElementById("your_bet");
		youHave += bet;
		document.getElementById("you_have").innerText = formatPrice(youHave);
		betField.disabled = false;
	}else {
		document.getElementById("pass").style.display = "none";
		document.getElementById("hit").style.display = "none";
		var winner = document.getElementById("winner");
		winner.style.display = "block";
		winner.style.color = "red";
		winner.innerText = "Dealer wins!" + (bust ? " (you busted)" : "");
		var betField = document.getElementById("your_bet");
		youHave -= bet;
		if(youHave <= 0.0) {
			document.getElementById("restart").disabled = true;
			setTimeout(() => { alert("You're broke, refresh the page to start over"); }, 200);
		}
		document.getElementById("you_have").innerText = formatPrice(youHave);
		betField.value = formatPrice(Math.floor(youHave, bet));
		betField.disabled = youHave <= 0.0;
	}
	setCards("dealer", dealerHand, true);
}

function checkWinner(brek) {
	var playerTotal = checkWinnerCount(playerHand);
	var dealerTotal = checkWinnerCount(dealerHand);
	if(playerTotal == 21 || dealerTotal > 21 || playerHand.length >= 5 || dealerHand.length >= 5) {
		if(!brek) win(true, false);
		return true;
	}else if(dealerTotal == 21 || dealerTotal > playerTotal || playerTotal > 21) {
		if(!brek) win(false, playerTotal > 21);
		return true;
	}
	return false;
}

function runTurn(hit) {
	if(hit) {
		playerHand.push(getNextCard(playerHand));
		setCards("player", playerHand, true);
	}else {
		dealerHand.push(getNextCard(dealerHand));
		setCards("dealer", dealerHand, false);
	}
	checkWinner();
}

function confirmBet() { 
	var yourBetField = document.getElementById("your_bet");
	if(!yourBetField.disabled) {
		bet = parseFloat(yourBetField.value);
		if(bet === NaN || bet <= 0.0 || bet > youHave) {
			bet = youHave;
		}
		yourBetField.value = formatPrice(bet);
		yourBetField.disabled = true;
	}
}

window.addEventListener("load", (e) => {
	
	document.getElementById("pass").addEventListener("click", (ee) => {
		confirmBet();
		runTurn(false);
	});
	
	document.getElementById("hit").addEventListener("click", (ee) => {
		confirmBet();
		runTurn(true);
	});
	
	document.getElementById("restart").addEventListener("click", (ee) => {
		while(true) {
			document.getElementById("restart").innerText = "Restart";
			document.getElementById("pass").style.display = "inline";
			document.getElementById("hit").style.display = "inline";
			document.getElementById("winner").style.display = "none";
			document.getElementById("your_bet").disabled = false;
			playerHand.length = 0;
			dealerHand.length = 0;
			
			deck.length = 0;
			makeDeck(deck);
			
			playerHand.push(getNextCard(playerHand));
			playerHand.push(getNextCard(playerHand));
			setCards("player", playerHand, true);
			
			if(checkWinner()) {
				confirmBet();
				dealerHand.push(getNextCard(dealerHand));
				dealerHand.push(getNextCard(dealerHand));
				setCards("dealer", dealerHand, false);     // show 
				return;
			}
			
			dealerHand.push(getNextCard(dealerHand));
			dealerHand.push(getNextCard(dealerHand));
			setCards("dealer", dealerHand, false);
			
			if(checkWinner(true)) {
				continue;
			}
			return;
		}
	});
	
});
