"use strict";

class MenuItem {
	
	constructor(updateCallback, itemName, cost, itemElement, itemCartElement) {
		this.updateCallback = updateCallback;
		this.itemName = itemName;
		this.cost = cost;
		this.itemElement = itemElement;
		this.itemCartElement = itemCartElement;
		this.cartSize = 0;
		
		const self = this;
		
		this.itemElement.addEventListener("click", (e) => {
			if(e.button === 0) {
				self.setCartCount(++self.cartSize);
			}else {
				if(self.cartSize >= 1) {
					self.setCartCount(--self.cartSize);
				}
			}
		});
		
		this.itemElement.addEventListener("contextmenu", (e) => {
			if(self.cartSize >= 1) {
				self.setCartCount(--self.cartSize);
			}
			e.preventDefault();
			return false;
		});
		
	}
	
	setCartCount(c) {
		this.cartSize = c;
		if(c === 0) {
			this.itemCartElement.style.display = "none";
		}else {
			this.itemCartElement.style.display = "block";
			this.itemCartElement.innerText = "" + c;
		}
		this.updateCallback();
	}
	
	getCartCount() {
		return this.cartSize;
	}
	
}

function formatPrice(p) {
	return "$" +
		Math.floor(p) + "." +
		(Math.floor(p * 10.0) % 10) + "" +
		(Math.floor(p * 100.0) % 10);
}

window.addEventListener("load", () => {
	
	const menu = new Array();
	
	var updateCart = function() {
		var priceTotal = 0.0;
		menu.forEach((i) => {
			priceTotal += i.cartSize * i.cost;
		});
		if(priceTotal > 0.0) {
			document.getElementById("cart").style.display = "block";
			document.getElementById("checkout").style.display = "block";
			document.getElementById("total_price").innerText = formatPrice(priceTotal);
		}else {
			document.getElementById("cart").style.display = "none";
			document.getElementById("checkout").style.display = "none";
		}
	}
	
	document.getElementById("checkout").addEventListener("click", () => {
		document.getElementById("take_order").style.display = "none";
		document.getElementById("order_complete").style.display = "block";
		var priceTotal = 0.0;
		var r = document.getElementById("receipt");
		r.innerHTML = "";
		menu.forEach((i) => {
			priceTotal += i.cartSize * i.cost;
			for(var ii = 0; ii < i.cartSize; ++ii) {
				var li = document.createElement("li");
				li.innerText = formatPrice(i.cost) + " - " + i.itemName;
				r.appendChild(li);
			}
		});
		document.getElementById("receipt_total").innerText = "Total: " + formatPrice(priceTotal);
	});
	
	document.getElementById("return").addEventListener("click", () => {
		menu.forEach((i) => {
			i.setCartCount(0);
		});
		document.getElementById("receipt").innerHTML = "";
		document.getElementById("take_order").style.display = "block";
		document.getElementById("order_complete").style.display = "none";
	});
	
	menu.push(
		new MenuItem(
			updateCart,
			"Hotdog",
			4.00,
			document.getElementById("menu_item_hotdog"),
			document.getElementById("menu_item_hotdog_cart")
		)
	);
	menu.push(
		new MenuItem(
			updateCart,
			"Fries",
			3.50,
			document.getElementById("menu_item_fries"),
			document.getElementById("menu_item_fries_cart")
		)
	);
	menu.push(
		new MenuItem(
			updateCart,
			"Soda",
			1.50,
			document.getElementById("menu_item_soda"),
			document.getElementById("menu_item_soda_cart")
		)
	);
	menu.push(
		new MenuItem(
			updateCart,
			"Sauerkraut",
			1.00,
			document.getElementById("menu_item_sauerkraut"),
			document.getElementById("menu_item_sauerkraut_cart")
		)
	);
	
	
});