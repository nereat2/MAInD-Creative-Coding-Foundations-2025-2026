// const API_key = 'live_RCGXuhOXH9u3QCHNh5V4XA9uAGkyZU5onO64ksjgdPeTUU1VpV09xZn9lwFdLLG5' 
const API = `https://api.thecatapi.com/v1/images/search?limit=22&api_key=${API_key}`


fetch(API)  
    .then((response) => response.json())
    .then((cats) => buildGrid(cats))


// game settings

// board 6 x 5 = 30 tiles
const BOARD_COLUMNS = 6;
const BOARD_ROWS =  5;
const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;

const START_LIVES = 3;          
const BASE_ROUND_SECONDS = 3;   
const WIN_POINTS = 10;         


let currentWeatherMain = null; // will define the weather of each screen
let roundNumber = 0; // counts the rounds 
const WEATHER_CHALLENGE_EVERY = 3; //every 3rd round is "special"

// Images for the cards
const cardImages = [
    "docs/img/frog.png",
    "docs/img/cat.png",
    "docs/img/dog.png",
    "docs/img/apple.png",
    "docs/img/strawberry.png",
    "docs/img/star.png",
    "docs/img/tree.png",
    "docs/img/rocket.png",
    "docs/img/ghost.png",
    "docs/img/koala.png",
    "docs/img/hat.png",
    "docs/img/icecream.png",
    "docs/img/moon.png",
    "docs/img/whale.png",
    "docs/img/snake.png",
    "docs/img/donut.png",
    "docs/img/fish.png",
    "docs/img/seal.png",
    "docs/img/potato.png",
    "docs/img/hamburger.png",
    "docs/img/hamster.png"
];

const cardLabels = [
    "Frog",
    "Cat",
    "Dog",
    "Apple",
    "Strawberry",
    "Star",
    "Tree",
    "Rocket",
    "Ghost",
    "Koala",
    "Hat",
    "Icecream",
    "Moon",
    "Whale",
    "Snake",
    "Donut",
    "Fish",
    "Seal",
    "Potato",
    "Hamburger",
    "Hamster"
];

// music and sounds

const correctSound = new Audio("assets/audio/correct.wav");    
const wrongSound   = new Audio("assets/audio/wrong.wav"); 

// background music
const bgMusic = document.getElementById("bg-music");
bgMusic.volume = 0.4;

// game state

let chosenAvatar = null;         
let score = 0;
let lives = START_LIVES;

let timeLeft = BASE_ROUND_SECONDS;
let timerId = null;

let targetCardIndex = 0;        
let selectedTile = null;         

// DOM elements 

const startScreen  = document.getElementById("start-screen");
const gameScreen   = document.getElementById("game-screen");

const avatarButtons = document.querySelectorAll(".avatar-btn");
const startButton   = document.getElementById("start-button");
const backToMenuButton = document.getElementById("back-to-menu-button");

const avatarDisplay = document.getElementById("hud-avatar");
const scoreDisplay  = document.getElementById("hud-score");
const livesDisplay  = document.getElementById("hud-lives");
const timeDisplay   = document.getElementById("hud-time");

const gridElement   = document.getElementById("grid");
const targetImage   = document.getElementById("target-image");
const targetName    = document.getElementById("target-name");
const messageBox    = document.getElementById("message");

const endOverlay    = document.getElementById("end-overlay");
const endText       = document.getElementById("end-text");
const endMenuButton = document.getElementById("end-menu-button");

// avatar selection

avatarButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        
        avatarButtons.forEach(function (btn) {
            btn.classList.remove("selected");
        });

        // highlight the clicked card
        button.classList.add("selected");
        chosenAvatar = button.dataset.avatar;

        startButton.style.display = 'block'

        // enable the start button
        startButton.disabled = false;
    });
});

// start game button

startButton.addEventListener("click", function () {
    if (!chosenAvatar) {
        return;
    }

    // switch screens
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    startGame();
});

// back to menu button & reset

backToMenuButton.addEventListener("click", function () {
    goBackToMenu();
});

function goBackToMenu() {
    // stop timer if running
    if (timerId) {
        clearInterval(timerId);
    }

    // stop background music
    bgMusic.pause();

    // reset basic state
    selectedTile = null;
    chosenAvatar = null;
    score = 0;
    lives = START_LIVES;
    timeLeft = BASE_ROUND_SECONDS;

    roundNumber = 0; 

    // UI reset
    scoreDisplay.innerHTML = score;
    livesDisplay.innerHTML = lives;
    timeDisplay.innerHTML = timeLeft;
    messageBox.innerHTML = "";

    // unselect avatars
    avatarButtons.forEach(function (btn) {
        btn.classList.remove("selected");
    });

    // disable start button again
    // startButton.disabled = true;

    startButton.style.display = 'none'


    // swap screens
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
}

// end overlay

endMenuButton.addEventListener("click", function () {
    // hide overlay and go back to menu
    endOverlay.classList.add("hidden");
    goBackToMenu();
});

// keyboard

document.addEventListener("keydown", function (event) {
    // only confirm selection when we are in the game screen
    if (event.key === "Enter" && !gameScreen.classList.contains("hidden")) {
        confirmSelection();
    }
});


// start game with spacebar 

document.addEventListener("keydown", function (event) {
    // only trigger if avatar is selected AND start screen is visible
    if (event.code === "Space" && !startScreen.classList.contains("hidden")) {

        if (!chosenAvatar) {
            return; // can't start if avatar not selected
        }

        // mimic start button click
        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        startGame();
    }
});

// main game flow

function startGame() {
    score = 0;
    lives = START_LIVES;
    timeLeft = BASE_ROUND_SECONDS;

    scoreDisplay.innerHTML = score;
    livesDisplay.innerHTML = lives;
    timeDisplay.innerHTML = timeLeft;

    // Format avatar name with capital letter
    const avatarNiceName = chosenAvatar.charAt(0).toUpperCase() + chosenAvatar.slice(1);

    // Update avatar HUD: image + name
    document.getElementById("hud-avatar-img").src = `docs/img/avatar-${chosenAvatar}.png`;
    document.getElementById("hud-avatar-img").alt = avatarNiceName;
    document.getElementById("hud-avatar-name").innerHTML = avatarNiceName;


    messageBox.innerHTML = "Click a tile, then press ENTER to confirm.";

    // start background music after user clicked Start
    bgMusic.currentTime = 0;
    bgMusic.play().catch(function () {});

    startRound();
}

function startRound() {
    roundNumber++;
    
    // reset selection
    selectedTile = null;
    messageBox.innerHTML = "Pick a tile and then hit ENTER.";

    // this is the order that he builds the grid and it should make it "pick the target car" first
    //so it forces it to add at least 1 target card in the grid (otherwise I was finding sometimes the 
    //target card wasn't present on the grid.)
    setRoundTime();   
    pickTargetCard();
    buildGrid();       
    startTimer();      
}

// timer & levels of difficulty

let baseTime = 0; 
function setRoundTime() {

     // sets difficulty based on score 
    
    if (score < 3) {
        baseTime = 5;
    } else if (score < 7) {
        baseTime = 4; 
    } else { 
        baseTime = 3;
    }

    const isWeatherChallenge = currentWeatherMain && (roundNumber % WEATHER_CHALLENGE_EVERY === 0);

    if (isWeatherChallenge) {
        let extraMessage = "";

        if (currentWeatherMain === "Rain" || currentWeatherMain === "Drizzle" || currentWeatherMain === "Thunderstorm") {
            baseTime -= 1;
            extraMessage = "It's + currentWeatherMain.toLowerCase()" + " today, you have less time!";
        } else if (currentWeatherMain === "Clear") {
            baseTime += 1; 
            extraMessage = "Sunny bonus round! You get a bit more time this round.";
        } else {
            extraMessage = "Weather round:" + currentWeatherMain + ".";
        }
        messageBox.innerHTML = extraMessage;
    }
    else {
        
        messageBox.innerHTML = "Round" + roundNumber + ". Pick a tile and then press SPACE BAR";
    }
    
} 

let finalTime = Math.max(2,Math.min(6, baseTime));{ 

    timeLeft = finalTime;
    timeDisplay.innerHTML = timeLeft;

}

// grid

function buildGrid(cats) {
    console.log(cats)
    console.log(cats.length)

    gridElement.innerHTML = "";

    const totalCards =  cardImages.length; // cats.length; // 
    const maxCopiesPerCard = 2; // each card cannot appear more than 2 times

    // we can use up to BOARD_SIZE cards, but at most totalCards
    const distinctCount = Math.min(totalCards, BOARD_SIZE);

    // Choose which card indexes will be used this round
    const chosenSet = new Set();
    chosenSet.add(targetCardIndex);

    // Adds more random distinct cards until we have distinctCount
    while (chosenSet.size < distinctCount) {
        const randomIndex = Math.floor(Math.random() * totalCards);
        chosenSet.add(randomIndex);
    }

    const chosenIndices = Array.from(chosenSet);

    const cardIndices = [];
    const counts = new Array(totalCards).fill(0);

    while (cardIndices.length < BOARD_SIZE) {
        const randomIndex = Math.floor(Math.random() * chosenIndices.length);
        const cardIndex = chosenIndices[randomIndex];

        if (counts[cardIndex] < maxCopiesPerCard) {
            cardIndices.push(cardIndex);
            counts[cardIndex]++;
        }
        // if a card already has max copies, loop again and pick another
    }

    // Shuffle cardIndices so the target is in a random place
    for (let i = cardIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = cardIndices[i];
        cardIndices[i] = cardIndices[j];
        cardIndices[j] = temp;
    }

    // Create the tiles on the grid
    for (let i = 0; i < BOARD_SIZE; i++) {
        const cardIndex = cardIndices[i];

        const tile = document.createElement("li");
        tile.dataset.cardIndex = cardIndex;

        const img = document.createElement("img");

        try{
            img.src = cats[cardIndex].url; // cardImages[cardIndex];
            img.alt = cats[cardIndex].ID; //cardLabels[cardIndex];
        }
        catch {

        }
            

        // add confusion: random rotation/size
        const tiltRandom = Math.floor(Math.random() * 3); // 0,1,2
        if (tiltRandom === 1) {
            img.classList.add("tilt-left");
        } else if (tiltRandom === 2) {
            img.classList.add("tilt-right");
        }

        tile.appendChild(img);

        // random movement to create confusion
        const motionChance = Math.random();
        if (motionChance < 0.06) {
            tile.classList.add("card-spin");    
        } else if (motionChance < 0.12) {
            tile.classList.add("card-flip");    
        } else if (motionChance < 0.18) {
            tile.classList.add("card-shake");   
        }

        tile.addEventListener("click", function () {
            selectTile(tile);
        });

        gridElement.appendChild(tile);
    }
}

// choose target card

function pickTargetCard() {
    
    targetCardIndex = Math.floor(Math.random() * cardImages.length);

    targetImage.src = cardImages[targetCardIndex];
    targetImage.alt = cardLabels[targetCardIndex];
    targetName.innerHTML = cardLabels[targetCardIndex];
}

// timer

function startTimer() {
    // clear previous timer if any
    if (timerId) {
        clearInterval(timerId);
    }

    timerId = setInterval(function () {
        timeLeft--;
        timeDisplay.innerHTML = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerId);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    messageBox.innerHTML = "Time's up! You lose one life.";
    playWrong();
    loseLife();
}

// tile selection and check

function selectTile(tile) {
    // remove "selected" from all tiles
    const allTiles = gridElement.querySelectorAll("li");
    allTiles.forEach(function (t) {
        t.classList.remove("selected");
    });

    // add "selected" to the clicked tile
    tile.classList.add("selected");
    selectedTile = tile;
}

// called when user presses ENTER
function confirmSelection() {
    if (!selectedTile) {
        messageBox.innerHTML = "Choose a tile first!";
        return;
    }

    clearInterval(timerId);

    const tileCardIndex = Number(selectedTile.dataset.cardIndex);

    if (tileCardIndex === targetCardIndex) {
        // correct choice
        score++;
        scoreDisplay.innerHTML = score;

        if (score >= WIN_POINTS) {
            messageBox.innerHTML = "Insuperable! You found them all.";
            playCorrect();
            endGame(true); // win
            return;
        }

        messageBox.innerHTML = "Nice! New round coming…";
        playCorrect();
        setTimeout(startRound, 800);
    } 
    else {
        // wrong choice
        messageBox.innerHTML = "Nope, wrong one. You lose a life.";
        playWrong();
        loseLife();
    }
}

function loseLife() {
    lives--;
    livesDisplay.innerHTML = lives;

    if (lives <= 0) {
        endGame(false); // lost
    } else {
        setTimeout(startRound, 800);
    }
}

// end and restart game

function endGame(didWin) {
    clearInterval(timerId);

    // stop the music on end screen
    bgMusic.pause();

    if (didWin) {
        endText.innerHTML = "Congrats, you won! Final points: " + score;
    } else {
        endText.innerHTML = "Shame, you lost! Final points: " + score;
    }

    endOverlay.classList.remove("hidden");
}

// sound

function playCorrect() {
    if (!correctSound) return;
    correctSound.currentTime = 0;
    correctSound.play().catch(function () {});
}

function playWrong() {
    if (!wrongSound) return;
    wrongSound.currentTime = 0;
    wrongSound.play().catch(function () {});
}
