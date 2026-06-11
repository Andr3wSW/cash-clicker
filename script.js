// =====================================
// CASH CLICKER
// =====================================

// =====================================
// FIREBASE
//======================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  initializeFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  limitToLast,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3UvML31jHXjZzk3ahE1AjasKK6vFFwoY",
  authDomain: "cash-68677.firebaseapp.com",
  projectId: "cash-68677",
  storageBucket: "cash-68677.firebasestorage.app",
  messagingSenderId: "782765971454",
  appId: "1:782765971454:web:a4a536229c904806fcd2af",
  measurementId: "G-GZ7W952Q1C"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true
});

let uid = null;
let username = "";
let saveDirty = false;
let loaded = false;

// =====================================
// BASE DATA
// =====================================

let money = 0;
let clickPower = 1;
let upgradeCost = 10;
let prestigeLevel = 0;
let achievements = {

    money100:false,
    money1000:false,
    money10000:false,
    money100000:false,

    copper5:false,
    silver5:false,
    gold5:false,
    diamond5:false,
    crypto5:false,

    prestige1:false,
    prestige5:false,
    prestige10:false

};

// =====================================
// BLACKJACK DATA
// =====================================

let blackjackBet = 0;
let playerHand = [];
let dealerHand = [];
let blackjackActive = false;

// =====================================
// UI REFERENCES
// =====================================

const moneyDisplay =
document.getElementById("money");

const sidebarMoney =
document.getElementById("sidebarMoney");

const coin =
document.getElementById("coin");

const coinTier =
document.getElementById("coinTier");

const upgradeBtn =
document.getElementById("upgradeBtn");

// =====================================
// COIN STAGES
// =====================================

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
    color1:"#d9fe54",
    color2:"#80f123"
}

];

// =====================================
// UI UPDATE
// =====================================

function updateCoinVisual(){

    const stage =
    Math.min(
        Math.floor((clickPower-1)/5),
        4
    );

    const tier =
    ((clickPower-1)%5)+1;

    const data =
    coinStages[stage];

    const multiplier =
    2 ** prestigeLevel;

    coin.textContent =
    data.symbol;

    coin.style.background =
    `linear-gradient(
        135deg,
        ${data.color1},
        ${data.color2}
    )`;

    coinTier.textContent =
    `${data.name} Tier ${tier}
    x${multiplier}`
}

function updateUI(){

    const displayMoney =
    "$" +
    Math.floor(money);

    moneyDisplay.textContent =
    displayMoney;

    sidebarMoney.textContent =
    displayMoney;

    if(clickPower >= 25){

        upgradeBtn.textContent =
        "⭐ PRESTIGE";

    }else{

        upgradeBtn.textContent =
        `Upgrade Coin ($${upgradeCost})`;

    }

    updateCoinVisual();
    checkAchievements();
    updateAchievementList();

    saveDirty = true;
}

// =====================================
// FLOATING MONEY
// =====================================

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
    (
        rect.left +
        Math.random()*rect.width
    ) + "px";

    popup.style.top =
    (
        rect.top +
        Math.random()*rect.height
    ) + "px";

    document.body
    .appendChild(popup);

    setTimeout(()=>{

        popup.remove();

    },1000);
}

// =====================================
// CLICKING
// =====================================

coin.addEventListener(
    "click",
    ()=>{

        const amount =
        clickPower * (2 ** prestigeLevel);

        money += amount;

        createFloatingMoney(
            amount
        );

        updateUI();

    }
);

upgradeBtn.addEventListener(
    "click",
    ()=>{

        if(clickPower >= 25){

            prestige();

            return;
        }

        if(
            money < upgradeCost
        ) return;

        money -= upgradeCost;

        clickPower++;

        upgradeCost =
        Math.floor(
            upgradeCost * 1.5
        );

        coin.style.animation =
        "spin .6s";

        setTimeout(()=>{

            coin.style.animation =
            "";

        },600);

        updateUI();

    }
);

// =====================================
// SAVE SYSTEM
// =====================================

async function saveToCloud(){

    if(!uid || !loaded) return;

    saveDirty = false;

    try{

        await setDoc(doc(db, "players", uid), {

            money: blackjackActive ? money + blackjackBet : money,
            username,
            clickPower,
            upgradeCost,
            prestigeLevel,
            achievements

        });

    }catch(e){
        saveDirty = true;
        console.error("Save failed", e);
    }

}

async function loadCloudSave(){

    const ref = doc(db, "players", uid);
    const snap = await getDoc(ref);

    if(snap.exists()){

        const data = snap.data();

        money = Math.max(0, Number(data.money) || 0);
        clickPower = Math.min(Math.max(Math.floor(Number(data.clickPower) || 1), 1), 25);
        upgradeCost = Math.max(10, Number(data.upgradeCost) || 10);
        prestigeLevel = Math.max(0, Math.floor(Number(data.prestigeLevel) || 0));

        if(typeof data.username === "string" && data.username.trim()){
            username = data.username.trim();
        }

        if(data.achievements){
            achievements = {
                ...achievements,
                ...data.achievements
            };
        }

    }

    if(!username) username = "Player";

    loaded = true;

    if(!snap.exists()) await saveToCloud();

    updateAccountPage();

    document.getElementById("userDisplay").textContent =
        username;

    updateUI();

    saveDirty = false;

}

function logout(){
    signOut(auth);
    location.reload();
}
// =====================================
// MONEY RAIN
// =====================================

function spawnDollar(){

    const dollar =
    document.createElement(
        "div"
    );

    dollar.className =
    "dollar";

    dollar.textContent =
    "$";

    dollar.style.left =
    Math.random()*100 +
    "vw";

    dollar.style.fontSize =
    (
        20 +
        Math.random()*40
    ) + "px";

    dollar.style.animationDuration =
    (
        5 +
        Math.random()*8
    ) + "s";

    document
    .getElementById(
        "moneyRain"
    )
    .appendChild(
        dollar
    );

    setTimeout(()=>{

        dollar.remove();

    },13000);
}

setInterval(
    spawnDollar,
    400
);

setInterval(()=>{

    if(saveDirty) saveToCloud();

},15000);

document.addEventListener(
    "visibilitychange",
    ()=>{

        if(
            document.visibilityState === "hidden" &&
            saveDirty
        ) saveToCloud();

    }
);

// =====================================
// TABS
// =====================================

document
.querySelectorAll(".tabBtn")
.forEach(button=>{

    button.addEventListener(
        "click",
        ()=>{

            document
            .querySelectorAll(".tab")
            .forEach(tab=>{

                tab.classList.remove(
                    "active"
                );

            });

            document
            .getElementById(
                button.dataset.tab
            )
            .classList.add(
                "active"
            );

            if(button.dataset.tab === "leaderboards"){

                loadLeaderboard();

            }

        }
    );

});

// =====================================
// CASINO NAVIGATION
// =====================================

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
.querySelectorAll(
    ".casinoCard"
)
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
.getElementById(
    "backCasino"
)
.addEventListener(
    "click",
    ()=>{

        casinoGameView.style.display =
        "none";

        casinoMenu.style.display =
        "block";

    }
);

// =====================================
// GAME LOADER
// =====================================

function openGame(game){

    settleBlackjack();

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

// =====================================
// RESULT HELPER
// =====================================

function resultEl(text){

    const result =
    document.getElementById(
        "result"
    );

    if(result){

        result.textContent =
        text;

    }

}

// =====================================
// COIN FLIP
// =====================================

function loadCoinFlip(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Coin Flip</h1>

        <input id="bet" class="betInput" type="number" value="10">

        <div id="flipCoin" class="flipCoin"></div>

        <button class="playBtn" id="headsBtn">Heads</button>
        <button class="playBtn" id="tailsBtn">Tails</button>

        <p id="result"></p>

    </div>

    `;

    const coin = document.getElementById("flipCoin");
    const result = document.getElementById("result");

    function setHeads(){
        coin.className = "headsCoin";
        coin.innerHTML = " ";
    }

    function setTails(){
        coin.className = "tailsCoin";
        coin.innerHTML = " ";
    }

    setHeads();

    document.getElementById("headsBtn").onclick =
    () => playCoinFlip("heads", coin, result, setHeads, setTails);

    document.getElementById("tailsBtn").onclick =
    () => playCoinFlip("tails", coin, result, setHeads, setTails);
}

function playCoinFlip(choice, coin, resultEl, setHeads, setTails){

    const betInput = document.getElementById("bet");
    const betAmount = Math.floor(Number(betInput.value));

    if(!Number.isFinite(betAmount) || betAmount <= 0 || betAmount > money){
        showBetError("Enter a valid bet you can afford");
        return;
    }

    money -= betAmount;

    updateUI();

    document.getElementById("headsBtn").disabled = true;
    document.getElementById("tailsBtn").disabled = true;

    coin.classList.add("flipAnimation");

    setTimeout(() => {

        coin.classList.remove("flipAnimation");

        const result = Math.random() < 0.5 ? "heads" : "tails";

        if(result === "heads") setHeads();
        else setTails();

        if(choice === result){

            money += betAmount * 2;

            resultEl.textContent = `WIN! (${result})`;

            winAnimation();

        } else {

            resultEl.textContent = `LOSS! (${result})`;
        }

        updateUI();

        const headsBtn = document.getElementById("headsBtn");
        const tailsBtn = document.getElementById("tailsBtn");

        if(headsBtn) headsBtn.disabled = false;
        if(tailsBtn) tailsBtn.disabled = false;

    }, 900);
}

// =====================================
// DICE
// =====================================

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

    document
    .getElementById(
        "rollBtn"
    )
    .onclick =
    playDice;

}

let diceRolling = false;

function playDice(){

    if(diceRolling) return;

    const bet =
    Math.floor(Number(
        document
        .getElementById(
            "bet"
        ).value
    ));

    if(!Number.isFinite(bet) || bet <= 0 || bet > money){
        showBetError("Enter a valid bet you can afford");
        return;
    }

    diceRolling = true;

    money -= bet;

    updateUI();

    const dice =
    document
    .getElementById(
        "dice"
    );

    dice.classList.add(
        "rollAnimation"
    );

    let spins = 0;

    const rollInterval =
    setInterval(()=>{

        dice.textContent =
        Math.floor(
            Math.random()*6
        ) + 1;

        spins++;

        if(spins > 12){

            clearInterval(
                rollInterval
            );

            finishDice(
                bet,
                dice
            );

        }

    },70);

}

function finishDice(
    bet,
    dice
){

    dice.classList.remove(
        "rollAnimation"
    );

    const roll =
    Math.floor(
        Math.random()*6
    ) + 1;

    dice.textContent =
    roll;

    diceRolling = false;

    if(roll >= 5){

        money +=
        bet * 3;

        resultEl(
            `WIN (${roll})`
        );

        winAnimation();

    }
    else{

        resultEl(
            `LOSS (${roll})`
        );

    }

    updateUI();

}

// =====================================
// SLOTS
// =====================================

function loadSlots(){

    gameContent.innerHTML = `

    <div class="gamePanel">

        <h1>Slots</h1>

        <input
        id="bet"
        class="betInput"
        type="number"
        value="10">

        <div class="slotMachine">

            <div class="slot" id="s1">❔</div>
            <div class="slot" id="s2">❔</div>
            <div class="slot" id="s3">❔</div>

        </div>

        <button class="playBtn" id="spinBtn">
            Spin
        </button>

        <p id="result"></p>

    </div>

    `;

    document
    .getElementById("spinBtn")
    .onclick =
    playSlots;

}

let slotsSpinning = false;

function playSlots(){

    if(slotsSpinning) return;

    const bet =
    Math.floor(Number(
        document
        .getElementById("bet")
        .value
    ));

    if(!Number.isFinite(bet) || bet <= 0 || bet > money){
        showBetError("Enter a valid bet you can afford");
        return;
    }

    slotsSpinning = true;

    money -= bet;

    updateUI();

    const symbols =
    ["🍒","🍋","⭐","💎","7️⃣"];

    const s1 =
    document.getElementById("s1");

    const s2 =
    document.getElementById("s2");

    const s3 =
    document.getElementById("s3");

    let spins = 0;

    const interval =
    setInterval(()=>{

        s1.textContent =
        symbols[Math.floor(Math.random()*symbols.length)];

        s2.textContent =
        symbols[Math.floor(Math.random()*symbols.length)];

        s3.textContent =
        symbols[Math.floor(Math.random()*symbols.length)];

        spins++;

        if(spins > 18){

            clearInterval(interval);

            finishSlots(bet);

        }

    },80);

}

function finishSlots(bet){

    const symbols =
    ["🍒","🍋","⭐","💎","7️⃣"];

    const a =
    symbols[Math.floor(Math.random()*symbols.length)];

    const b =
    symbols[Math.floor(Math.random()*symbols.length)];

    const c =
    symbols[Math.floor(Math.random()*symbols.length)];

    document.getElementById("s1").textContent = a;
    document.getElementById("s2").textContent = b;
    document.getElementById("s3").textContent = c;

    slotsSpinning = false;

    let payout = 0;

    if(a === b && b === c)
        payout = 10;

    else if(a === b || b === c || a === c)
        payout = 1;

    money += bet * payout;

    resultEl(
        payout > 1
        ? `WIN x${payout}`
        : payout === 1
        ? "PAIR - Bet Returned"
        : "LOSS"
    );

    updateUI();

}

// =====================================
// BLACKJACK (FULL GAME)
// =====================================

let deck = [];
let standMode = false;

// create deck
function createDeck(){

    const suits = ["♠","♥","♦","♣"];
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

    deck = [];

    for(let s of suits){
        for(let v of values){
            deck.push(v + s);
        }
    }

    for(let i = deck.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

}

function cardValue(card){

    const value = card.slice(0,-1);

    if(value === "A") return 11;
    if(["J","Q","K"].includes(value)) return 10;

    return Number(value);

}

function handTotal(hand){

    let total = 0;
    let aces = 0;

    for(let c of hand){

        const v = c.slice(0,-1);

        if(v === "A"){
            aces++;
            total += 11;
        }
        else if(["J","Q","K"].includes(v)){
            total += 10;
        }
        else{
            total += Number(v);
        }

    }

    while(total > 21 && aces > 0){
        total -= 10;
        aces--;
    }

    return total;

}

function loadBlackjack(){

    gameContent.innerHTML = `

    <div class="gamePanel blackjackBoard">

        <h1>Blackjack</h1>

        <input id="bet" class="betInput" type="number" value="10">

        <div>
            <div class="handTitle">Dealer</div>
            <div id="dealerCards" class="cardArea"></div>
        </div>

        <div>
            <div class="handTitle">You</div>
            <div id="playerCards" class="cardArea"></div>
        </div>

        <div>

            <button class="playBtn" id="dealBtn">Deal</button>
            <button class="playBtn" id="hitBtn">Hit</button>
            <button class="playBtn" id="standBtn">Stand</button>

        </div>

        <p id="result"></p>

    </div>

    `;

    document.getElementById("dealBtn").onclick = startBlackjack;
    document.getElementById("hitBtn").onclick = hit;
    document.getElementById("standBtn").onclick = stand;

}

function startBlackjack(){

    if(blackjackActive) return;

    const bet =
    Math.floor(Number(document.getElementById("bet").value));

    if(!Number.isFinite(bet) || bet <= 0 || bet > money){
        showBetError("Enter a valid bet you can afford");
        return;
    }

    blackjackBet = bet;

    money -= bet;

    createDeck();

    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];

    standMode = false;
    blackjackActive = true;

    resultEl("");

    updateUI();

    renderBlackjack(true);

}

function renderBlackjack(hideDealerCard = true){

    const dealerDiv =
    document.getElementById("dealerCards");

    const playerDiv =
    document.getElementById("playerCards");

    dealerDiv.innerHTML = "";
    playerDiv.innerHTML = "";

    dealerHand.forEach((card, i)=>{

        const div = document.createElement("div");
        div.className = "card";

        if(i === 1 && hideDealerCard && !standMode){
            div.textContent = "❓";
            div.classList.add("hiddenCard");
        } else {
            div.textContent = card;
        }

        dealerDiv.appendChild(div);

    });

    playerHand.forEach(card=>{

        const div = document.createElement("div");
        div.className = "card";
        div.textContent = card;

        playerDiv.appendChild(div);

    });

}

function hit(){

    if(!blackjackActive) return;

    playerHand.push(deck.pop());

    const total = handTotal(playerHand);

    if(total > 21){

        blackjackActive = false;
        standMode = true;

        renderBlackjack(false);

        resultEl(`BUST - You Lose (${total})`);

        updateUI();

        return;
    }

    renderBlackjack(true);

}

function stand(){

    if(!blackjackActive) return;

    blackjackActive = false;
    standMode = true;

    while(handTotal(dealerHand) < 17){
        dealerHand.push(deck.pop());
    }

    renderBlackjack(false);

    resolveBlackjack();

}

function settleBlackjack(){

    if(!blackjackActive) return;

    blackjackActive = false;
    standMode = true;

    while(handTotal(dealerHand) < 17){
        dealerHand.push(deck.pop());
    }

    resolveBlackjack();

}

function resolveBlackjack(){

    const player = handTotal(playerHand);
    const dealer = handTotal(dealerHand);

    if(player > 21){

        resultEl("BUST - Dealer Wins");

    }
    else if(dealer > 21 || player > dealer){

        money += blackjackBet * 2;
        resultEl(`YOU WIN (${player} vs ${dealer})`);

        winAnimation();

    }
    else if(player === dealer){

        money += blackjackBet;
        resultEl("PUSH");

    }
    else{

        resultEl(`YOU LOSE (${player} vs ${dealer})`);

    }

    updateUI();

}

// =====================================
// START GAME
// =====================================

updateUI();

const emailInput = document.getElementById("email");
const passInput = document.getElementById("password");


const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const authBox = document.getElementById("authBox");
const status = document.getElementById("authStatus");

let authBusy = false;

registerBtn.onclick = async () => {

    if(authBusy) return;

    const name = document.getElementById("username").value.trim();

    if(name.length < 3 || name.length > 16){
        status.textContent = "Username must be 3 to 16 characters";
        return;
    }

    authBusy = true;

    try {

        username = name;

        await createUserWithEmailAndPassword(
            auth,
            emailInput.value,
            passInput.value
        );

        status.textContent = "Account created!";

    } catch (e) {
        username = "";
        status.textContent = e.message;
    }

    authBusy = false;

};

loginBtn.onclick = async () => {

    if(authBusy) return;

    authBusy = true;

    try {

        await signInWithEmailAndPassword(
            auth,
            emailInput.value,
            passInput.value
        );

        status.textContent = "Logged in!";

    } catch (e) {

        status.textContent = e.message;

    }

    authBusy = false;

};

onAuthStateChanged(auth, async (user) => {

    if(!user) return;

    uid = user.uid;

    status.textContent = "Loading your save...";

    for(let attempt = 1; attempt <= 3; attempt++){

        try{

            await loadCloudSave();

            status.textContent = "";

            authBox.style.display = "none";

            subscribeChat();

            return;

        }catch(e){

            console.error(`Load failed (attempt ${attempt})`, e);

            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));

        }

    }

    status.textContent = "Could not load your save. Check your connection and refresh the page.";

});

function winAnimation(){

    const panel =
    document.querySelector(".gamePanel");

    if(!panel) return;

    panel.classList.add("winFlash");

    setTimeout(()=>{
        panel.classList.remove("winFlash");
    },600);

}

function showBetError(msg){

    let el = document.getElementById("betMessage");

    if(!el){
        el = document.createElement("div");
        el.id = "betMessage";
        document.querySelector(".gamePanel").appendChild(el);
    }

    el.textContent = msg;

    setTimeout(()=>{
        el.textContent = "";
    },2000);

}

// =====================================
// LEADERBOARD
// =====================================

async function loadLeaderboard(){

    const leaderboard =
    document.getElementById(
        "leaderboardList"
    );

    leaderboard.innerHTML =
    "Loading...";

    try{

        const q = query(
            collection(db,"players"),
            orderBy("money","desc"),
            limit(50)
        );

        const snapshot =
        await getDocs(q);

        let html = "";

        let rank = 1;

        snapshot.forEach(doc=>{

            const data =
            doc.data();

            const safeName =
            String(data.username || "Unknown").replace(/[<>&"]/g, "");

            html += `

            <div class="leaderboardEntry">

                <span>
                    #${rank}
                </span>

                <span>
                    ${safeName}
                </span>

                <span>
                    $${Math.floor(Number(data.money) || 0)}
                </span>

            </div>

            `;

            rank++;

        });

        leaderboard.innerHTML = html || "No players yet";

    }catch(e){

        console.error("Leaderboard failed", e);

        leaderboard.textContent = "Could not load the leaderboard. Try again.";

    }
}

document
.getElementById("usernameChangeBtn")
.onclick = async ()=>{

    const changeStatus =
    document.getElementById("usernameChangeStatus");

    const name =
    document.getElementById("usernameChange").value.trim();

    if(name.length < 3 || name.length > 16){
        changeStatus.textContent = "Username must be 3 to 16 characters";
        return;
    }

    if(!loaded){
        changeStatus.textContent = "Wait for your save to load first";
        return;
    }

    username = name;

    await saveToCloud();

    updateAccountPage();

    document.getElementById("userDisplay").textContent = username;

    document.getElementById("usernameChange").value = "";

    changeStatus.textContent = saveDirty
        ? "Saved locally, will retry syncing shortly"
        : "Username updated!";

    setTimeout(()=>{
        changeStatus.textContent = "";
    },3000);

};

document
.getElementById("signOutBtn")
.onclick = async ()=>{

    if(saveDirty) await saveToCloud();

    await signOut(auth);

    location.reload();

};

function checkAchievements(){

    if(money >= 100)
        unlockAchievement(
            "money100",
            "First Hundred"
        );

    if(money >= 1000)
        unlockAchievement(
            "money1000",
            "Thousandaire"
        );

    if(money >= 10000)
        unlockAchievement(
            "money10000",
            "Big Money"
        );

    if(money >= 100000)
        unlockAchievement(
            "money100000",
            "Cash King"
        );

    if(clickPower >= 5)
        unlockAchievement(
            "copper5",
            "Copper Master"
        );

    if(clickPower >= 10)
        unlockAchievement(
            "silver5",
            "Silver Master"
        );

    if(clickPower >= 15)
        unlockAchievement(
            "gold5",
            "Gold Master"
        );

    if(clickPower >= 20)
        unlockAchievement(
            "diamond5",
            "Diamond Master"
        );

    if(clickPower >= 25)
        unlockAchievement(
            "crypto5",
            "Crypto Master"
        );

    if(prestigeLevel >= 1)
        unlockAchievement(
            "prestige1",
            "First Prestige"
        );

    if(prestigeLevel >= 5)
        unlockAchievement(
            "prestige5",
            "Prestige V"
        );

    if(prestigeLevel >= 10)
        unlockAchievement(
            "prestige10",
            "Prestige X"
        );
}

function updateAccountPage(){

    document.getElementById(
        "accountUsername"
    ).textContent =
    username || "Player";

    document.getElementById(
        "accountEmail"
    ).textContent =
    auth.currentUser ? auth.currentUser.email : "";

    document.getElementById(
        "prestigeDisplay"
    )
    .textContent =
    `Prestige ${prestigeLevel} (x${2 ** prestigeLevel} earnings)`;
}

function prestige(){

    prestigeLevel++;

    clickPower = 1;
    upgradeCost = 10;

    updateUI();
    updateAccountPage();

    showAchievementPopup(
        `⭐ Prestige ${prestigeLevel}`
    );

    saveToCloud();
}

function showAchievementPopup(text){

    const popup =
    document.createElement("div");

    popup.className =
    "achievementPopup";

    popup.textContent =
    "🏆 " + text;

    document.body.appendChild(
        popup
    );

    setTimeout(()=>{

        popup.remove();

    },3000);

}

function unlockAchievement(
    key,
    title
){

    if(
        achievements[key]
    )
        return;

    achievements[key] =
    true;

    saveDirty = true;

    showAchievementPopup(
        title
    );
}

function updateAchievementList(){

    const list =
    document.getElementById(
        "achievementList"
    );

    if(!list)
        return;

    list.innerHTML = "";

    const names = {

        money100:"First Hundred",
        money1000:"Thousandaire",
        money10000:"Big Money",
        money100000:"Cash King",

        copper5:"Copper Master",
        silver5:"Silver Master",
        gold5:"Gold Master",
        diamond5:"Diamond Master",
        crypto5:"Crypto Master",

        prestige1:"First Prestige",
        prestige5:"Prestige V",
        prestige10:"Prestige X"

    };

    for(
        const key in names
    ){

        const div =
        document.createElement(
            "div"
        );

        div.className =
        achievements[key]
        ? "achievement unlocked"
        : "achievement locked";

        div.textContent =
        names[key];

        list.appendChild(div);
    }
}

let chatSubscribed = false;

function subscribeChat(){

    if(chatSubscribed) return;

    chatSubscribed = true;

    const chatQuery = query(
        collection(db,"chat"),
        orderBy("timestamp","asc"),
        limitToLast(100)
    );

    onSnapshot(
    chatQuery,
    (snapshot)=>{

        const chatBox =
        document.getElementById("chatMessages");

        if(!chatBox) return;

        chatBox.innerHTML = "";

        snapshot.forEach(docSnap=>{

            const data = docSnap.data();

            const row =
            document.createElement("div");

            row.className = "chatMessage";

            const name =
            document.createElement("span");

            name.className = "chatUsername";

            name.textContent =
            String(data.username || "Unknown");

            row.appendChild(name);

            row.appendChild(
                document.createTextNode(
                    ": " + String(data.message || "")
                )
            );

            chatBox.appendChild(row);

        });

        chatBox.scrollTop = chatBox.scrollHeight;

    },
    (error)=>{

        console.error("Chat failed", error);

        chatSubscribed = false;

        const chatBox =
        document.getElementById("chatMessages");

        if(chatBox){
            chatBox.textContent =
            "Could not load chat. Refresh to try again.";
        }

    }
    );

}

let lastChatSend = 0;
let chatSending = false;

async function sendChatMessage(){

    const input =
    document.getElementById("chatInput");

    if(!input) return;

    if(!uid || !loaded) return;

    if(chatSending) return;

    const message =
    input.value.trim().slice(0, 200);

    if(message === "") return;

    if(Date.now() - lastChatSend < 1500) return;

    chatSending = true;

    try{

        await addDoc(collection(db,"chat"),{
            username,
            message,
            timestamp: serverTimestamp()
        });

        lastChatSend = Date.now();

        input.value = "";

    }catch(e){

        console.error("Chat send failed", e);

        showAchievementPopup(
            "Message failed to send"
        );

    }

    chatSending = false;

}

document
.getElementById("sendChatBtn")
.onclick = sendChatMessage;

document
.getElementById("chatInput")
.addEventListener(
    "keydown",
    (e)=>{

        if(e.key === "Enter"){

            sendChatMessage();

        }

    }
);