"use strict";

const menu = new Array();

function updateCart() {
	var priceTotal = 0.0;
	menu.forEach((v) => {
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
	obj.updateCallback();
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
			setCartCount(i, 0);
		});
		document.getElementById("receipt").innerHTML = "";
		document.getElementById("take_order").style.display = "block";
		document.getElementById("order_complete").style.display = "none";
	});
	
	menu.push(createMenuItem({
		updateCallback: updateCart,
		cost: 4.00,
		itemName: "Hotdog",
		itemElement: document.getElementById("menu_item_hotdog"),
		itemCartElement: document.getElementById("menu_item_hotdog_cart")
	}));
	
	menu.push(createMenuItem({
		updateCallback: updateCart,
		cost: 3.50,
		itemName: "Fries",
		itemElement: document.getElementById("menu_item_fries"),
		itemCartElement: document.getElementById("menu_item_fries_cart")
	}));
	menu.push(createMenuItem({
		updateCallback: updateCart,
		cost: 1.50,
		itemName: "Soda",
		itemElement: document.getElementById("menu_item_soda"),
		itemCartElement: document.getElementById("menu_item_soda_cart")
	}));
	menu.push(createMenuItem({
		updateCallback: updateCart,
		cost: 1.00,
		itemName: "Sauerkraut",
		itemElement: document.getElementById("menu_item_sauerkraut"),
		itemCartElement: document.getElementById("menu_item_sauerkraut_cart")
	}));
});