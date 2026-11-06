
const product = document.getElementById("product");
const quantity = document.getElementById("quantity");
const price = document.getElementById("price");

const addBtn = document.getElementById("addBtn");
const billTable = document.getElementById("data");
const grandTotal = document.getElementById("grandTotal");


addBtn.addEventListener("click", function() {

    let name = product.value;
    let qty = Number(quantity.value);
    let rate = Number(price.value);

    if (name === "" || qty <= 0 || rate <= 0) {
        alert("Please enter valid details");
        return;
    }

    let total = qty * rate;

    let row = document.createElement("tr");

    row.innerHTML = `
        <td>${name}</td>
        <td>${qty}</td>
        <td>${rate}</td>
        <td>${total}</td>
        <td><button onclick="this.parentElement.parentElement.remove(); calculateTotal()">Delete</button></td>
    `;

    billTable.appendChild(row);

    calculateTotal();

    product.value = "";
    quantity.value = "";
    price.value = "";

});


function calculateTotal() {

    let sum = 0;

    let rows = billTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        let total = Number(rows[i].cells[3].innerText);

        sum = sum + total;

    }

    grandTotal.innerText = sum;

}
    