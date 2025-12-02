// APIs
const API_KEY = 'live_RCGXuhOXH9u3QCHNh5V4XA9uAGkyZU5onO64ksjgdPeTUU1VpV09xZn9lwFdLLG5';
const CATS_URL = `https://api.thecatapi.com/v1/images/search?limit=22&api_key=${API_KEY}`;
const FACT_URL = "https://catfact.ninja/fact";

let catPictures = [];

// Load cat images
fetch(CATS_URL)
  .then(r => r.json())
  .then(data => {
    catPictures = data;
    console.log("Cats Loaded:", catPictures.length);
  })
  .catch(err => console.log("Cat API error:", err));

// Load cat facts
function loadCatFact() {
  fetch(FACT_URL)
    .then(r => r.json())
    .then(data => {
      const box = document.getElementById("cat-fact");
      if (box) box.textContent = data.fact;
    })
    .catch(() => {
      const box = document.getElementById("cat-fact");
      if (box) box.textContent = "Cats can jump up to 6 times their length!";
    });
}

// Game settings
const BOARD_COLUMNS = 6;
const BOARD_ROWS = 5;
const BOARD_SIZE = BOARD_COLUMNS * BOARD_ROWS;
const START_LIVES = 3;
const ROUND_TIME = 3;
const WIN_POINTS = 10;

// Sounds & music (use <audio> elements from HTML)
const correctSound = document.getElementById("correct-sound");
const wrongSound = document.getElementById("wrong-sound");
const bgMusic = document.getElementById("bg-music");
if (bgMusic) bgMusic.volume = 0.4;

// Start background music on first interaction
function startMusic() {
  if (bgMusic) {
    bgMusic.play().catch(() => {});
  }
  document.removeEventListener("click", startMusic);
  document.removeEventListener("keydown", startMusic);
}
document.addEventListener("click", startMusic);
document.addEventListener("keydown", startMusic);

// Game lets
let chosenAvatar = null;
let score = 0;
let lives = START_LIVES;
let timeLeft = ROUND_TIME;
let timerId = null;
let targetCatId = 0;
let selectedTile = null;

// DOM
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const avatarButtons = document.querySelectorAll(".avatar-btn");
const startButton = document.getElementById("start-button");
const backToMenuButton = document.getElementById("back-to-menu-button");
const scoreBox = document.getElementById("hud-score");
const livesBox = document.getElementById("hud-lives");
const timeBox = document.getElementById("hud-time");
const gridElement = document.getElementById("grid");
const targetImage = document.getElementById("target-image");
const messageBox = document.getElementById("message");
const endOverlay = document.getElementById("end-overlay");
const endText = document.getElementById("end-text");
const endMenuButton = document.getElementById("end-menu-button");
const hudAvatarImage = document.getElementById("hud-avatar-img");

// Hide HUD avatar initially
if (hudAvatarImage) {
  hudAvatarImage.style.display = "none";
}

// Avatar selection
avatarButtons.forEach(button => {
  button.addEventListener("click", () => {
    avatarButtons.forEach(b => b.classList.remove("selected"));
    button.classList.add("selected");

    chosenAvatar = button.dataset.avatar;

    const img = button.querySelector("img");
    if (img && hudAvatarImage) {
      hudAvatarImage.src = img.src;
      hudAvatarImage.alt = img.alt || "Avatar";
      hudAvatarImage.style.display = "block";
    }

    if (startButton) {
      startButton.style.display = "block";
      startButton.disabled = false;
    }
  });
});

// Buttons & keyboard
// Start button
if (startButton) {
  startButton.addEventListener("click", () => {
    if (!chosenAvatar) return;
    if (!catPictures.length) {
      if (messageBox) messageBox.innerHTML = "Loading cats...";
      return;
    }
    showGame();
  });
}

// Back to menu
if (backToMenuButton) {
  backToMenuButton.addEventListener("click", goBackToMenu);
}

// End overlay button
if (endMenuButton) {
  endMenuButton.addEventListener("click", () => {
    if (endOverlay) endOverlay.classList.add("hidden");
    goBackToMenu();
  });
}

// Space to start / Enter to confirm selected card
document.addEventListener("keydown", e => {
  if (e.code === "Space" && startScreen && !startScreen.classList.contains("hidden")) {
    if (!chosenAvatar || !catPictures.length) return;
    showGame();
  }
  if (e.key === "Enter" && gameScreen && !gameScreen.classList.contains("hidden")) {
    confirmSelection();
  }
});

// Load cat fact once DOM is ready
document.addEventListener("DOMContentLoaded", loadCatFact);

// Main game flow
function showGame() {
  if (startScreen) startScreen.classList.add("hidden");
  if (gameScreen) gameScreen.classList.remove("hidden");
  startGame();
}

function startGame() {
  score = 0;
  lives = START_LIVES;
  timeLeft = ROUND_TIME;

  if (scoreBox) scoreBox.textContent = score;
  if (livesBox) livesBox.textContent = lives;
  if (timeBox) timeBox.textContent = timeLeft;

  if (messageBox) {
    messageBox.innerHTML = "Click a card, then press ENTER to confirm";
  }

  startRound();
}

function goBackToMenu() {
  clearInterval(timerId);

  selectedTile = null;
  chosenAvatar = null;
  score = 0;
  lives = START_LIVES;
  timeLeft = ROUND_TIME;

  if (scoreBox) scoreBox.textContent = score;
  if (livesBox) livesBox.textContent = lives;
  if (timeBox) timeBox.textContent = timeLeft;
  if (messageBox) messageBox.innerHTML = "";

  avatarButtons.forEach(b => b.classList.remove("selected"));
  if (startButton) startButton.style.display = "none";

  if (hudAvatarImage) {
    hudAvatarImage.src = "";
    hudAvatarImage.alt = "";
    hudAvatarImage.style.display = "none";
  }

  if (gameScreen) gameScreen.classList.add("hidden");
  if (startScreen) startScreen.classList.remove("hidden");
}

function startRound() {
  selectedTile = null;
  if (messageBox) {
    messageBox.innerHTML = "Pick a cat card and then hit ENTER";
  }

  setRoundTime();
  pickTargetCat();
  buildGrid(catPictures);
  loadCatFact();
  startTimer();
}

// Timer
function setRoundTime() {
  timeLeft = score >= 3 ? 3 : ROUND_TIME;
  if (timeBox) timeBox.textContent = timeLeft;
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    timeLeft--;
    if (timeBox) timeBox.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  if (messageBox) {
    messageBox.innerHTML = "Time's up! You lose one life!";
  }
  playWrong();
  loseLife();
}

// Grid and layout game screen
function pickTargetCat() {
  if (!catPictures.length || !targetImage) return;

  targetCatId = Math.floor(Math.random() * catPictures.length);
  const targetCat = catPictures[targetCatId];

  targetImage.src = targetCat.url;
  targetImage.alt = targetCat.id || "Cat";
}

function buildGrid(cats) {
  if (!gridElement) return;

  gridElement.innerHTML = "";
  if (!cats.length) return;

  const totalCats = cats.length;
  const maxRepeats = 2;
  const gridCats = [];
  const catCount = new Array(totalCats).fill(0);

  // Target card must appear at least once inside the grid
  gridCats.push(targetCatId);
  catCount[targetCatId] = 1;

  // Rest of the cats in the grid can appear max. twice per cat
  while (gridCats.length < BOARD_SIZE) {
    const randomCatId = Math.floor(Math.random() * totalCats);
    if (catCount[randomCatId] < maxRepeats) {
      gridCats.push(randomCatId);
      catCount[randomCatId]++;
    }
  }

  // Shuffle cats on the grid
  for (let a = gridCats.length - 1; a > 0; a--) {
    const b = Math.floor(Math.random() * (a + 1));
    [gridCats[a], gridCats[b]] = [gridCats[b], gridCats[a]];
  }

  // Create cards
  for (let t = 0; t < BOARD_SIZE; t++) {
    const catId = gridCats[t];
    const cat = cats[catId];

    const tile = document.createElement("li");
    const img = document.createElement("img");
    img.src = cat.url;
    img.alt = cat.id || "Cat";

    // Each tile knows which cat it represents
    tile.dataset.catId = catId;

    const tilt = Math.floor(Math.random() * 3);
    if (tilt === 1) img.classList.add("tilt-left");
    if (tilt === 2) img.classList.add("tilt-right");

    tile.appendChild(img);

    const motion = Math.random();
    if (motion < 0.06) tile.classList.add("card-spin");
    else if (motion < 0.2) tile.classList.add("card-shake");

    tile.addEventListener("click", () => selectTile(tile));
    gridElement.appendChild(tile);
  }
}

// Cat selection
function selectTile(tile) {
  if (!gridElement) return;

  gridElement.querySelectorAll("li").forEach(t => t.classList.remove("selected"));
  tile.classList.add("selected");
  selectedTile = tile;
}

function confirmSelection() {
  if (!selectedTile) {
    if (messageBox) messageBox.innerHTML = "Choose a tile first!";
    return;
  }

  clearInterval(timerId);

  const chosenCatId = Number(selectedTile.dataset.catId);

  if (chosenCatId === targetCatId) {
    score++;
    if (scoreBox) scoreBox.textContent = score;

    if (score >= WIN_POINTS) {
      if (messageBox) messageBox.innerHTML = "Great! You found them all!";
      playCorrect();
      endGame(true);
      return;
    }

    if (messageBox) messageBox.innerHTML = "Nice! New round coming...";
    playCorrect();
    setTimeout(startRound, 800);
  } else {
    if (messageBox) {
      messageBox.innerHTML = "Nope! Wrong one. You lose a life";
    }
    playWrong();
    loseLife();
  }
}

function loseLife() {
  lives--;
  if (livesBox) livesBox.textContent = lives;

  if (lives <= 0) {
    endGame(false);
  } else {
    setTimeout(startRound, 800);
  }
}

// End and sounds
function endGame(didWin) {
  clearInterval(timerId);

  if (endText && endOverlay) {
    endText.innerHTML = didWin
      ? "Congrats you won! Final points: " + score
      : "Shame, you lost! Final points: " + score;

    endOverlay.classList.remove("hidden");
  }
}

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

