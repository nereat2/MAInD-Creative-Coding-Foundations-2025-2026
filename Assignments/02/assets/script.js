// ===== SETTINGS =====

// board 6 x 5 = 30 tiles
const BOARD_COLUMNS = 6;
const BOARD_ROWS = 5;
const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;

const START_LIVES = 3;          // 3 lives
const BASE_ROUND_SECONDS = 3;   // starting seconds per round
const WIN_POINTS = 10;          // when score reaches this, you "win"

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

// ===== SOUNDS =====

const correctSound = new Audio("assets/audio/correct.wav");    // or .mp3
const wrongSound   = new Audio("assets/audio/wrong.wav");      // or .mp3

// background music
const bgMusic = document.getElementById("bg-music");
bgMusic.volume = 0.4;

// ===== GAME STATE =====

let chosenAvatar = null;         // "explorer", "fairy", "alien"
let score = 0;
let lives = START_LIVES;

let timeLeft = BASE_ROUND_SECONDS;
let timerId = null;

let targetCardIndex = 0;         // index in cardImages/cardLabels to find
let selectedTile = null;         // DOM element of the selected tile

// ===== DOM ELEMENTS =====

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

// ===== AVATAR SELECTION =====

avatarButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        // remove old highlight
        avatarButtons.forEach(function (btn) {
            btn.classList.remove("selected");
        });

        // highlight the clicked one
        button.classList.add("selected");
        chosenAvatar = button.dataset.avatar;

        // enable the start button
        startButton.disabled = false;
    });
});

// ===== START GAME BUTTON =====

startButton.addEventListener("click", function () {
    if (!chosenAvatar) {
        return;
    }

    // switch screens
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    startGame();
});

// ===== BACK TO MENU BUTTON =====

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
    startButton.disabled = true;

    // swap screens
    gameScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
}

// ===== END OVERLAY BUTTON =====

endMenuButton.addEventListener("click", function () {
    // hide overlay and go back to menu
    endOverlay.classList.add("hidden");
    goBackToMenu();
});

// ===== KEYBOARD: ENTER TO CONFIRM =====

document.addEventListener("keydown", function (event) {
    // only confirm selection when we are in the game screen
    if (event.key === "Enter" && !gameScreen.classList.contains("hidden")) {
        confirmSelection();
    }
});

// ===== MAIN GAME FLOW =====

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

    // 🔊 start background music after user clicked Start
    bgMusic.currentTime = 0;
    bgMusic.play().catch(function () {
        // some browsers block autoplay, but since this is after a click
        // it should normally be fine; ignore errors if any
    });

    startRound();
}

function startRound() {
    // reset selection
    selectedTile = null;
    messageBox.innerHTML = "Pick a tile and then hit ENTER.";

    pickTargetCard();  // choose which card to find
    setRoundTime();    // set timeLeft based on score
    buildGrid();       // build grid making sure target is there
    startTimer();      // start countdown
}

// ===== DIFFICULTY: TIME PER ROUND =====

function setRoundTime() {
    if (score >= 7) {
        timeLeft = 3;        // very fast
    } else if (score >= 3) {
        timeLeft = 4;        // medium
    } else {
        timeLeft = BASE_ROUND_SECONDS;  // easy at the beginning
    }
    timeDisplay.innerHTML = timeLeft;
}

// ===== GRID =====

function buildGrid() {
    gridElement.innerHTML = "";

    const totalCards = cardImages.length;
    const maxCopiesPerCard = 2; // each card will appear at most 2 times

    // we can use up to BOARD_SIZE cards, but at most totalCards
    const distinctCount = Math.min(totalCards, BOARD_SIZE);

    // 1) Choose which card indexes will be used this round
    // Always include the target card
    const chosenSet = new Set();
    chosenSet.add(targetCardIndex);

    // Add more random distinct cards until we have distinctCount
    while (chosenSet.size < distinctCount) {
        const randomIndex = Math.floor(Math.random() * totalCards);
        chosenSet.add(randomIndex);
    }

    const chosenIndices = Array.from(chosenSet);

    // 2) Build cardIndices list with at most maxCopiesPerCard copies per chosen card
    const cardIndices = [];
    const counts = new Array(totalCards).fill(0);

    while (cardIndices.length < BOARD_SIZE) {
        const randomIndex = Math.floor(Math.random() * chosenIndices.length);
        const cardIndex = chosenIndices[randomIndex];

        if (counts[cardIndex] < maxCopiesPerCard) {
            cardIndices.push(cardIndex);
            counts[cardIndex]++;
        }
        // if this card already has max copies, loop again and pick another
    }

    // 3) Shuffle cardIndices so the target is in a random place
    for (let i = cardIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = cardIndices[i];
        cardIndices[i] = cardIndices[j];
        cardIndices[j] = temp;
    }

    // 4) Create the tiles on the grid
    for (let i = 0; i < BOARD_SIZE; i++) {
        const cardIndex = cardIndices[i];

        const tile = document.createElement("li");
        tile.dataset.cardIndex = cardIndex;

        const img = document.createElement("img");
        img.src = cardImages[cardIndex];
        img.alt = cardLabels[cardIndex];

        // add confusion: random rotation/size
        const tiltRandom = Math.floor(Math.random() * 3); // 0,1,2
        if (tiltRandom === 1) {
            img.classList.add("tilt-left");
        } else if (tiltRandom === 2) {
            img.classList.add("tilt-right");
        }

        const sizeRandom = Math.floor(Math.random() * 3); // 0,1,2
        if (sizeRandom === 1) {
            img.classList.add("small");
        } else if (sizeRandom === 2) {
            img.classList.add("big");
        }

        tile.appendChild(img);

        // RANDOM MOVEMENT on some tiles
        const motionChance = Math.random();
        if (motionChance < 0.06) {
            tile.classList.add("card-spin");    // 6%
        } else if (motionChance < 0.12) {
            tile.classList.add("card-flip");    // next 6%
        } else if (motionChance < 0.18) {
            tile.classList.add("card-shake");   // next 6%
        }

        tile.addEventListener("click", function () {
            selectTile(tile);
        });

        gridElement.appendChild(tile);
    }
}

// ===== CHOOSE TARGET CARD =====

function pickTargetCard() {
    // pick a random card index from 0..cardImages.length-1
    targetCardIndex = Math.floor(Math.random() * cardImages.length);

    targetImage.src = cardImages[targetCardIndex];
    targetImage.alt = cardLabels[targetCardIndex];
    targetName.innerHTML = cardLabels[targetCardIndex];
}

// ===== TIMER =====

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
    messageBox.innerHTML = "⏰ Time's up! You lose one life.";
    playWrong();
    loseLife();
}

// ===== TILE SELECTION & CHECK =====

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
        messageBox.innerHTML = "Choose a tile first 🙂";
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
    } else {
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

// ===== END & RESTART =====

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

// ===== SIMPLE SOUND HELPERS =====

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
