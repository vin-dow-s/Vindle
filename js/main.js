const options = {
    algorithm:
        "A step-by-step procedure or set of rules used for calculation, problem-solving, or data processing",
    nebula: "A large cloud of gas and dust in space, often illuminated by the light of nearby stars",
    symbiosis:
        "A close and often long-term interaction between two different biological species",
    utopia: "An imagined society or place where everything is perfect, often idealized and unattainable",
    geothermal:
        "Related to the heat generated and stored within the Earth, often used as a source of renewable energy",
    empathy:
        "The ability to understand and share the feelings of another person",
    amygdala:
        "A part of the brain involved in processing emotions, especially fear and pleasure",
    serendipity:
        "The occurrence of events by chance in a happy or beneficial way",
    tundra: "A cold, treeless region found in the Arctic and on high mountain tops, where the subsoil is frozen",
    fractal:
        "A complex geometric shape that can be split into parts, each of which is a reduced-scale copy of the whole",
    anthropology:
        "The scientific study of humans, human behavior, and societies in the past and present",
    chronicle:
        "A factual written account of important or historical events in the order of their occurrence",
    entropy:
        "A measure of disorder or randomness in a system, often used in thermodynamics and information theory",
    coral_reef:
        "A marine ecosystem characterized by reef-building corals, found in shallow, warm ocean waters",
    isomer: "Molecules with the same molecular formula but different structural arrangements",
    philanthropy:
        "The desire to promote the welfare of others, often through generous donations or charitable activities",
    syntax: "The arrangement of words and phrases to create well-formed sentences in a language",
    jurisprudence:
        "The theory or philosophy of law and the study of legal systems",
    cartography: "The art and science of making maps and charts",
    botany: "The scientific study of plants, including their physiology, structure, and ecology",
    metabolism:
        "The chemical processes that occur within a living organism to maintain life",
    microbiome:
        "The collection of microorganisms, such as bacteria and fungi, living in a particular environment or organism",
    cosmology: "The science of the origin and development of the universe",
    dialect:
        "A particular form of a language specific to a region or social group",
    hypothesis:
        "A proposed explanation based on limited evidence, serving as a starting point for further investigation",
    seismology:
        "The scientific study of earthquakes and the propagation of seismic waves through the Earth",
    equilibrium: "A state in which opposing forces or influences are balanced",
    paradigm:
        "A typical example or pattern of something, often a model or framework used for understanding",
    ecology:
        "The branch of biology dealing with the relationships of organisms to one another and their environment",
    epiphany:
        "A sudden and profound realization or discovery, often with a spiritual or insightful nature",
    quantum:
        "The smallest amount of a physical quantity that can exist independently, especially in quantum physics",
    lexicon: "The vocabulary of a person, language, or branch of knowledge",
    artifact:
        "An object made by humans, often an item of cultural or historical interest",
}

//Initial References
const body = document.querySelector("body")
const resultMessage = document.getElementById("result-message")
const message = document.getElementById("message")
const hintRef = document.querySelector(".hint-ref")
const controls = document.querySelector(".controls-container")
const startBtn = document.getElementById("start")
const letterContainer = document.getElementById("letter-container")
const userInpSection = document.getElementById("user-input-section")
const resultText = document.getElementById("result")
const word = document.getElementById("word")
const words = Object.keys(options)
let wordToGuess = "",
    randomHint = ""
let winCount = 0,
    lossCount = 0

let lossCountStorage = lossCount
let won = false

const storageKey = "lastPlayedDate"
const today = new Date().toISOString().slice(0, 10)
const todayDate = new Date(today)
const dayOfMonth = todayDate.getDate()
const wordIndex = dayOfMonth
const lastPlayedDate = localStorage.getItem("lastPlayedDate")

//Generate random value
/*
const generateRandomValue = (array) => Math.floor(Math.random() * array.length);
 */

//Block all the buttons
const blocker = () => {
    let lettersButtons = document.querySelectorAll(".letters")
    stopGame()
}

//Start game
startBtn.addEventListener("click", () => {
    controls.classList.add("hide")
    resultMessage.innerHTML = ""
    init()
})

//Stop Game
const stopGame = () => {
    controls.classList.remove("hide")
}

//Generate Word Function
const generateWord = () => {
    console.log(dayOfMonth)
    console.log(wordIndex)
    letterContainer.classList.remove("hide")
    userInpSection.innerText = ""
    wordToGuess = words[wordIndex]
    randomHint = options[wordToGuess].replaceAll("_", " ")
    hintRef.innerHTML = `<div id="wordHint">
            <span>Hint: </span>${randomHint}</div>`
    let displayItem = ""
    wordToGuess.split("").forEach((value) => {
        if (value === "_") {
            displayItem += '<span class="inputSpace">&nbsp;</span>'
        } else {
            displayItem += '<span class="inputSpace">_ </span>'
        }
    })

    //Display each element as span
    userInpSection.innerHTML = displayItem
    userInpSection.innerHTML += `<div id='chanceCount'>Chances Left: ${lossCount}</div>`

    //For creating letter buttons
    for (let i = 65; i < 91; i++) {
        let button = document.createElement("button")
        button.classList.add("letters")

        //Number to ASCII[A-Z]
        button.innerText = String.fromCharCode(i)

        //Character button onclick
        button.addEventListener("click", () => {
            message.innerText = `Correct Letter`
            message.style.color = "#008000"
            let charArray = wordToGuess.toUpperCase().split("")
            let inputSpace = document.getElementsByClassName("inputSpace")

            //If array contains clicked value replace the matched Dash with Letter
            if (charArray.includes(button.innerText)) {
                charArray.forEach((char, index) => {
                    //If character in array is same as clicked button
                    if (char === button.innerText) {
                        button.classList.add("correct")

                        //Replace dash with letter
                        inputSpace[index].innerText = char

                        //increment counter
                        winCount += 1

                        button.disabled = true

                        //If winCount equals word length
                        if (
                            winCount ===
                            charArray.filter((c) => c !== "_").length
                        ) {
                            // Disable tous les boutons après la victoire
                            let lettersButtons =
                                document.querySelectorAll(".letters")
                            lettersButtons.forEach((button) => {
                                button.disabled = true
                            })

                            const intervalId = setInterval(createHeart, 100)

                            resultMessage.innerHTML =
                                "<span id='__message'>You Won !!!!!</span>"
                            localStorage.setItem(storageKey, today)
                            localStorage.setItem("lossCountStorage", lossCount)
                            localStorage.setItem("won", true.toString())

                            setTimeout(() => {
                                clearInterval(intervalId)
                            }, 3000)
                        }
                    }
                })
            } else {
                //lose count
                button.classList.add("incorrect")
                lossCount -= 1
                document.getElementById(
                    "chanceCount"
                ).innerText = `Chances Left: ${lossCount}`
                message.innerText = `Incorrect Letter`
                message.style.color = "#ff0000"
                if (lossCount === 0) {
                    localStorage.setItem("won", false.toString())
                    localStorage.setItem("lossCountStorage", lossCount)
                    localStorage.setItem(storageKey, today)
                    word.innerHTML = `The answer was: <span>${wordToGuess.replace(
                        /_/g,
                        " "
                    )}</span>`
                    resultText.innerHTML = "Game Over..."
                    startBtn.style.display = "none"
                    blocker()
                }
            }
            //Disable clicked buttons
            button.disabled = true
        })

        //Append generated buttons to the letters container
        letterContainer.appendChild(button)
    }
}

//Initial Function
const init = () => {
    winCount = 0
    lossCount = 5
    wordToGuess = ""
    word.innerText = ""
    randomHint = ""
    message.innerText = ""
    userInpSection.innerHTML = ""
    letterContainer.classList.add("hide")
    letterContainer.innerHTML = ""
    generateWord()
}

window.onload = () => {
    const lastPlayed = localStorage.getItem(storageKey)
    if (lastPlayed !== null && lastPlayed === today) {
        if (localStorage.getItem("won") === "true") {
            body.innerHTML = `<div class="alreadyPlayed">
                <span>You have already played today...</span>
            </div>
            <div class="alreadyPlayed lossCount">
                <span>You <strong>won</strong>, with <strong>${localStorage.getItem(
                    "lossCountStorage"
                )} chances remaining</strong></span>
            </div>
            `
        } else {
            body.innerHTML = `<div class="alreadyPlayed">
                <span>You have already played today...</span>
            </div>
            <div class="alreadyPlayed lossCount">
                <span>You did not find the word :(</span>
            </div>
            `
        }
        startBtn.style.display = "none"
    } else {
        init()
    }
}

//Purple hearts rain
function createHeart() {
    const heart = document.createElement("div")
    heart.className = "fas fa-heart"
    heart.style.left = Math.random() * 100 + "vw"
    heart.style.animationDuration = Math.random() * 3 + 2 + "s"
    body.appendChild(heart)
}
