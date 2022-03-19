"use strict";

const menu = {};

function updateCart() {
	var priceTotal = 0.0;
	for(const [k, v] of Object.entries(menu.items)) {
		priceTotal += v.cartSize * v.cost;
	};
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
	
function createMenuItem(obj) {
	const self = obj;
	self.cartSize = 0;
	self.itemElement.addEventListener("click", (e) => {
		if(e.button === 0) {
			setCartCount(obj, ++self.cartSize);
		}else {
			if(self.cartSize >= 1) {
				setCartCount(obj, --self.cartSize);
			}
		}
	});
	self.itemElement.addEventListener("contextmenu", (e) => {
		if(self.cartSize >= 1) {
			setCartCount(obj, --self.cartSize);
		}
		e.preventDefault();
		return false;
	});
	return self;
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
		for(const [k, v] of Object.entries(menu.items)) {
			priceTotal += v.cartSize * v.cost;
			for(var ii = 0; ii < v.cartSize; ++ii) {
				var li = document.createElement("li");
				li.innerText = formatPrice(v.cost) + " - " + k;
				r.appendChild(li);
			}
		};
		document.getElementById("receipt_total").innerText = "Total: " + formatPrice(priceTotal);
	});
	
	document.getElementById("return").addEventListener("click", () => {
		for(const [k, v] of Object.entries(menu.items)) {
			setCartCount(v, 0);
		}
		document.getElementById("receipt").innerHTML = "";
		document.getElementById("take_order").style.display = "block";
		document.getElementById("order_complete").style.display = "none";
	});
	
	menu.items = {
		"Hotdog" : createMenuItem({
			cost: 4.00,
			itemElement: document.getElementById("menu_item_hotdog"),
			itemCartElement: document.getElementById("menu_item_hotdog_cart")
		}),
		"Fries" : createMenuItem({
			cost: 3.50,
			itemElement: document.getElementById("menu_item_fries"),
			itemCartElement: document.getElementById("menu_item_fries_cart")
		}),
		"Soda" : createMenuItem({
			cost: 1.50,
			itemElement: document.getElementById("menu_item_soda"),
			itemCartElement: document.getElementById("menu_item_soda_cart")
		}),
		"Sauerkraut": createMenuItem({
			cost: 1.00,
			itemElement: document.getElementById("menu_item_sauerkraut"),
			itemCartElement: document.getElementById("menu_item_sauerkraut_cart")
		})
	};
	
});