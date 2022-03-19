"use strict";

const menu = {};

function updateCart() {
	var priceTotal = 0.0;
	menu.items.forEach((v) => {
		priceTotal += v.cartSize * v.cost;
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
	
function setCartCount(obj, c) {
	obj.cartSize = c;
	if(c === 0) {
		obj.itemCartElement.style.display = "none";
	}else {
		obj.itemCartElement.style.display = "block";
		obj.itemCartElement.innerText = "" + c;
	}
	updateCart();
}

function formatPrice(p) {
	return "$" +
		Math.floor(p) + "." +
		(Math.floor(p * 10.0) % 10) + "" +
		(Math.floor(p * 100.0) % 10);
}

window.addEventListener("load", () => {
	
	document.getElementById("checkout").addEventListener("click", () => {
		document.getElementById("take_order").style.display = "none";
		document.getElementById("order_complete").style.display = "block";
		var priceTotal = 0.0;
		var r = document.getElementById("receipt");
		r.innerHTML = "";
		menu.items.forEach((v) => {
			priceTotal += v.cartSize * v.cost;
			for(var ii = 0; ii < v.cartSize; ++ii) {
				var li = document.createElement("li");
				li.innerText = formatPrice(v.cost) + " - " + v.itemName;
				r.appendChild(li);
			}
		});
		document.getElementById("receipt_total").innerText = "Total: " + formatPrice(priceTotal);
	});
	
	document.getElementById("return").addEventListener("click", () => {
		menu.items.forEach((v) => {
			setCartCount(v, 0);
		});
		document.getElementById("receipt").innerHTML = "";
		document.getElementById("take_order").style.display = "block";
		document.getElementById("order_complete").style.display = "none";
	});
	
	const menuCosts = {
		"Hotdog": 4.00,
		"Fries": 3.50,
		"Soda": 1.50,
		"Sauerkraut": 1.00
	};
	
	const menuItems = {
		"Hotdog": document.getElementById("menu_item_hotdog"),
		"Fries": document.getElementById("menu_item_fries"),
		"Soda": document.getElementById("menu_item_soda"),
		"Sauerkraut": document.getElementById("menu_item_sauerkraut")
	};
	
	const menuCartItems = {
		"Hotdog": document.getElementById("menu_item_hotdog_cart"),
		"Fries": document.getElementById("menu_item_fries_cart"),
		"Soda": document.getElementById("menu_item_soda_cart"),
		"Sauerkraut": document.getElementById("menu_item_sauerkraut_cart")
	};
	
	function createMenuItem(name) {
		const self = {
			itemName: name,
			cartSize: 0,
			cost: menuCosts[name],
			itemElement: menuItems[name],
			itemCartElement: menuCartItems[name]
		};
		menuItems[name].addEventListener("click", (e) => {
			if(e.button === 0) {
				setCartCount(self, ++self.cartSize);
			}else {
				if(self.cartSize >= 1) {
					setCartCount(self, --self.cartSize);
				}
			}
		});
		menuItems[name].addEventListener("contextmenu", (e) => {
			if(self.cartSize >= 1) {
				setCartCount(self, --self.cartSize);
			}
			e.preventDefault();
			return false;
		});
		return self;
	}
	
	menu.items = [
		createMenuItem("Hotdog"),
		createMenuItem("Fries"),
		createMenuItem("Soda"),
		createMenuItem("Sauerkraut")
	];
	
});