const URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/";
const apiKey = '74902033-57f7-417f-9e55-5a53ba870cb9';

let goods;


function calculatePrice() {

    let d_price = 200;
    let g_price = 0;

    for (let i = 0; i < goods.length; i++) {

        if (localStorage.getItem(goods[i].id)) {
            if (goods[i].discount_price)
                g_price += goods[i].discount_price;
            else 
                g_price += goods[i].actual_price;

        }
    }

    const _date = new Date(delivery_date.value);

    if (_date.getDay() == 6 || _date.getDay() == 0)
        d_price += 300;
    else {
        if (delivery_interval.value == "18:00-22:00")
            d_price += 200;
    }
    final_price.textContent = "Итоговая стоимость: " + 
        (d_price + g_price) + ' ₽';
    delivery_price.textContent = "(Стоимость доставки " + d_price + "р)";

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

function eraseCarts() {

    let carts = document.getElementById("carts");

    while (carts.hasChildNodes()) {
        carts.removeChild(carts.firstChild);
    }

}

function drawCarts() {

    document.getElementById("nothing_added").style.display = "flex";

    for (let i = 0; i < goods.length; i++) {

        if (!localStorage.getItem(goods[i].id))
            continue;

        document.getElementById("nothing_added").style.display = "none";

        let div = document.createElement('div');
        div.className = "cart";

        let img = document.createElement("img");
        img.src = goods[i].image_url;
        
        let name = document.createElement("div");
        name.textContent = goods[i].name;
        name.className = "long_text";
        
        let tooltip = document.createElement("p");
        tooltip.className = 'tooltip';
        tooltip.textContent = goods[i].name;

        name.append(tooltip);
        
        let rating = document.createElement("div");
        rating.classList.add("rating");
        let b = document.createElement("h2");
        b.textContent = goods[i].rating;
        b.classList.add("rt");
        rating.append(b);
        
        for (let j = 0; j < Math.round(goods[i].rating); j++) {
            let a = document.createElement("img");
            a.src = "imgs/star.png";
            a.classList.add("icon");
            rating.append(a);
        }

        let d_pr = document.createElement("p");
        d_pr.textContent = goods[i].discount_price + ' ₽';
        
        let a_pr = document.createElement("p");
        a_pr.textContent = goods[i].actual_price + ' ₽';
        a_pr.classList.add("actual");

        let disc_percent = Math.round(
            100 - (goods[i].discount_price / goods[i].actual_price) * 100
        );
        let disc = document.createElement("p");
        disc.textContent = '-' + disc_percent + '%';

        let prices = document.createElement("div");
        prices.classList.add("container_horizontal");
        if (goods[i].discount_price) {
            a_pr.classList.add('discount_price');
            prices.append(d_pr);
            prices.append(a_pr);
            prices.append(disc);
        } else 
            prices.append(a_pr);
        
        let btn = document.createElement("button");
        btn.className = 'button';
        btn.textContent = "Удалить";
        btn.addEventListener("click", function () {

            localStorage.removeItem(goods[i].id);
            showNotification("Товар удален", "lightblue");
            eraseCarts();
            drawCarts();
        });

        if (localStorage.getItem(goods[i].id))
            div.classList.add("active_cart");

        div.append(img);
        div.append(name);
        div.append(rating);
        div.append(prices);
        div.append(btn);
        
        document.getElementById("carts").append(div);
    }

    calculatePrice();
}

function loadCarts(string) {
    fetch(URL + "goods?query=" + string + "&api_key=" + apiKey)
        .then(response => {
            return response.json();
        }).then(data => {

            goods = data;
            console.log(goods);
            drawCarts();
            if (data.length == 0)
                document.getElementById("nothing_added").style.display = "flex";

        });
}

let form = document.getElementById("form");

form.onsubmit = async (event) => {
    
    event.preventDefault();

    let formData = new FormData();

    formData.append(
        'full_name', 
        document.getElementById('name').value
    );

    formData.append(
        'email', 
        document.getElementById('email').value
    );
    
    let subscribe;
    if (document.getElementById('sub').value)
        formData.append('subscribe', 1);
    else 
        formData.append('subscribe', 0);
    
    
    formData.append(
        'phone', 
        document.getElementById('phone').value
    );

    formData.append(
        'delivery_address', 
        document.getElementById('address').value
    );

    let date = document.getElementById('delivery_date').value;
    let final_date = date[8] + date[9] + '.' + date[5] + date[6] + '.' +
        date[0] + date[1] + date[2] + date[3];

    formData.append(
        'delivery_date', 
        final_date
    );
    
    formData.append(
        'delivery_interval', 
        document.getElementById('delivery_interval').value
    );

    formData.append(
        'comment', 
        document.getElementById('comment').value
    );
    
    let flag = true;
    for (let i = 0; i < goods.length; i++) {
        if (localStorage.getItem(goods[i].id)) {
            formData.append(
                'good_ids', 
                goods[i].id
            );
            flag = false;
        }

    }

    if (flag) {
        showNotification("Корзина пуста!", "red");
        return;
    }

    try {
        const response = await fetch(URL + "orders?api_key=" + apiKey, {
            method: 'POST',
            body: formData, 
        });

        if (response.ok) {
            console.log(response);
            localStorage.clear();
            eraseCarts();
            document.getElementById("nothing_added").style.display = "flex";
            calculatePrice();
            form.reset();
            showNotification("Заказ отправлен!", "lightgreen");
            await sleep(1000);
            location.href = "index.html";

        } else {
            showNotification('Ошибка на сервере!', "red");
        }   
    } catch {
        showNotification('Ошибка!', "red");

    }
    
};

function addEvents() {

    document.getElementById("close").addEventListener("click", () => {
        document.getElementById("allert").style.display = "none";
    });

    document.getElementById("delivery_interval")
        .addEventListener("change", () => {
            calculatePrice();
        });
    document.getElementById("delivery_date").addEventListener("change", () => {
        calculatePrice();
    });
}

loadCarts("");
addEvents();
