
var grid = null;
var gridStates = [[0,0,0],[0,0,0],[0,0,0]];
var turnX = true;
var winnerIsDisplayed = false;

function checkWinnerABC(a, b, c, xo) {
	return a == xo && b == xo && c == xo;
}

function checkWinner(turn) {
	return checkWinnerABC(gridStates[0][0], gridStates[1][0], gridStates[2][0], turn) ||
			checkWinnerABC(gridStates[0][1], gridStates[1][1], gridStates[2][1], turn) ||
			checkWinnerABC(gridStates[0][2], gridStates[1][2], gridStates[2][2], turn) ||
			
			checkWinnerABC(gridStates[0][0], gridStates[1][1], gridStates[2][2], turn) ||
			checkWinnerABC(gridStates[2][0], gridStates[1][1], gridStates[0][2], turn) ||
			
			checkWinnerABC(gridStates[0][0], gridStates[0][1], gridStates[0][2], turn) ||
			checkWinnerABC(gridStates[1][0], gridStates[1][1], gridStates[1][2], turn) ||
			checkWinnerABC(gridStates[2][0], gridStates[2][1], gridStates[2][2], turn);
}

function clickHandler(x, y) {
	if(!winnerIsDisplayed && gridStates[x][y] == 0) {
		setXorO(x, y, turnX ? 2 : 1);
		if(!checkWinner(turnX ? 2 : 1)) {
			
			var full = true;
			for(var i = 0; i < 3; ++i) {
				for(var j = 0; j < 3; ++j) {
					if(gridStates[i][j] == 0) {
						full = false;
						break;
					}
				}
				if(!full) {
					break;
				}
			}
			
			if(!full) {
				turnX = !turnX;
				document.getElementById("XorO").innerText = turnX ? "X" : "O";
			}else {
				document.getElementById("XorOwinner").innerText = "It's a tie";
				document.getElementById("normalHeader").style.display = "none";
				document.getElementById("winnerHeader").style.display = "block";
				winnerIsDisplayed = true;
			}
			
		}else {
			document.getElementById("XorOwinner").innerText = (turnX ? "X" : "O") + " Wins!";
			document.getElementById("normalHeader").style.display = "none";
			document.getElementById("winnerHeader").style.display = "block";
			winnerIsDisplayed = true;
		}
	}
}

function setXorO(x, y, xo) {
	var current = gridStates[x][y];
	var ele = grid[x][y];
	if(current == 1) {
		ele.classList.remove("o");
	}else if(current == 2) {
		ele.classList.remove("x");
	}
	if(xo > 0) {
		ele.classList.add(xo == 1 ? "o" : "x");
	}
	gridStates[x][y] = xo;
}

window.addEventListener("load", function(e) {
	
	grid = [
		[
			document.getElementById("b00"),
			document.getElementById("b10"),
			document.getElementById("b20")
		],
		[
			document.getElementById("b01"),
			document.getElementById("b11"),
			document.getElementById("b21")
		],
		[
			document.getElementById("b02"),
			document.getElementById("b12"),
			document.getElementById("b22")
		]
	];
	
	for(var i = 0; i < 3; ++i) {
		for(var j = 0; j < 3; ++j) {
			const x = i, y = j;
			grid[i][j].addEventListener("click", function(ee) {
				clickHandler(x, y);
			});
		}
	}
	
	document.getElementById("reset").addEventListener("click", function(ee) {
		for(var i = 0; i < 3; ++i) {
			for(var j = 0; j < 3; ++j) {
				setXorO(i, j, 0);
			}
		}
		turnX = !turnX;
		document.getElementById("XorO").innerText = turnX ? "X" : "O";
		document.getElementById("normalHeader").style.display = "block";
		document.getElementById("winnerHeader").style.display = "none";
		winnerIsDisplayed = false;
	});
	
});