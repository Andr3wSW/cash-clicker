let money = 0;
let clickPower = 1;
let upgradeCost = 10;

const moneyDisplay = document.getElementById("money");
const clickPowerDisplay = document.getElementById("clickPower");
const upgradeBtn = document.getElementById("upgradeBtn");

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
