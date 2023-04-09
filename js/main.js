const options = {
    coin_coin: "Duck sound in French"
}

//Initial References
const body = document.querySelector("body");
const resultMessage = document.getElementById("result-message");
const message = document.getElementById("message");
const hintRef = document.querySelector(".hint-ref");
const controls = document.querySelector(".controls-container");
const startBtn = document.getElementById("start");
const restartBtn = document.getElementById("restartBtn");
const letterContainer = document.getElementById("letter-container");
const userInpSection = document.getElementById("user-input-section");
const resultText = document.getElementById("result");
const word = document.getElementById("word");
const words = Object.keys(options);
let randomWord = "",
    randomHint = "";
let winCount = 0,
    lossCount = 0;

const storageKey = "lastPlayedDate";
const today = new Date().toISOString().slice(0, 10);

//Generate random value
const generateRandomValue = (array) => Math.floor(Math.random() * array.length);

//Block all the buttons
const blocker = () => {
    let lettersButtons = document.querySelectorAll(".letters");
    stopGame();
};

//Start game
startBtn.addEventListener('click', () => {
    controls.classList.add("hide");
    resultMessage.innerHTML = '';
    restartBtn.style.display = 'none';
    init();
});

restartBtn.addEventListener('click', () => {
    resultMessage.innerHTML = '';
    restartBtn.style.display = 'none';
    init();
})

//Stop Game
const stopGame = () => {
    controls.classList.remove("hide");
};

//Generate Word Function
const generateWord = () => {
    letterContainer.classList.remove("hide");
    userInpSection.innerText = "";
    randomWord = words[0];
    randomHint = options[randomWord].replaceAll("_", " ");
    hintRef.innerHTML = `<div id="wordHint">
            <span>Hint: </span>${randomHint}</div>`;
    let displayItem = "";
    randomWord.split("").forEach((value) => {
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
                let charArray = randomWord.toUpperCase().split("");
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

                                document.getElementById('chanceCount').style.display = 'none';
                                const intervalId = setInterval(createHeart, 100);

                                resultMessage.innerHTML = "<span id='__message'>You Won !!!!!</span>";
                                restartBtn.style.display = 'block';

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
                        word.innerHTML = `The answer was: <span>${randomWord.replace(/_/g, ' ')}</span>`;
                        resultText.innerHTML = "Game Over...";
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
    randomWord = "";
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
        body.innerHTML =
            `<div class="alreadyPlayed">
                <span>You have already played today...</span>
            </div>
            `;
        startBtn.style.display = 'none';
    } else {
        localStorage.setItem(storageKey, today);
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