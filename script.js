let players = [];
let currentPlayer = 0;
let boardSize = 25;
let questions = [];

let specialCells = {
    question: [],
    trap: [],
    bonus: []
};

const allQuestions = [
    {
        question: "¿Qué empresa estuvo involucrada en el escándalo principal?",
        answers: ["Google", "Cambridge Analytica", "Amazon", "Microsoft"],
        correct: 1
    },
    {
        question: "¿Qué red social fue explotada para obtener datos?",
        answers: ["Twitter", "Instagram", "Facebook", "TikTok"],
        correct: 2
    },
    {
        question: "¿Cuál era el objetivo principal del uso de datos?",
        answers: ["Publicidad comercial", "Manipulación política", "Ventas online", "Entretenimiento"],
        correct: 1
    },
    {
        question: "¿Quién denunció públicamente a Cambridge Analytica?",
        answers: ["Edward Snowden", "Cris Willey", "Mark Zuckerberg", "Julian Assange"],
        correct: 1
    },
    {
        question: "¿Qué tipo de perfiles se creaban con los datos?",
        answers: ["Financieros", "Psicológicos", "Académicos", "Médicos"],
        correct: 1
    },
    {
        question: "¿En qué país influyó el escándalo electoral?",
        answers: ["Canadá", "Brasil", "Estados Unidos", "España"],
        correct: 2
    },
    {
        question: "¿Qué concepto clave se menciona en el documental?",
        answers: ["Big Data", "Blockchain", "Metaverso", "NFT"],
        correct: 0
    },
    {
        question: "¿Qué buscaba Cambridge Analytica con los anuncios?",
        answers: ["Informar", "Entretener", "Persuadir emocionalmente", "Educar"],
        correct: 2
    }
];

function startGame() {

    const count = parseInt(document.getElementById("playerCount").value);

    players = [];
    currentPlayer = 0;

    const colors = ["red", "blue", "green", "yellow", "purple"];

    for (let i = 0; i < count; i++) {

        let name = prompt("Nombre del jugador " + (i + 1));

        if (name === null) {
            players = [];
            return;
        }

        if (name.trim() === "") {
            name = "Jugador " + (i + 1);
        }

        players.push({
            name: name,
            position: 0,
            score: 0,
            color: colors[i]
        });
    }

    questions = [...allQuestions];
    shuffleArray(questions);

    generateSpecialCells();

    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameContainer").classList.remove("hidden");

    createBoard();
    updateTurnInfo();
    updateScoreBoard();
}

function generateSpecialCells() {

    let available = [];

    for (let i = 1; i < 24; i++) {
        available.push(i);
    }

    shuffleArray(available);

    specialCells.question = available.splice(0, 7);
    specialCells.trap = available.splice(0, 2);
    specialCells.bonus = available.splice(0, 2);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function createBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";

    for (let i = 0; i < boardSize; i++) {

        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.id = "cell-" + i;

        // Casillas especiales normales
        if (specialCells.question.includes(i)) cell.classList.add("question");
        if (specialCells.trap.includes(i)) cell.classList.add("trap");
        if (specialCells.bonus.includes(i)) cell.classList.add("bonus");
        if (i === 23) {
            cell.classList.add("final-question");
        }

        if (i === 24) {
            cell.classList.add("final-win");
        }

        cell.innerHTML = i + 1;
        board.appendChild(cell);
    }

    renderPlayers();
}

function renderPlayers() {

    players.forEach((player, index) => {

        let piece = document.getElementById("player-" + index);

        if (!piece) {
            piece = document.createElement("div");
            piece.classList.add("player");
            piece.id = "player-" + index;
            piece.style.background = player.color;
            piece.style.position = "absolute";
        }

        const cell = document.getElementById("cell-" + player.position);

        piece.style.top = (index * 15) + "px";

        cell.appendChild(piece);
    });
}

function rollDice() {

    const diceElement = document.getElementById("dice");

    let rolls = 10;

    let interval = setInterval(() => {

        diceElement.innerText = Math.floor(Math.random() * 6) + 1;

        rolls--;

        if (rolls === 0) {

            clearInterval(interval);

            let finalValue = Math.floor(Math.random() * 6) + 1;

            diceElement.innerText = finalValue;

            movePlayer(finalValue);
        }

    }, 100);
}

function movePlayer(steps) {

    let player = players[currentPlayer];
    let target = player.position + steps;

    if (target >= 24) target = 24;

    let interval = setInterval(() => {

        if (player.position < target) {

            let prev = player.position;
            player.position++;

            animateMove(currentPlayer, prev, player.position);

        } else {

            clearInterval(interval);

            if (player.position === 24) {
                player.score += 100;
                alert("🏆 Llegaste al final! Ganaste el juego");
                checkWinner();

            } else if (player.position === 23) {
                finalQuestion();

            } else {
                handleSpecialCell();
            }
        }

    }, 500);
}

function handleSpecialCell() {

    const pos = players[currentPlayer].position;

    if (specialCells.question.includes(pos)) {

        showQuestion();

    } else if (specialCells.trap.includes(pos)) {

        players[currentPlayer].score -= 50;
        alert("⚠️ Trampa! -50 puntos");
        updateScoreBoard();
        nextTurn();

    } else if (specialCells.bonus.includes(pos)) {

        players[currentPlayer].score += 50;
        alert("🎁 Comodín! +50 puntos");
        updateScoreBoard();
        nextTurn();

    } else {

        nextTurn();
    }
}

function showQuestion() {

    if (questions.length === 0) {
        questions = [...allQuestions];
        shuffleArray(questions);
    }

    const q = questions.pop();

    document.getElementById("questionText").innerText = q.question;

    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    q.answers.forEach((answer, index) => {

        const btn = document.createElement("button");
        btn.innerText = answer;

        btn.onclick = () => {

            if (index === q.correct) {

                players[currentPlayer].score += 100;
                alert("✅ Correcto! +100 puntos");

            } else {

                players[currentPlayer].score -= 50;
                alert("❌ Incorrecto! -50 puntos");
            }

            const modal = document.getElementById("questionModal");
            modal.classList.add("hidden");
            modal.classList.remove("active");

            updateScoreBoard();
            nextTurn();
        };

        answersDiv.appendChild(btn);
    });

    const modal = document.getElementById("questionModal");
    modal.classList.remove("hidden");
    modal.classList.add("active");
}

function nextTurn() {
    currentPlayer = (currentPlayer + 1) % players.length;
    updateTurnInfo();
}

function updateTurnInfo() {
    const player = players[currentPlayer];

    const nameEl = document.getElementById("currentPlayerName");
    nameEl.innerText = player.name;
    nameEl.style.background = player.color;
}

function updateScoreBoard() {

    const board = document.getElementById("scoreBoard");
    board.innerHTML = "<h3>Puntajes</h3>";

    players.forEach((p) => {
        board.innerHTML += `
            <p>
                <span style="
                    display:inline-block;
                    width:12px;
                    height:12px;
                    background:${p.color};
                    border-radius:50%;
                    margin-right:8px;
                "></span>
                <strong>${p.name}</strong>: ${p.score} pts
            </p>
        `;
    });
}

function checkWinner() {

    showFinalResults();
}

function finalQuestion() {

    if (questions.length === 0) {
        questions = [...allQuestions];
        shuffleArray(questions);
    }

    const q = questions.pop();

    document.getElementById("questionText").innerText =
        "🔥 PREGUNTA DEFINITIVA 🔥\n\n" +
        "Si aciertas → ganas\n" +
        "Si fallas → retrocedes medio tablero\n\n" +
        q.question;

    const answersDiv = document.getElementById("answers");
    answersDiv.innerHTML = "";

    q.answers.forEach((answer, index) => {

        const btn = document.createElement("button");
        btn.innerText = answer;

        btn.onclick = () => {

            if (index === q.correct) {

                players[currentPlayer].score += 100;

                alert("🏆 GANASTE! Respuesta correcta");

                checkWinner();

            } else {

                alert("❌ Fallaste! Retrocedes medio tablero");

                players[currentPlayer].position = Math.floor(players[currentPlayer].position / 2);

                renderPlayers();
                nextTurn();
            }

            const modal = document.getElementById("questionModal");
            modal.classList.add("hidden");
            modal.classList.remove("active");

            updateScoreBoard();
        };

        answersDiv.appendChild(btn);
    });

    const modal = document.getElementById("questionModal");
    modal.classList.remove("hidden");
    modal.classList.add("active");
}

function showFinalResults() {

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    const container = document.getElementById("finalScores");
    container.innerHTML = "";

    sortedPlayers.forEach((p, index) => {

        const position = index === 0 ? "👑" : (index + 1) + ".";

        container.innerHTML += `
            <p>
                ${position} 
                <span style="
                    display:inline-block;
                    width:12px;
                    height:12px;
                    background:${p.color};
                    border-radius:50%;
                    margin-right:8px;
                "></span>
                ${p.name} : ${p.score} pts
            </p>
        `;

    });
    launchConfetti();
    const modal = document.getElementById("resultsModal");
    modal.classList.remove("hidden");
    modal.classList.add("active");
}

function launchConfetti() {

    for (let i = 0; i < 80; i++) {

        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.background = getRandomColor();
        confetti.style.animationDuration = (Math.random() * 2 + 2) + "s";

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 4000);
    }
}

function animateMove(playerIndex, from, to) {

    const player = players[playerIndex];

    const fromCell = document.getElementById("cell-" + from);
    const toCell = document.getElementById("cell-" + to);

    const piece = document.getElementById("player-" + playerIndex);

    if (!piece) return;

    const fromRect = fromCell.getBoundingClientRect();
    const toRect = toCell.getBoundingClientRect();

    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;

    piece.style.zIndex = 1000;

    piece.animate([
        { transform: `translate(0px, 0px)` },
        { transform: `translate(${dx * 0.5}px, ${dy - 30}px)` },
        { transform: `translate(${dx}px, ${dy}px)` }
    ], {
        duration: 400,
        easing: "ease-out"
    });

    setTimeout(() => {
        piece.style.transform = "none";
        piece.style.zIndex = 10;
        toCell.appendChild(piece);
    }, 400);
}

function getRandomColor() {
    const colors = ["red", "yellow", "blue", "green", "pink", "orange"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function finishGame() {

    location.reload();
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("diceBtn").addEventListener("click", rollDice);