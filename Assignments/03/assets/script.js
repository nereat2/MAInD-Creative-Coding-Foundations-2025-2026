const API_key = 'live_RCGXuhOXH9u3QCHNh5V4XA9uAGkyZU5onO64ksjgdPeTUU1VpV09xZn9lwFdLLG5' 
const API = `https://api.thecatapi.com/v1/images/search?limit=22&api_key=${API_key}`

let catPictures = [];

fetch(API)  
    .then((response) => response.json())
    .then((cats) => {
        catPictures = cats;
        console.log("Cats loaded:", catPictures.length);
    })
    .catch((error) => {
        console.error("Error loading cats:", error);
    })



// game settings

// board 6 x 5 = 30 tiles
const BOARD_COLUMNS = 6;
const BOARD_ROWS =  5;
const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;

const START_LIVES = 3;          
const BASE_ROUND_SECONDS = 3;   
const WIN_POINTS = 10;         


// music and sounds

const correctSound = new Audio("assets/audio/correct.wav");    
const wrongSound   = new Audio("assets/audio/wrong.wav"); 

// background music
const bgMusic = document.getElementById("bg-music");
bgMusic.volume = 0.4;

// Try to start music as soon as the page loads
document.addEventListener("DOMContentLoaded", function () {
    bgMusic.play().catch(() => {
        // If the browser blocks autoplay, start it on first interaction instead
        const resumeMusic = () => {
            bgMusic.play().catch(() => {});
            document.removeEventListener("click", resumeMusic);
            document.removeEventListener("keydown", resumeMusic);
        };

        document.addEventListener("click", resumeMusic);
        document.addEventListener("keydown", resumeMusic);
    });
});



// game state

let chosenAvatar = null;         
let score = 0;
let lives = START_LIVES;

let timeLeft = BASE_ROUND_SECONDS;
let timerId = null;

let targetCardIndex = 0;        
let selectedTile = null; 

let roundNumber = 0;

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

    if (!catPictures || catPictures.length === 0) {
        messageBox.innerHTML = "Loading cats...";
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
    const avatarName = chosenAvatar.charAt(0).toUpperCase() + chosenAvatar.slice(1);

    // Update avatar HUD: image + name
    document.getElementById("hud-avatar-img").src = `docs/img/avatar-${chosenAvatar}.png`;
    document.getElementById("hud-avatar-img").alt = avatarName;
    document.getElementById("hud-avatar-name").innerHTML = avatarName;

    messageBox.innerHTML = "Click a tile, then press ENTER to confirm.";

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
    buildGrid(catPictures);       
    startTimer();      
}

// timer & levels of difficulty

function setRoundTime() {

    if (score >= 3) {
        timeLeft = 3;        // very fast
    }  
    else {
        timeLeft = BASE_ROUND_SECONDS;  // easy at the beginning
    }
    timeDisplay.innerHTML = timeLeft;
}


// grid

function buildGrid(cats) {
    console.log(cats);
    console.log(cats.length);

    gridElement.innerHTML = "";

    if (!cats || cats.length === 0) {
        console.log("No cats provided to buildGrid");
        return;
    }

    const totalCats = cats.length;
    const maxCopiesPerCat = 2;

    // This array will hold the indexes of the cats we want to show
    const catIndexesForGrid = [];

    // Keep track of how many times we've used each cat
    const copiesUsed = new Array(totalCats).fill(0);

    // 1. Make sure the target cat appears at least once
    catIndexesForGrid.push(targetCardIndex);
    copiesUsed[targetCardIndex] = 1;

    // 2. Fill the rest of the grid with random cats,
    //    but never more than 2 copies of the same cat
    while (catIndexesForGrid.length < BOARD_SIZE) {
        const randomIndex = Math.floor(Math.random() * totalCats);

        if (copiesUsed[randomIndex] < maxCopiesPerCat) {
            catIndexesForGrid.push(randomIndex);
            copiesUsed[randomIndex]++;
        }
    }

    // 3. Shuffle the array so the target is in a random position
    for (let i = catIndexesForGrid.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = catIndexesForGrid[i];
        catIndexesForGrid[i] = catIndexesForGrid[j];
        catIndexesForGrid[j] = tmp;
    }

    // 4. Create the tiles on the grid
    for (let i = 0; i < BOARD_SIZE; i++) {
        const catIndex = catIndexesForGrid[i];
        const cat = cats[catIndex];

        const tile = document.createElement("li");
        tile.dataset.cardIndex = catIndex; // used later in confirmSelection

        const img = document.createElement("img");
        img.src = cat.url;
        img.alt = cat.id || "Cat";

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

    targetCardIndex = Math.floor(Math.random() * catPictures.length);

    targetImage.src = targetCat.url;
    targetImage.alt = targetCat.id || "Cat";
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
            messageBox.innerHTML = "Great! You found them all.";
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
    // bgMusic.pause();

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
