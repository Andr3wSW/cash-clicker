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

const casinoMenu = document.getElementById("casinoMenu");
const casinoGameView = document.getElementById("casinoGameView");
const gameContent = document.getElementById("gameContent");
const backCasino = document.getElementById("backCasino");

backCasino.onclick = ()=>{

    casinoGameView.style.display = "none";
    casinoMenu.style.display = "flex";

    gameContent.innerHTML = "";
};

document.querySelectorAll(".casinoSelect")
.forEach(btn=>{

    btn.onclick = ()=>{

        const game = btn.dataset.game;

        casinoMenu.style.display = "none";
        casinoGameView.style.display = "block";

        loadCasinoGame(game);
    };

});

function loadCasinoGame(game){

    gameContent.innerHTML = "";

    if(game === "coinflip"){

        gameContent.innerHTML = `
            <h1>Coin Flip</h1>

            <input id="coinBet" type="number" value="10">

            <br><br>

            <button id="flipHeads">Heads</button>
            <button id="flipTails">Tails</button>

            <p id="coinResult"></p>
        `;

        flipHeads.onclick = ()=>coinFlip("heads");
        flipTails.onclick = ()=>coinFlip("tails");
    }

    if(game === "dice"){

        gameContent.innerHTML = `
            <h1>Dice Roll</h1>

            <input id="diceBet" type="number" value="10">
            <br><br>

            <button id="rollDice">Roll</button>

            <p id="diceResult"></p>
        `;

        rollDice.onclick = ()=>{

            const bet = Number(diceBet.value);

            if(bet <= 0 || bet > money) return;

            money -= bet;

            const roll = Math.floor(Math.random()*6)+1;

            if(roll >= 5){
                money += bet * 3;
                diceResult.textContent = `WIN (${roll})`;
            } else {
                diceResult.textContent = `LOSE (${roll})`;
            }

            updateUI();
        };
    }

    if(game === "slots"){

        gameContent.innerHTML = `
            <h1>Slots</h1>

            <input id="slotBet" type="number" value="10">

            <br><br>

            <button id="spinSlots">Spin</button>

            <p id="slotResult"></p>
        `;

        spinSlots.onclick = ()=>{

            const bet = Number(slotBet.value);

            if(bet <= 0 || bet > money) return;

            money -= bet;

            const s = ["🍒","🍋","⭐","💎"];

            const a = s[Math.floor(Math.random()*4)];
            const b = s[Math.floor(Math.random()*4)];
            const c = s[Math.floor(Math.random()*4)];

            let payout = 0;

            if(a===b && b===c) payout = 10;
            else if(a===b || b===c) payout = 2;

            money += bet * payout;

            slotResult.textContent = `${a} ${b} ${c}`;

            updateUI();
        };
    }

    if(game === "blackjack"){

        gameContent.innerHTML = `
            <h1>Blackjack</h1>

            <input id="bjBet" type="number" value="10">

            <br><br>

            <button id="playBJ">Deal</button>

            <p id="bjResult"></p>
        `;

        playBJ.onclick = ()=>{

            const bet = Number(bjBet.value);

            if(bet <= 0 || bet > money) return;

            money -= bet;

            const player = Math.floor(Math.random()*11)+11;
            const dealer = Math.floor(Math.random()*11)+11;

            if(player > dealer){

                money += bet * 2;
                bjResult.textContent =
                `WIN P:${player} D:${dealer}`;

            } else {

                bjResult.textContent =
                `LOSE P:${player} D:${dealer}`;
            }

            updateUI();
        };
    }
}

function coinFlip(choice){

    const bet =
    Number(
        document
        .getElementById("coinBet")
        .value
    );

    if(bet <= 0 || bet > money)
        return;

    money -= bet;

    const result =
    Math.random() < .5
    ? "heads"
    : "tails";

    if(choice === result){

        money += bet * 2;

        document
        .getElementById(
            "coinResult"
        )
        .textContent =
        "You won!";
    }
    else{

        document
        .getElementById(
            "coinResult"
        )
        .textContent =
        "You lost!";
    }

    updateUI();
}

flipHeads.onclick =
()=>coinFlip("heads");

flipTails.onclick =
()=>coinFlip("tails");

rollDice.onclick = ()=>{

    const bet =
    Number(diceBet.value);

    if(bet > money || bet <= 0)
        return;

    money -= bet;

    const roll =
    Math.floor(
        Math.random()*6
    )+1;

    if(roll >= 5){

        money += bet * 3;

        diceResult.textContent =
        "Rolled " + roll +
        " - WIN";
    }
    else{

        diceResult.textContent =
        "Rolled " + roll +
        " - LOSS";
    }

    updateUI();
};

spinSlots.onclick = ()=>{

    const bet =
    Number(slotBet.value);

    if(bet > money || bet <= 0)
        return;

    money -= bet;

    const symbols =
    ["🍒","🍋","⭐","💎"];

    const a =
    symbols[
        Math.floor(
            Math.random()*4
        )
    ];

    const b =
    symbols[
        Math.floor(
            Math.random()*4
        )
    ];

    const c =
    symbols[
        Math.floor(
            Math.random()*4
        )
    ];

    let payout = 0;

    if(a===b && b===c)
        payout = 10;

    else if(a===b || b===c)
        payout = 2;

    money += bet * payout;

    slotResult.textContent =
    `${a} ${b} ${c}`;
    
    updateUI();
};

playBJ.onclick = ()=>{

    const bet =
    Number(bjBet.value);

    if(bet > money || bet <= 0)
        return;

    money -= bet;

    const player =
    Math.floor(
        Math.random()*11
    ) + 11;

    const dealer =
    Math.floor(
        Math.random()*11
    ) + 11;

    if(
        player > dealer ||
        dealer > 21
    ){

        money += bet * 2;

        bjResult.textContent =
        `You ${player} Dealer ${dealer} WIN`;
    }
    else{

        bjResult.textContent =
        `You ${player} Dealer ${dealer} LOSS`;
    }

    updateUI();
};
