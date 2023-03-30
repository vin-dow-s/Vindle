const options = {
    aroma: "Pleasing smell",
    pepper: "Salt's partner",
    halt: "Put a stop to",
    jump: "Rise suddenly",
    shuffle: "Mix cards up",
    combine: "Add; Mix",
    chaos: "Total disorder",
    labyrinth: "Maze",
    disturb: "Interrupt; upset ",
    shift: "Move; Period of word",
    machine: "Device or appliance",
    sushi: "Salmon over rice",
    champagne: "Snazzy sparkling drink",
    camembert: "Circular cheese",
    sheep: "Fluffy animal",
    eclipse: "Stars hiding each other",
    grenade: "Throwable explosive device",
    jackpot: "Big win",
    opera: "Ballet; cake",
    chicken: "Feathers with feet",
    unsupportive: "Megan's attitude",
    baguette: "A bag of uettes...",
    marvelous: "Qualifier for this game",
    buzz: "Bee's sound",
    jan: "Who has never been up in a hot air balloon",
    vindle: "This game's name :)",
    monaco: "Cocktail; town in France",
    walking: "Moonwalking but forward",
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
    randomWord = words[generateRandomValue(words)];
    randomHint = options[randomWord];
    hintRef.innerHTML = `<div id="wordHint">
            <span>Hint: </span>${randomHint}</div>`;
    let displayItem = "";
    randomWord.split("").forEach((value) => {
        displayItem += '<span class="inputSpace">_ </span>';
    });

    //Display each element as span
    userInpSection.innerHTML = displayItem;
    userInpSection.innerHTML += `<div id='chanceCount'>Chances Left: ${lossCount}</div>`;
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

                        //If winCount equals word length
                        if (winCount === charArray.length) {
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
                    word.innerHTML = `The word was: <span>${randomWord}</span>`;
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

window.onload = () => {
    init();
}

function createHeart() {
    const heart = document.createElement("div");
    heart.className = "fas fa-heart";
    heart.style.left = (Math.random() * 100) + "vw";
    heart.style.animationDuration = (Math.random() * 3) + 2 + "s"
    body.appendChild(heart);
}