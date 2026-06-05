let money = 0;
let clickPower = 1;
let upgradeCost = 10;

const moneyDisplay = document.getElementById("money");
const clickPowerDisplay = document.getElementById("clickPower");
const upgradeBtn = document.getElementById("upgradeBtn");
const coinStages = [

{
    name:"Copper",
    color1:"#c97b3b",
    color2:"#a65b1d",
    symbol:"¢"
},

{
    name:"Silver",
    color1:"#d9d9d9",
    color2:"#9e9e9e",
    symbol:"S"
},

{
    name:"Gold",
    color1:"#ffd54f",
    color2:"#ffb300",
    symbol:"$"
},

{
    name:"Diamond",
    color1:"#80deea",
    color2:"#26c6da",
    symbol:"♦"
},

{
    name:"Crypto",
    color1:"#8e24aa",
    color2:"#4a148c",
    symbol:"₿"
}

];

function updateUI(){
    moneyDisplay.textContent = "$" + Math.floor(money);
    clickPowerDisplay.textContent = clickPower;
    upgradeBtn.textContent =
        `Better Finger ($${upgradeCost})`;
}

document
.getElementById("coin")
.addEventListener("click", () => {
    money += clickPower;
    updateUI();

    const coin =
document.getElementById("coin");

coin.style.transform =
"scale(0.9)";

setTimeout(()=>{
    coin.style.transform =
    "scale(1)";
},100);
});

upgradeBtn.addEventListener("click", () => {

    if(money >= upgradeCost){

        money -= upgradeCost;

        clickPower++;

        upgradeCost = Math.floor(
            upgradeCost * 1.5
        );

        coin.style.animation =
        "coinSpin .6s";

        setTimeout(()=>{
            coin.style.animation = "";
        },600);

        updateUI();
    }
});

setInterval(() => {

    money += clickPower * 0.2;

    updateUI();

},1000);

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

    if(save){
        money = save.money;
        clickPower = save.clickPower;
        upgradeCost = save.upgradeCost;
    }

    updateUI();
}

setInterval(saveGame,5000);

loadGame();

const tabButtons =
document.querySelectorAll(".tabBtn");

const tabs =
document.querySelectorAll(".tab");

tabButtons.forEach(button=>{

    button.addEventListener("click",()=>{

        tabs.forEach(tab=>{
            tab.classList.remove("active");
        });

        document
        .getElementById(
            button.dataset.tab
        )
        .classList.add("active");

    });

});

function updateCoinVisual(){

    const level = clickPower;

    const stage =
    Math.min(
        Math.floor((level-1)/5),
        4
    );

    const tier =
    ((level-1)%5)+1;

    const coinData =
    coinStages[stage];

    coin.innerHTML =
    coinData.symbol;

    coin.style.background =
    `linear-gradient(
        135deg,
        ${coinData.color1},
        ${coinData.color2}
    )`;

    document
    .getElementById("coinTier")
    .textContent =
    `${coinData.name} Tier ${tier}`;
}

updateCoinVisual();
