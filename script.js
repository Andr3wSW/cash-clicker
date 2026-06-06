// ======================
// GAME DATA
// ======================

let money = 0;
let clickPower = 1;
let upgradeCost = 10;

// ======================
// CLICKER
// ======================

const moneyDisplay = document.getElementById("money");
const coin = document.getElementById("coin");
const coinTier = document.getElementById("coinTier");
const upgradeBtn = document.getElementById("upgradeBtn");

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

// ======================
// UI
// ======================

function updateCoinVisual(){

    const stage = Math.min(
        Math.floor((clickPower-1)/5),
        4
    );

    const tier =
    ((clickPower-1)%5)+1;

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

// ======================
// FLOATING MONEY
// ======================

function createFloatingMoney(amount){

    const popup =
    document.createElement("div");

    popup.className =
    "floatingMoney";

    popup.textContent =
    "+" + amount;

    const rect =
    coin.getBoundingClientRect();

    popup.style.left =
    (rect.left +
    Math.random()*rect.width)
    + "px";

    popup.style.top =
    (rect.top +
    Math.random()*rect.height)
    + "px";

    document.body
    .appendChild(popup);

    setTimeout(()=>{
        popup.remove();
    },1000);
}

// ======================
// CLICKING
// ======================

coin.addEventListener("click",()=>{

    money += clickPower;

    createFloatingMoney(clickPower);

    updateUI();
});

upgradeBtn.addEventListener("click",()=>{

    if(money < upgradeCost)
        return;

    money -= upgradeCost;

    clickPower++;

    upgradeCost =
    Math.floor(
        upgradeCost*1.5
    );

    coin.style.animation =
    "spin .6s";

    setTimeout(()=>{
        coin.style.animation="";
    },600);

    updateUI();
});

// ======================
// PASSIVE MONEY
// ======================

setInterval(()=>{

    money += clickPower*0.2;

    updateUI();

},1000);

// ======================
// SAVE
// ======================

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

setInterval(saveGame,5000);

// ======================
// MONEY RAIN
// ======================

function spawnDollar(){

    const dollar =
    document.createElement("div");

    dollar.className =
    "dollar";

    dollar.textContent =
    "$";

    dollar.style.left =
    Math.random()*100 +
    "vw";

    dollar.style.fontSize =
    (20+Math.random()*40)
    + "px";

    dollar.style.animationDuration =
    (5+Math.random()*8)
    + "s";

    document
    .getElementById("moneyRain")
    .appendChild(dollar);

    setTimeout(()=>{
        dollar.remove();
    },13000);
}

setInterval(
    spawnDollar,
    400
);

// ======================
// TABS
// ======================

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

// ======================
// CASINO NAVIGATION
// ======================

const casinoMenu =
document.getElementById(
    "casinoMenu"
);

const casinoGameView =
document.getElementById(
    "casinoGameView"
);

const gameContent =
document.getElementById(
    "gameContent"
);

document
.querySelectorAll(".casinoCard")
.forEach(card=>{

    card.addEventListener(
        "click",
        ()=>{

            openGame(
                card.dataset.game
            );

        }
    );

});

document
.getElementById("backCasino")
.addEventListener(
    "click",
    ()=>{

        casinoGameView.style.display =
        "none";

        casinoMenu.style.display =
        "block";

    }
);

// ======================
// GAME LOADER
// ======================

function openGame(game){

    casinoMenu.style.display =
    "none";

    casinoGameView.style.display =
    "block";

    if(game==="coinflip")
        loadCoinFlip();

    if(game==="dice")
        loadDice();

    if(game==="slots")
        loadSlots();

    if(game==="blackjack")
        loadBlackjack();
}

// ======================
// COIN FLIP
// ======================

function loadCoinFlip(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Coin Flip</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div
        id="flipCoin"
        class="flipCoin">

        🪙

        </div>

        <button
        class="playBtn"
        id="headsBtn">

        Heads

        </button>

        <button
        class="playBtn"
        id="tailsBtn">

        Tails

        </button>

        <p id="result"></p>

    </div>
    `;

    headsBtn.onclick =
    ()=>playCoinFlip("heads");

    tailsBtn.onclick =
    ()=>playCoinFlip("tails");
}

function playCoinFlip(choice){

    const bet =
    Number(bet.value);

    if(bet<=0 || bet>money)
        return;

    const coinEl =
    document.getElementById(
        "flipCoin"
    );

    coinEl.classList.add(
        "flipAnimation"
    );

    setTimeout(()=>{

        coinEl.classList.remove(
            "flipAnimation"
        );

        const result =
        Math.random()<.5
        ? "heads"
        : "tails";

        money -= bet;

        if(choice===result){

            money +=
            bet*2;

            resultEl(
                `You Won! (${result})`
            );

        }else{

            resultEl(
                `You Lost! (${result})`
            );
        }

        updateUI();

    },1000);
}

// ======================
// DICE
// ======================

function loadDice(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Dice Roll</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div
        id="dice"
        class="diceBox">

        🎲

        </div>

        <button
        class="playBtn"
        id="rollBtn">

        Roll

        </button>

        <p id="result"></p>

    </div>
    `;

    rollBtn.onclick =
    playDice;
}

function playDice(){

    const bet =
    Number(
        document
        .getElementById("bet")
        .value
    );

    if(bet<=0 || bet>money)
        return;

    const dice =
    document
    .getElementById("dice");

    dice.classList.add(
        "rollAnimation"
    );

    setTimeout(()=>{

        dice.classList.remove(
            "rollAnimation"
        );

        const roll =
        Math.floor(
            Math.random()*6
        )+1;

        dice.textContent =
        roll;

        money -= bet;

        if(roll>=5){

            money += bet*3;

            resultEl(
                `WIN (${roll})`
            );

        }else{

            resultEl(
                `LOSS (${roll})`
            );
        }

        updateUI();

    },800);
}

// ======================
// SLOTS
// ======================

function loadSlots(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Slots</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div
        class="slotMachine">

            <div class="slot" id="s1">❔</div>
            <div class="slot" id="s2">❔</div>
            <div class="slot" id="s3">❔</div>

        </div>

        <button
        class="playBtn"
        id="spinBtn">

        Spin

        </button>

        <p id="result"></p>

    </div>
    `;

    spinBtn.onclick =
    playSlots;
}

function playSlots(){

    const bet =
    Number(
        document
        .getElementById("bet")
        .value
    );

    if(bet<=0 || bet>money)
        return;

    const symbols =
    ["🍒","🍋","⭐","💎"];

    [s1,s2,s3]
    .forEach(slot=>{

        slot.classList.add(
            "slotSpin"
        );

    });

    setTimeout(()=>{

        [s1,s2,s3]
        .forEach(slot=>{

            slot.classList.remove(
                "slotSpin"
            );

        });

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

        s1.textContent=a;
        s2.textContent=b;
        s3.textContent=c;

        money -= bet;

        let payout=0;

        if(a===b&&b===c)
            payout=10;

        else if(
            a===b||
            b===c
        )
            payout=2;

        money +=
        bet*payout;

        resultEl(
            payout>0
            ? `WIN x${payout}`
            : "LOSS"
        );

        updateUI();

    },700);
}

// ======================
// BLACKJACK
// ======================

function loadBlackjack(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Blackjack</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div
        class="cardArea"
        id="cards">

        </div>

        <button
        class="playBtn"
        id="dealBtn">

        Deal

        </button>

        <p id="result"></p>

    </div>
    `;

    dealBtn.onclick =
    playBlackjack;
}

function playBlackjack(){

    const bet =
    Number(
        document
        .getElementById("bet")
        .value
    );

    if(bet<=0 || bet>money)
        return;

    const cards =
    document.getElementById(
        "cards"
    );

    cards.innerHTML="";

    const cardValues =
    ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

    const p1 =
    cardValues[
        Math.floor(
            Math.random()*13
        )
    ];

    const p2 =
    cardValues[
        Math.floor(
            Math.random()*13
        )
    ];

    const d1 =
    cardValues[
        Math.floor(
            Math.random()*13
        )
    ];

    const d2 =
    cardValues[
        Math.floor(
            Math.random()*13
        )
    ];

    [p1,p2,d1,d2]
    .forEach(card=>{

        const div =
        document.createElement(
            "div"
        );

        div.className =
        "card";

        div.textContent =
        card;

        cards.appendChild(div);

    });

    const player =
    Math.floor(
        Math.random()*11
    )+11;

    const dealer =
    Math.floor(
        Math.random()*11
    )+11;

    money -= bet;

    if(
        player>dealer ||
        dealer>21
    ){

        money += bet*2;

        resultEl(
            `WIN (${player} vs ${dealer})`
        );

    }else{

        resultEl(
            `LOSS (${player} vs ${dealer})`
        );
    }

    updateUI();
}

// ======================
// HELPER
// ======================

function resultEl(text){

    document
    .getElementById("result")
    .textContent = text;
}

// ======================

loadGame();
updateUI();
