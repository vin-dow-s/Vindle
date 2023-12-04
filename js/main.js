const options = {
    azure: "A bright blue color reminiscent of a cloudless sky",
    bucolic: "Relating to the pleasant aspects of the countryside and country life",
    cynosure: "A person or thing that is the center of attention or admiration",
    dulcet: "Sweet and soothing (often used ironically)",
    euphoria: "A feeling or state of intense excitement and happiness",
    flummox: "Perplex (someone) greatly; bewilder",
    gossamer: "Something very light, thin, and insubstantial or delicate",
    haptic: "Relating to the sense of touch",
    iconoclast: "A person who attacks cherished beliefs or institutions",
    juxtapose: "Place or deal with close together for contrasting effect",
    kaleidoscope: "A constantly changing pattern or sequence of elements",
    liminal: "Relating to a transitional or initial stage of a process",
    mellifluous: "Pleasant to hear (of a voice or words)",
    neophyte: "A person who is new to a subject, skill, or belief",
    oscillate: "Move or swing back and forth in a regular rhythm",
    palindrome: "A word, phrase, or sequence that reads the same backward as forward",
    quagmire: "A soft boggy area of land; a complicated or precarious situation",
    rhapsody: "An effusively enthusiastic or ecstatic expression of feeling",
    sycophant: "A person who acts obsequiously toward someone important to gain advantage",
    talisman: "An object, typically an inscribed ring or stone, thought to have magic powers",
    ubiquitous: "Present, appearing, or found everywhere",
    vignette: "A brief evocative description, account, or episode",
    whimsical: "Playfully quaint or fanciful, especially in an appealing and amusing way",
    xenophobia: "Dislike of or prejudice against people from other countries",
    yarn: "A long or rambling story, especially one that is implausible",
    zealot: "A person who is fanatical and uncompromising in pursuit of their religious, political, or other ideals",
    acumen: "The ability to make good judgments and quick decisions",
    benevolent: "Well meaning and kindly",
    capricious: "Given to sudden and unaccountable changes of mood or behavior",
    dogma: "A principle or set of principles laid down by an authority as incontrovertibly true",
    eclectic: "Deriving ideas, style, or taste from a broad and diverse range of sources",
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
const todayDate = new Date(today);
const dayOfMonth = todayDate.getDate();
const wordIndex = dayOfMonth - 1;
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
    console.log(dayOfMonth);
    console.log(wordIndex);
    letterContainer.classList.remove("hide");
    userInpSection.innerText = "";
    wordToGuess = words[wordIndex];
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