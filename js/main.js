const options = {
    umami: "Savory taste, 5th of the basic tastes alongside sweet, sour, salty, and bitter",
    zeitgeist: "The spirit or defining mood of a particular period of history",
    hat_trick: "Scoring three goals in a single game (football, hockey...)",
    repertoire: "Collection of songs an artist knows/can perform",
    eccentric: "Unconventional; peculiar in behavior or appearance",
    serendipity: "Finding something good by chance",
    conundrum: "A confusing and difficult problem or question",
    ephemeral: "Lasting for a very short time",
    enigma: "A mysterious or puzzling person or situation",
    mellifluous: "Smooth and sweet-sounding; pleasant to hear",
    quixotic: "Exceedingly idealistic; unrealistic and impractical",
    ubiquitous: "Seemingly everywhere at once",
    plethora: "A large or excessive amount of something",
    perspicacious: "Having a keen understanding; mentally sharp",
    paragon: "A model of excellence or perfection",
    euphoria: "A feeling of intense happiness or excitement",
    onomatopoeia: "A word that imitates the sound it represents"
}

//Initial References
const body = document.querySelector("body");
const resultMessage = document.getElementById("result-message");
const message = document.getElementById("message");
const hintRef = document.querySelector(".hint-ref");
const controls = document.querySelector(".controls-container");
const startBtn = document.getElementById("start");
const letterContainer = document.getElementById("letter-container");
const userInpSection = document.getElementById("user-input-section");
const resultText = document.getElementById("result");
const word = document.getElementById("word");
const words = Object.keys(options);
let wordToGuess = "",
    randomHint = "";
let winCount = 0,
    lossCount = 0;

let lossCountStorage = lossCount;
let won = false;

const storageKey = "lastPlayedDate";
const today = new Date().toISOString().slice(0, 10);
const todayDate = new Date(new Date().toISOString().slice(0, 10));
const dayOfYear = Math.floor((todayDate - new Date(todayDate.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
const wordIndex = dayOfYear % words.length;
const lastPlayedDate = localStorage.getItem('lastPlayedDate');

//Generate random value
/*
const generateRandomValue = (array) => Math.floor(Math.random() * array.length);
 */

//Block all the buttons
const blocker = () => {
    let lettersButtons = document.querySelectorAll(".letters");
    stopGame();
};

//Start game
startBtn.addEventListener('click', () => {
    controls.classList.add("hide");
    resultMessage.innerHTML = '';
    init();
});

//Stop Game
const stopGame = () => {
    controls.classList.remove("hide");
};

//Generate Word Function
const generateWord = () => {
    letterContainer.classList.remove("hide");
    userInpSection.innerText = "";
    wordToGuess = words[0];
    randomHint = options[wordToGuess].replaceAll("_", " ");
    hintRef.innerHTML = `<div id="wordHint">
            <span>Hint: </span>${randomHint}</div>`;
    let displayItem = "";
    wordToGuess.split("").forEach((value) => {
        if (value === "_") {
            displayItem += '<span class="inputSpace">&nbsp;</span>';
        } else {
            displayItem += '<span class="inputSpace">_ </span>';
        }
    });

    //Display each element as span
    userInpSection.innerHTML = displayItem;
    userInpSection.innerHTML += `<div id='chanceCount'>Chances Left: ${lossCount}</div>`;

        //For creating letter buttons
        for (let i = 65; i < 91; i++) {
            let button = document.createElement("button");
            button.classList.add("letters");

            //Number to ASCII[A-Z]
            button.innerText = String.fromCharCode(i);

            //Character button onclick
            button.addEventListener("click", () => {
                message.innerText = `Correct Letter`;
                message.style.color = "#008000";
                let charArray = wordToGuess.toUpperCase().split("");
                let inputSpace = document.getElementsByClassName("inputSpace");

                //If array contains clicked value replace the matched Dash with Letter
                if (charArray.includes(button.innerText)) {
                    charArray.forEach((char, index) => {

                        //If character in array is same as clicked button
                        if (char === button.innerText) {
                            button.classList.add("correct");

                            //Replace dash with letter
                            inputSpace[index].innerText = char;

                            //increment counter
                            winCount += 1;

                            button.disabled = true;

                            //If winCount equals word length
                            if (winCount === charArray.filter(c => c !== "_").length) {
                                // Disable tous les boutons après la victoire
                                let lettersButtons = document.querySelectorAll(".letters");
                                lettersButtons.forEach((button) => {
                                    button.disabled = true;
                                });

                                const intervalId = setInterval(createHeart, 100);

                                resultMessage.innerHTML = "<span id='__message'>You Won !!!!!</span>";
                                localStorage.setItem(storageKey, today);
                                localStorage.setItem('lossCountStorage', lossCount);
                                localStorage.setItem("won", true.toString());

                                setTimeout(() => {
                                    clearInterval(intervalId);
                                }, 3000);
                            }
                        }
                    });
                } else {
                    //lose count
                    button.classList.add("incorrect");
                    lossCount -= 1;
                    document.getElementById(
                        "chanceCount"
                    ).innerText = `Chances Left: ${lossCount}`;
                    message.innerText = `Incorrect Letter`;
                    message.style.color = "#ff0000";
                    if (lossCount === 0) {
                        localStorage.setItem("won", false.toString());
                        localStorage.setItem('lossCountStorage', lossCount);
                        localStorage.setItem(storageKey, today);
                        word.innerHTML = `The answer was: <span>${wordToGuess.replace(/_/g, ' ')}</span>`;
                        resultText.innerHTML = "Game Over...";
                        startBtn.style.display = 'none';
                        blocker();
                    }
                }
                //Disable clicked buttons
                button.disabled = true;
            });

            //Append generated buttons to the letters container
            letterContainer.appendChild(button);
        }
};

//Initial Function
const init = () => {
    winCount = 0;
    lossCount = 5;
    wordToGuess = "";
    word.innerText = "";
    randomHint = "";
    message.innerText = "";
    userInpSection.innerHTML = "";
    letterContainer.classList.add("hide");
    letterContainer.innerHTML = "";
    generateWord();
}

window.onload = () => {
    const lastPlayed = localStorage.getItem(storageKey);
    if (lastPlayed !== null && lastPlayed === today) {
        if (localStorage.getItem('won') === 'true') {
            body.innerHTML =
            `<div class="alreadyPlayed">
                <span>You have already played today...</span>
            </div>
            <div class="alreadyPlayed lossCount">
                <span>You <strong>won</strong>, with <strong>${localStorage.getItem('lossCountStorage')} chances remaining</strong></span>
            </div>
            `;
        } else {
            body.innerHTML =
            `<div class="alreadyPlayed">
                <span>You have already played today...</span>
            </div>
            <div class="alreadyPlayed lossCount">
                <span>You did not find the word :(</span>
            </div>
            `;
        }
        startBtn.style.display = 'none';
    } else {
        init();
    }
}

//Purple hearts rain
function createHeart() {
    const heart = document.createElement("div");
    heart.className = "fas fa-heart";
    heart.style.left = (Math.random() * 100) + "vw";
    heart.style.animationDuration = (Math.random() * 3) + 2 + "s"
    body.appendChild(heart);
}