const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

let player1Name = '';
let player2Name = '';
let gameMode = 'player-vs-player';
let gameOver = false;

const player1 = {
  x: 10,
  y: canvas.height / 2 - 50,
  width: 10,
  height: 100,
  color: '#fff',
  dy: 0,
  score: 0
};

const player2 = {
  x: canvas.width - 20,
  y: canvas.height / 2 - 50,
  width: 10,
  height: 100,
  color: '#fff',
  dy: 0,
  score: 0
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 6,
  dx: 4,
  dy: 4,
  color: '#fff'
};

function startGame() {
  player1Name = document.getElementById('player1Name').value || 'Player 1';
  player2Name = document.getElementById('player2Name').value || 'Player 2';
  gameMode = document.querySelector('input[name="gameMode"]:checked').value;

  document.getElementById('playerForm').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  gameLoop(); // Starts the game loop
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function drawText(text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "30px Arial";
  ctx.fillText(text, x, y);
}

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4; // Reset the horizontal speed
  ball.dy = 4; // Reset the vertical speed
  ball.speed = 6; // Reset the overall speed (if you use a speed factor)
  ball.dx *= -1; // Invert direction after reset
}


function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;

  // Ball collision with top and bottom walls
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }

  // Ball collision with player paddles
  if (ball.x - ball.radius < player1.x + player1.width && 
      ball.y > player1.y && ball.y < player1.y + player1.height) {
    ball.dx *= -1;
  }

  if (ball.x + ball.radius > player2.x && 
      ball.y > player2.y && ball.y < player2.y + player2.height) {
    ball.dx *= -1;
  }

  // Ball goes out of bounds
  if (ball.x + ball.radius < 0) {
    player2.score++;
    resetBall();
    checkWin();
    sendScore(); // Call sendScore whenever a score is updated
  } else if (ball.x - ball.radius > canvas.width) {
    player1.score++;
    resetBall();
    checkWin();
    sendScore(); // Call sendScore whenever a score is updated
  }
}


function moveComputer() {
  // Basic AI to follow the ball
  if (player2.y + player2.height / 2 < ball.y) {
    player2.y += 2;
  } else {
    player2.y -= 2;
  }
}

function movePlayer(player) {
  player.y += player.dy;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function update() {
  moveBall();

  // Move player paddles based on game mode
  movePlayer(player1);

  if (gameMode === 'player-vs-computer') {
    moveComputer();
  } else {
    movePlayer(player2);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawRect(player1.x, player1.y, player1.width, player1.height, player1.color);
  drawRect(player2.x, player2.y, player2.width, player2.height, player2.color);
  drawBall(ball.x, ball.y, ball.radius, ball.color);
  drawText(`${player1Name}: ${player1.score}`, canvas.width / 4, 30, "#fff");
  drawText(`${player2Name}: ${player2.score}`, (3 * canvas.width) / 4, 30, "#fff");
}

function gameLoop() {
  if (gameOver) return; 
  
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function checkWin() {
  if (player1.score === 10 || player2.score === 10) {
    const winner = player1.score === 10 ? player1Name : player2Name;
    document.getElementById('winnerMessage').innerText = `${winner} Wins!`;
    document.getElementById('winnerPopup').style.display = 'block';
    gameOver = true;  // Set gameOver to true once the game is won
    cancelAnimationFrame(gameLoop);  // Stop the game loop
  }
}

function restartGame() {
  player1.score = 0;
  player2.score = 0;
  document.getElementById('winnerPopup').style.display = 'none';
  gameOver = false;
  gameLoop();
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp') {
    player2.dy = -6;
  } else if (event.key === 'ArrowDown') {
    player2.dy = 6;
  }
  if (event.key === 'w') {
    player1.dy = -6;
  } else if (event.key === 's') {
    player1.dy = 6;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    player2.dy = 0;
  }
  if (event.key === 'w' || event.key === 's') {
    player1.dy = 0;
  }
});


function sendScore() {
  console.log(`Score Update: ${player1Name} - ${player1.score}, ${player2Name} - ${player2.score}`);

  // Prepare data to send to the server
  const scoreData = {
    player1Name: player1Name,
    player2Name: player2Name,
    player1Score: player1.score,
    player2Score: player2.score
  };

  // Send a POST request to the PHP backend
  fetch('/path-to-your-php-script.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(scoreData),
  })
  .then(response => response.text())  // Get response text from PHP
  .then(data => {
    console.log('Score sent successfully:', data);  // Log success message from PHP
  })
  .catch(error => {
    console.error('Error sending score:', error);  // Log any errors
  });
}

