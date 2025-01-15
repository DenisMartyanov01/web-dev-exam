const URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/";
const apiKey = '74902033-57f7-417f-9e55-5a53ba870cb9';

let goods;
let orders;

let currentOrderID = 0;

function eraseTable() {

    let table_ = document.getElementById("table");

    while (table_.hasChildNodes()) {
        table_.removeChild(table_.firstChild);
    }

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function showNotification(string, color) {

    allert.style.display = "block";
    allert_text.textContent = string;
    allert.style["background-color"] = color;
    document.getElementById("close").style["background-color"] = color;

    await sleep(5000);
    allert.style.display = "none";
}


function getGoodById(id) {

    if (goods)
        for (let i = 0; i < goods.length; i++) {
            if (goods[i].id == id)
                return goods[i];
        }
    return {};
}

function calculatePrice(order) {

    let d_price = 200;
    let g_price = 0;

    for (let i = 0; i < order.good_ids.length; i++) {

        let a = getGoodById(order.good_ids[i]); 

        if (a) {
            if (a.discount_price)
                g_price += a.discount_price;
            else 
                g_price += a.actual_price;

        }
    }

    const _date = new Date(order.delivery_date.value);

    if (_date.getDay() == 6)
        d_price += 300;
    else {
        if (order.delivery_interval.value == "18:00-22:00")
            d_price += 200;
    }
    return d_price + g_price;

}

function getNames(order) {

    let names = "";

    for (let i = 0; i < order.good_ids.length; i++) {

        var a = getGoodById(order.good_ids[i]);
        if (a)
            names += a.name.slice(0, 20) + '...\n';
    }
    return names;
}

function showOrder(order) {

    try {

        show.style.display = "flex";

        date1.textContent = 
            order.created_at.replaceAll('-', '.').replace('T', ' ');

        name1.textContent = order.full_name;
        phone1.textContent = order.phone;
        email1.textContent = order.email;
        address1.textContent = order.delivery_address;
        date2.textContent = order.delivery_date;
        time1.textContent = order.delivery_interval;

        names1.textContent = getNames(order);
        price1.textContent = calculatePrice(order) + ' ₽';
        coment1.textContent = order.comment;

    } catch {
        showNotification("Ошибка!", "red");
    }
}

function editOrder(order) {

    edit.style.display = "flex";

    date21.textContent = 
        order.created_at.replaceAll('-', '.').replace('T', ' ');

    name21.placeholder = order.full_name;
    phone21.placeholder = order.phone;
    email21.placeholder = order.email;
    address21.placeholder = order.delivery_address;
    date22.placeholder = order.delivery_date;
    time21.value = order.delivery_interval;

    names21.textContent = getNames(order);
    price21.textContent = calculatePrice(order) + ' ₽';
    comment21.placeholder = order.comment;

    currentOrderID = order.id;
}

function showDeleteOrder(order) {

    document.getElementById("erase").style.display = "flex";
    currentOrderID = order.id;

}

function drawTable() {
    
    if (orders.length == 0) {
        no_orders.style.display = "flex";
        table.style.display = "none";
    } else 
        no_orders.style.display = "none";
    
    
    eraseTable();

    for (let i = 0; i < orders.length; i++) {

        let created_at = new String(orders[i].created_at)
            .replace("T", " ")
            .replaceAll('-', '.')
        ;

        var row = document.createElement("tr");

        var td1 = document.createElement("td");
        td1.textContent = i + 1;

        var td2 = document.createElement("td");
        td2.textContent = created_at;
        
        var td3 = document.createElement("td");
        td3.textContent = getNames(orders[i]);
        
        var td4 = document.createElement("td");
        td4.textContent = calculatePrice(orders[i]) + ' ₽';
        
        var td5 = document.createElement("td");
        td5.textContent = 
            orders[i].delivery_date
                .replaceAll('-', '.') + '\n' + 
                orders[i].delivery_interval;
        
        var td6 = document.createElement("td");
        td6.classList.add("container_horizontal");
        
        var btn1 = document.createElement("btn");
        btn1.addEventListener("click", () => {
            showOrder(orders[i]);
        });
        var img1 = document.createElement("img");
        img1.src = "imgs/show.png";
        btn1.append(img1);

        var btn2 = document.createElement("btn");
        btn2.addEventListener("click", () => {
            editOrder(orders[i]);
        });
        var img2 = document.createElement("img");
        img2.src = "imgs/edit.png";
        btn2.append(img2);

        var btn3 = document.createElement("btn");
        btn3.addEventListener("click", () => {
            showDeleteOrder(orders[i]);
        });
        var img3 = document.createElement("img");
        img3.src = "imgs/delete.png";
        btn3.append(img3);

        td6.append(btn1);
        td6.append(btn2);
        td6.append(btn3);

        row.append(td1);
        row.append(td2);
        row.append(td3);
        row.append(td4);
        row.append(td5);
        row.append(td6);
        table.append(row);

    }

    //document.getElementById('myTable') 
}


function loadOrders() {
    orders = [];
    fetch(URL + "orders?api_key=" + apiKey)
        .then(response => {
            return response.json();
        }).then(data => {
            orders = data;
            console.log(data);
            drawTable();
        });
}

function loadCarts() {
    goods = [];

    fetch(URL + "goods?api_key=" + apiKey)
        .then(response => {
            return response.json();
        }).then(data => {
            goods = data;

        }).then(() => {

            loadOrders();
        });
}


async function deleteOrder() {

    try {
        const response = 
            await fetch(URL + "orders/" + currentOrderID + "?api_key=" + apiKey,
                { method: 'DELETE' });

        if (response.ok) {
            console.log(response);
            loadCarts();
            sleep(1000);
            showNotification("Заказ удален!", "lightgreen");

        } else {
            alert('Ошибка на сервере!');
        }   

        erase.style.display = 'none';
    } catch {
        showNotification("Ошибка!", "red");
    }
}

formEdit.onsubmit = async (event) => {

    try {
        event.preventDefault();

        let formData = new FormData();

        if (document.getElementById('name21').value)
            formData.append(
                'full_name', 
                document.getElementById('name21').value
            );
        if (document.getElementById('phone21').value)
            formData.append(
                'phone', 
                document.getElementById('phone21').value
            );
        if (document.getElementById('email21').value)
            formData.append(
                'email', 
                document.getElementById('email21').value
            );
        if (document.getElementById('address21').value)
            formData.append(
                'delivery_address', 
                document.getElementById('address21').value
            );
        if (document.getElementById('date22').value) {
            let date = document.getElementById('date22').value;
            let final_date = date[8] + date[9] + '.' + date[5] + date[6] + '.' +
                date[0] + date[1] + date[2] + date[3];
            formData.append(
                'delivery_date', 
                final_date
            );
        }

        if (document.getElementById('time21').value)
            formData.append(
                'delivery_interval', 
                document.getElementById('time21').value
            );
        if (document.getElementById('comment21').value)
            formData.append(
                'comment', 
                document.getElementById('comment21').value
            );
        
        const response = 
            await fetch(URL + "orders/" + currentOrderID + "?api_key=" + apiKey,
                { method: 'PUT', body: formData });

        if (response.ok) {
            showNotification("Заказ обновлен!", "lightgreen");
            formEdit.reset();
            loadCarts();

        } else {
            showNotification("Ошибка!", "red");
        }   
    } catch {
        showNotification("Ошибка!", "red");
    }

};

function addEvents() {

    document.getElementById("close").addEventListener("click", () => {
        document.getElementById("allert").style.display = "none";
    });

}

loadCarts();
addEvents();