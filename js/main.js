const options = {
    abdication : "The act of formally relinquishing or renouncing a throne, power, or responsibility",
    monsoon : "A seasonal prevailing wind in South and Southeast Asia, blowing from the southwest between May and September and bringing rain",
    quinoa : "A grain crop grown primarily for its edible seeds, which are high in protein and fiber",
    surrealism : "An artistic and literary movement that sought to explore the realm of the unconscious mind",
    Wimbledon : "The oldest tennis tournament in the world",
    mitochondria : "Small organelles found in most cells, responsible for producing energy in the form of ATP",
    impressionism : "An art movement characterized by capturing the fleeting effects of light and color in the natural world",
    democracy : "A system of government in which power is vested in the people, who rule either directly or through elected representatives",
    avocado : "A fruit with a creamy texture and a nutty flavor, often used in salads, guacamole, and sandwiches",
    marathon : "A long-distance running race with an official distance of 42.195 kilometers (26.2 miles)",
    Renaissance : "A period of cultural and intellectual rebirth in Europe, spanning from the 14th to the 17th century",
    photosynthesis : "The process by which green plants and some other organisms convert sunlight into energy to fuel their growth",
    van_gogh : "A Dutch post-impressionist painter known for his vivid and emotional artworks, such as 'Starry Night'",
    sushi : "A Japanese dish consisting of vinegared rice, often combined with raw or cooked seafood, vegetables, and seaweed",
    tectonic_plates : "Large sections of the Earth's lithosphere that fit together like a jigsaw puzzle and move over the asthenosphere",
    capitalism : "An economic system characterized by private ownership of property, competition, and the pursuit of profit",
    solar_system : "The collection of planets, moons, asteroids, and comets that orbit around the Sun",
    feminism : "The advocacy of women's rights on the grounds of political, social, and economic equality to men",
    barcelona : "A city in Spain known for its art, architecture, and football team",
    democracy : "A system of government in which power is vested in the people, who rule either directly or through elected representatives",
    psychology : "The scientific study of the mind and behavior",
    empanada : "A type of pastry filled with various ingredients, typically folded into a half-moon or turnover shape and baked or fried",
    buddhism : "A religion and philosophy based on the teachings of Siddhartha Gautama, emphasizing the pursuit of enlightenment",
    gravity : "The force that attracts objects toward the center of the Earth or other celestial bodies",
    biodiversity : "The variety of life forms, including species diversity, genetic diversity, and ecosystem diversity",
    rugby : "A contact team sport that originated in England, played with an oval ball and involving running, kicking, and tackling",
    dna : "Molecule that contains the genetic instructions for the development and functioning of living organisms",
    opera : "A form of musical and dramatic art combining singing and acting, often performed in elaborate productions",
    berlin : "The capital city of Germany, known for its history, culture, and vibrant nightlife",
    acupuncture : "A traditional Chinese medicine practice involving the insertion of thin needles into the body",
    tornado : "A violently rotating column of air that is in contact with both the surface of the Earth and a cumulonimbus cloud"
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
const wordIndex = dayOfMonth;
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