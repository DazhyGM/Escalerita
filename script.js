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
        players.push({
            position: 0,
            score: 0,
            color: colors[i]
        });
    }

    // Copia nueva de preguntas y mezcla
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

        if (specialCells.question.includes(i)) cell.classList.add("question");
        if (specialCells.trap.includes(i)) cell.classList.add("trap");
        if (specialCells.bonus.includes(i)) cell.classList.add("bonus");

        cell.innerHTML = i + 1;
        board.appendChild(cell);
    }

    renderPlayers();
}

function renderPlayers() {

    document.querySelectorAll(".player").forEach(p => p.remove());

    players.forEach((player, index) => {

        const cell = document.getElementById("cell-" + player.position);

        const piece = document.createElement("div");
        piece.classList.add("player");
        piece.style.background = player.color;
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

            player.position++;
            renderPlayers();

        } else {

            clearInterval(interval);

            if (player.position === 24) {
                checkWinner();
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

        players[currentPlayer].score -= 5;
        alert("⚠️ Trampa! -5 puntos");
        updateScoreBoard();
        nextTurn();

    } else if (specialCells.bonus.includes(pos)) {

        players[currentPlayer].score += 5;
        alert("🎁 Comodín! +5 puntos");
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

                players[currentPlayer].score += 10;
                alert("✅ Correcto! +10 puntos");

            } else {

                players[currentPlayer].score -= 5;
                alert("❌ Incorrecto! -5 puntos");
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
    document.getElementById("turnInfo").innerText =
        "Turno del jugador " + (currentPlayer + 1);
}

function updateScoreBoard() {

    const board = document.getElementById("scoreBoard");
    board.innerHTML = "<h3>Puntajes</h3>";

    players.forEach((p, i) => {
        board.innerHTML += `<p>Jugador ${i + 1}: ${p.score} pts</p>`;
    });
}

function checkWinner() {

    let winner = players.reduce((prev, current) =>
        (prev.score > current.score) ? prev : current
    );

    alert("🏆 Juego terminado! Ganador con " + winner.score + " puntos!");
}

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("diceBtn").addEventListener("click", rollDice);