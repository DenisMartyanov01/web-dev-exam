const URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/";
const apiKey = '74902033-57f7-417f-9e55-5a53ba870cb9';

let goods;

let carts_count = 0;
const load_count = 12;


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


function guessSearch(string) {

    let search_w = document.getElementById("search_words");
    search_w.style.visibility = "visible";
    
    if (string.length == 0) return;

    fetch(URL + "autocomplete?query=" + string + "&api_key=" + apiKey)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            //console.log(data);
            //console.log(data.length); 

            document.getElementById("guess1").textContent = '';
            document.getElementById("guess2").textContent = '';
            document.getElementById("guess3").textContent = '';


            if (data.length == 0 || data.length == 1)            
                search_w.style.height = "20px";
            else if (data.length == 2)
                search_w.style.height = "40px";
            else 
                search_w.style.height = "60px";

            makeLine = function(string) {

                if (string == '') return string;

                let search = document.getElementById("search");

                let ar = search.value.split(' ');
                ar[ar.length - 1] = string;

                return ar.join(' ');
            };

            if (data[0])
                document.getElementById("guess1").textContent = 
                    makeLine(data[0]);
            if (data[1])
                document.getElementById("guess2").textContent = 
                    makeLine(data[1]);
            if (data[2])
                document.getElementById("guess3").textContent = 
                    makeLine(data[2]);

        })
    ;

}

function addGood(id) {

    try {
        if (localStorage.getItem(id)) {
            localStorage.removeItem(id);
            showNotification("Товар удален", "lightblue");
            return false;
        }

        localStorage.setItem(id, id);
        showNotification("Товар добавлен", "lightblue");

        return true;
    
    } catch {
        showNotification("Ошибка!", "red");
    }
}

function eraseCarts() {

    let carts = document.getElementById("carts");

    while (carts.hasChildNodes()) {
        carts.removeChild(carts.firstChild);
    }

}

function sortGoods() {

    if (goods.length) {

        console.log(goods);
        goods.sort(

            function(a, b) {
                if (sort.value == "raitMin")
                    return a.rating - b.rating;
                if (sort.value == "raitMax")
                    return b.rating - a.rating;
                if (sort.value == "priceMin") {

                    let a_, b_;
                    if (a.discount_price) a_ = a.discount_price;
                    else a_ = a.actual_price;

                    if (b.discount_price) b_ = b.discount_price;
                    else b_ = b.actual_price;
    
                    return a_ - b_;

                }
                if (sort.value == "priceMax") {

                    let a_, b_;
                    if (a.discount_price) a_ = a.discount_price;
                    else a_ = a.actual_price;

                    if (b.discount_price) b_ = b.discount_price;
                    else b_ = b.actual_price;
    
                    return b_ - a_;
                }
            }
        );

    }

}


function drawCarts() {

    for (let i = carts_count; i < carts_count + load_count; i++) {

        if (i >= goods.length) break;

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

        let rating_ = document.createElement("p");
        rating_.textContent = "Рейтинг " + goods[i].rating;
        

        let d_pr = document.createElement("p");
        d_pr.textContent = goods[i].discount_price + ' ₽';
        
        let a_pr = document.createElement("p");
        a_pr.textContent = goods[i].actual_price + ' ₽';
        
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
        btn.textContent = "Добавить";
        btn.addEventListener("click", function () {

            if (addGood(goods[i].id))
                div.classList.add("active_cart");
            else 
                div.classList.remove("active_cart");

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
    carts_count += load_count;


}

function setSearch(element) {
    
    document.getElementById("search").value = 
        document.getElementById(element).textContent;
    
    guessSearch(document.getElementById("search").value);
}


function loadCarts(string) {
    fetch(URL + "goods?query=" + string + "&api_key=" + apiKey)
        .then(response => {
            return response.json();
        }).then(data => {
            goods = data;
            sortGoods();
            drawCarts();
            if (data.length == 0)
                document.getElementById("bad_search").style.display = "flex";


        });
}

function search() {

    document.getElementById("bad_search").style.display = "none";
    let a = document.getElementById("search");
    a.textContent = a.value.slice(0, a.value.length - 2);
    
    eraseCarts();
    carts_count = 0;
    loadCarts(document.getElementById("search").value);

}


function addEvents() {

    const addButton = document.getElementById("load_more");
    const searchField = document.getElementById("search");
    
    addButton.addEventListener("click", () => {
        drawCarts();
    }
    );

    searchField.addEventListener("input", () => {
        guessSearch(searchField.value);
    });

    searchField.addEventListener("change", async () => {
        await sleep(1000);
        document.getElementById("search_words").style.visibility = "hidden";

    });

    document.getElementById("guess1").addEventListener("click", () => {
        setSearch("guess1");
    });
    document.getElementById("guess2").addEventListener("click", () => {
        setSearch("guess2");
    });
    document.getElementById("guess3").addEventListener("click", () => {
        setSearch("guess3");
    });
    document.getElementById("close").addEventListener("click", () => {
        document.getElementById("allert").style.display = "none";
    });

    document.getElementById("search_button").addEventListener("click", () => {
        search();
    });
    document.getElementById("sort").addEventListener("change", async () => {
        await eraseCarts();
        await sortGoods();
        carts_count = 0;
        await drawCarts();
    });

}

loadCarts("");
addEvents();
