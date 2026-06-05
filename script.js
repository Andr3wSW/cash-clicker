let money = 0;
let clickPower = 1;
let upgradeCost = 10;

const moneyDisplay =
document.getElementById("money");

const upgradeBtn =
document.getElementById("upgradeBtn");

const coin =
document.getElementById("coin");

const coinTier =
document.getElementById("coinTier");

const coinStages = [

{
    name:"Copper",
    symbol:"¢",
    color1:"#c97b3b",
    color2:"#a65b1d"
},

{
    name:"Silver",
    symbol:"S",
    color1:"#dddddd",
    color2:"#999999"
},

{
    name:"Gold",
    symbol:"$",
    color1:"#ffd54f",
    color2:"#ffb300"
},

{
    name:"Diamond",
    symbol:"♦",
    color1:"#80deea",
    color2:"#26c6da"
},

{
    name:"Crypto",
    symbol:"₿",
    color1:"#ab47bc",
    color2:"#6a1b9a"
}

];

function updateCoinVisual(){

    const stage =
    Math.min(
        Math.floor((clickPower - 1) / 5),
        4
    );

    const tier =
    ((clickPower - 1) % 5) + 1;

    const data =
    coinStages[stage];

    coin.textContent =
    data.symbol;

    coin.style.background =
    `linear-gradient(
        135deg,
        ${data.color1},
        ${data.color2}
    )`;

    coinTier.textContent =
    `${data.name} Tier ${tier}`;
}

function updateUI(){

    moneyDisplay.textContent =
    "$" + Math.floor(money);

    upgradeBtn.textContent =
    `Upgrade Coin ($${upgradeCost})`;

    updateCoinVisual();
}

coin.addEventListener("click",()=>{

    money += clickPower;

    createFloatingMoney(clickPower);

    updateUI();
});

upgradeBtn.addEventListener("click",()=>{

    if(money < upgradeCost) return;

    money -= upgradeCost;

    clickPower++;

    upgradeCost =
    Math.floor(upgradeCost * 1.5);

    coin.style.animation =
    "spin .6s";

    setTimeout(()=>{
        coin.style.animation = "";
    },600);

    updateUI();
});

setInterval(()=>{

    money += clickPower * 0.2;

    updateUI();

},1000);

document
.querySelectorAll(".tabBtn")
.forEach(button=>{

    button.addEventListener(
        "click",
        ()=>{

            document
            .querySelectorAll(".tab")
            .forEach(tab=>{

                tab.classList
                .remove("active");

            });

            document
            .getElementById(
                button.dataset.tab
            )
            .classList
            .add("active");

        }
    );

});

function saveGame(){

    localStorage.setItem(
        "cashClickerSave",
        JSON.stringify({

            money,
            clickPower,
            upgradeCost

        })
    );
}

function loadGame(){

    const save =
    JSON.parse(
        localStorage.getItem(
            "cashClickerSave"
        )
    );

    if(!save) return;

    money = save.money;
    clickPower = save.clickPower;
    upgradeCost = save.upgradeCost;
}

loadGame();
updateUI();

setInterval(saveGame,5000);

function createFloatingMoney(amount){

    const popup =
    document.createElement("div");

    popup.className =
    "floatingMoney";

    popup.textContent =
    "+" + amount;

    const rect =
    coin.getBoundingClientRect();

    const randomX =
    rect.left +
    Math.random() * rect.width;

    const randomY =
    rect.top +
    Math.random() * rect.height;

    popup.style.left =
    randomX + "px";

    popup.style.top =
    randomY + "px";

    document.body
    .appendChild(popup);

    setTimeout(()=>{

        popup.remove();

    },1000);

}

function spawnDollar(){

    const dollar =
    document.createElement("div");

    dollar.className =
    "dollar";

    dollar.textContent =
    "$";

    dollar.style.left =
    Math.random() * 100 + "vw";

    dollar.style.fontSize =
    (20 + Math.random()*40)
    + "px";

    dollar.style.animationDuration =
    (5 + Math.random()*8)
    + "s";

    document
    .getElementById("moneyRain")
    .appendChild(dollar);

    setTimeout(()=>{

        dollar.remove();

    },13000);

}

setInterval(spawnDollar,400);
