// APIs

const API_URL = `https://api.thecatapi.com/v1/images/search?limit=22&api_key=${API_KEY}`;
const FACT_URL = "https://catfact.ninja/fact";

let catPictures = [];

// Load cat pictures & random cat facts
fetch(API_URL)
  .then(res => res.json())
  .then(cats => {
    catPictures = cats;
    console.log("Cats loaded:", catPictures.length);
  })
  .catch(err => console.error("Cat API error:", err));

function loadCatFact() {
  const factBox = document.getElementById("cat-fact");
  if (!factBox) return;

  fetch(FACT_URL)
    .then(res => res.json())
    .then(data => {
      //sometimes this API just stops giving comments??
      let fact = data?.fact?.trim();

      if (!fact) {
        fact = "Cats can jump up to 6 times their length!";
      }

      factBox.textContent = fact;
    })
    .catch(() => {
      factBox.textContent = "Cats can jump up to 6 times their length!";
    });
}

// Settings
const BOARD_COLUMNS = 6;
const BOARD_ROWS = 5;
const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;

const START_LIVES = 3;
const BASE_ROUND_SECONDS = 3;
const WIN_POINTS = 10;

// Sounds & music
const correctSound = new Audio("assets/audio/correct.wav");
const wrongSound = new Audio("assets/audio/wrong.wav");

const bgMusic = document.getElementById("bg-music");
if (bgMusic) {
  bgMusic.volume = 0.4;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!bgMusic) return;

  bgMusic.play().catch(() => {
    const startMusic = () => {
      bgMusic.play().catch(() => {});
      document.removeEventListener("click", startMusic);
      document.removeEventListener("keydown", startMusic);
    };
    document.addEventListener("click", startMusic);
    document.addEventListener("keydown", startMusic);
  });
});

// Game bases
let chosenAvatar = null;
let score = 0;
let lives = START_LIVES;
let timeLeft = BASE_ROUND_SECONDS;
let timerId = null;
let targetCardIndex = 0;
let selectedTile = null;

// DOM
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const avatarButtons = document.querySelectorAll(".avatar-btn");
const startButton = document.getElementById("start-button");
const backToMenuButton = document.getElementById("back-to-menu-button");

const scoreDisplay = document.getElementById("score-box");
const livesDisplay = document.getElementById("lives-box");
const timeDisplay  = document.getElementById("time-box");
const hudAvatarImg = document.getElementById("avatar-img");

const gridElement = document.getElementById("grid");
const targetImage = document.getElementById("target-image");
const messageBox = document.getElementById("message");
const endOverlay = document.getElementById("end-overlay");
const endText = document.getElementById("end-text");
const endMenuButton = document.getElementById("end-menu-button");

// Avatar bubble hidden at start
if (hudAvatarImg) {
  hudAvatarImg.style.display = "none";
}

// Avatar selection
avatarButtons.forEach(button => {
  button.addEventListener("click", () => {
    avatarButtons.forEach(btn => btn.classList.remove("selected"));
    button.classList.add("selected");

    chosenAvatar = button.dataset.avatar;

    const buttonImg = button.querySelector("img");
    if (buttonImg && hudAvatarImg) {
      hudAvatarImg.src = buttonImg.src;
      hudAvatarImg.alt = buttonImg.alt || "Avatar";
      hudAvatarImg.style.display = "block";
    }

    if (startButton) {
      startButton.style.display = "block";
      startButton.disabled = false;
    }
  });
});

// Start button
if (startButton) {
  startButton.addEventListener("click", () => {
    if (!chosenAvatar) return;

    if (!catPictures || catPictures.length === 0) {
      if (messageBox) messageBox.innerHTML = "Loading cats...";
      return;
    }

    if (startScreen) startScreen.classList.add("hidden");
    if (gameScreen) gameScreen.classList.remove("hidden");
    startGame();
  });
}

document.addEventListener("DOMContentLoaded", loadCatFact);

if (backToMenuButton) {
  backToMenuButton.addEventListener("click", goBackToMenu);
}

if (endMenuButton) {
  endMenuButton.addEventListener("click", () => {
    if (endOverlay) endOverlay.classList.add("hidden");
    goBackToMenu();
  });
}

// Keyboard
// Space: start game from intro
document.addEventListener("keydown", event => {
  if (
    event.code === "Space" &&
    startScreen &&
    !startScreen.classList.contains("hidden")
  ) {
    if (!chosenAvatar) return;

    if (!catPictures || catPictures.length === 0) {
      if (messageBox) messageBox.innerHTML = "Loading cats...";
      return;
    }

    startScreen.classList.add("hidden");
    if (gameScreen) gameScreen.classList.remove("hidden");
    startGame();
  }
});

// Enter: confirm tile while playing
document.addEventListener("keydown", event => {
  if (
    event.key === "Enter" &&
    gameScreen &&
    !gameScreen.classList.contains("hidden")
  ) {
    confirmSelection();
  }
});

// Main flow
function startGame() {
  score = 0;
  lives = START_LIVES;
  timeLeft = BASE_ROUND_SECONDS;

  if (scoreDisplay) scoreDisplay.textContent = score;
  if (livesDisplay) livesDisplay.textContent = lives;
  if (timeDisplay)  timeDisplay.textContent = timeLeft;

  // keep avatar bubble visible in game screen too
  if (chosenAvatar && hudAvatarImg) {
    const selectedButton = document.querySelector(
      `.avatar-btn[data-avatar="${chosenAvatar}"] img`
    );
    if (selectedButton) {
      hudAvatarImg.src = selectedButton.src;
      hudAvatarImg.alt = selectedButton.alt || "Avatar";
      hudAvatarImg.style.display = "block";
    }
  }

  if (messageBox) {
    messageBox.innerHTML = "Click a tile, then press ENTER to confirm.";
  }

  startRound();
}

function goBackToMenu() {
  if (timerId) clearInterval(timerId);

  selectedTile = null;
  chosenAvatar = null;
  score = 0;
  lives = START_LIVES;
  timeLeft = BASE_ROUND_SECONDS;

  if (scoreDisplay) scoreDisplay.textContent = score;
  if (livesDisplay) livesDisplay.textContent = lives;
  if (timeDisplay)  timeDisplay.textContent = timeLeft;
  if (messageBox)   messageBox.innerHTML = "";

  avatarButtons.forEach(btn => btn.classList.remove("selected"));
  if (startButton) startButton.style.display = "none";

  if (hudAvatarImg) {
    hudAvatarImg.src = "";
    hudAvatarImg.alt = "";
    hudAvatarImg.style.display = "none";
  }

  if (gameScreen) gameScreen.classList.add("hidden");
  if (startScreen) startScreen.classList.remove("hidden");
}

function startRound() {
  selectedTile = null;

  if (messageBox) {
    messageBox.innerHTML = "Pick a tile and then hit ENTER.";
  }

  setRoundTime();
  pickTargetCard();
  buildGrid(catPictures);
  loadCatFact();
  startTimer();
}

// Timer
function setRoundTime() {
  timeLeft = score >= 3 ? 3 : BASE_ROUND_SECONDS;
  if (timeDisplay) timeDisplay.textContent = timeLeft;
}

function startTimer() {
  if (timerId) clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    if (timeDisplay) timeDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  if (messageBox) {
    messageBox.innerHTML = "Time's up! You lose one life.";
  }
  playWrong();
  loseLife();
}

// Grid
function pickTargetCard() {
  if (!catPictures || catPictures.length === 0) {
    console.log("No cats loaded yet for target card");
    return;
  }

  targetCardIndex = Math.floor(Math.random() * catPictures.length);

  const targetCat = catPictures[targetCardIndex];
  if (!targetCat) {
    console.log("No cat found at index", targetCardIndex);
    return;
  }

  if (targetImage) {
    targetImage.src = targetCat.url;
    targetImage.alt = targetCat.id || "Cat";
  }
}

function buildGrid(cats) {
  if (!gridElement) return;

  gridElement.innerHTML = "";
  if (!cats || cats.length === 0) return;

  const totalCats = cats.length;
  const maxCopiesPerCat = 2;
  const catIndexes = [];
  const copiesUsed = new Array(totalCats).fill(0);

  // ensure target appears at least once
  catIndexes.push(targetCardIndex);
  copiesUsed[targetCardIndex] = 1;

  // fill rest of grid
  while (catIndexes.length < BOARD_SIZE) {
    const index = Math.floor(Math.random() * totalCats);
    if (copiesUsed[index] < maxCopiesPerCat) {
      catIndexes.push(index);
      copiesUsed[index]++;
    }
  }

  // shuffle
  for (let i = catIndexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = catIndexes[i];
    catIndexes[i] = catIndexes[j];
    catIndexes[j] = tmp;
  }

  // create tiles
  for (let i = 0; i < BOARD_SIZE; i++) {
    const catIndex = catIndexes[i];
    const cat = cats[catIndex];

    const tile = document.createElement("li");
    tile.dataset.cardIndex = catIndex;

    const img = document.createElement("img");
    img.src = cat.url;
    img.alt = cat.id || "Cat";

    const tilt = Math.floor(Math.random() * 3);
    if (tilt === 1) img.classList.add("tilt-left");
    if (tilt === 2) img.classList.add("tilt-right");

    tile.appendChild(img);

    const motion = Math.random();
    if (motion < 0.06) {
      tile.classList.add("card-spin");
    } else if (motion < 0.18) {
      tile.classList.add("card-shake");
    }

    tile.addEventListener("click", () => selectTile(tile));
    gridElement.appendChild(tile);
  }
}

// Selection
function selectTile(tile) {
  if (!gridElement) return;

  gridElement.querySelectorAll("li").forEach(t => t.classList.remove("selected"));
  tile.classList.add("selected");
  selectedTile = tile;
}

function confirmSelection() {
  if (!selectedTile) {
    if (messageBox) {
      messageBox.innerHTML = "Choose a tile first!";
    }
    return;
  }

  if (timerId) clearInterval(timerId);

  const tileIndex = Number(selectedTile.dataset.cardIndex);

  if (tileIndex === targetCardIndex) {
    score++;
    if (scoreDisplay) scoreDisplay.textContent = score;

    if (score >= WIN_POINTS) {
      if (messageBox) {
        messageBox.innerHTML = "Great! You found them all.";
      }
      playCorrect();
      endGame(true);
      return;
    }

    if (messageBox) {
      messageBox.innerHTML = "Nice! New round coming…";
    }
    playCorrect();
    setTimeout(startRound, 800);
  } else {
    if (messageBox) {
      messageBox.innerHTML = "Nope, wrong one. You lose a life.";
    }
    playWrong();
    loseLife();
  }
}

function loseLife() {
  lives--;
  if (livesDisplay) livesDisplay.textContent = lives;

  if (lives <= 0) {
    endGame(false);
  } else {
    setTimeout(startRound, 800);
  }
}

// End game
function endGame(didWin) {
  if (timerId) clearInterval(timerId);

  if (endText && endOverlay) {
    endText.innerHTML = didWin
      ? "Congrats, you won! Final points: " + score
      : "Shame, you lost! Final points: " + score;
    endOverlay.classList.remove("hidden");
  }
}

// Sounds
function playCorrect() {
  if (!correctSound) return;
  correctSound.currentTime = 0;
  correctSound.play().catch(() => {});
}

function playWrong() {
  if (!wrongSound) return;
  wrongSound.currentTime = 0;
  wrongSound.play().catch(() => {});
}

//instructions section accessbile from nav bar 
document.addEventListener("DOMContentLoaded", () => {
    const instructionsButton = document.querySelector('#main-nav button[data-target="instructions"]');
    const instructionsOverlay = document.getElementById("instructions-overlay");
    const closeInstructions = document.getElementById("close-instructions");

    if (instructionsButton && instructionsOverlay && closeInstructions) {
        instructionsButton.addEventListener("click", () => {
            instructionsOverlay.classList.remove("hidden");
        });

        closeInstructions.addEventListener("click", () => {
            instructionsOverlay.classList.add("hidden");
        });
    }
});

// final credits section (sorry I had to do this :D hope you appreciate it!)
document.addEventListener("DOMContentLoaded", () => {
    const creditsButton = document.querySelector('#main-nav button[data-target="credits"]');
    const creditsOverlay = document.getElementById("credits-overlay");
    const closeCredits = document.getElementById("close-credits");

    if (!creditsButton || !creditsOverlay || !closeCredits) return;

    creditsButton.addEventListener("click", () => {
        creditsOverlay.classList.remove("hidden");
    });

    closeCredits.addEventListener("click", () => {
        creditsOverlay.classList.add("hidden");
    });
});
