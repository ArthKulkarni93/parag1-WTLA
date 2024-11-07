<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database connection details
$servername = "localhost"; // Your server name
$username = "root"; // Your MySQL username
$password = ""; // Your MySQL password
$dbname = "pingpong"; // Your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from POST request
$data = json_decode(file_get_contents('php://input'), true);

// Extract player scores and names from the received data
$player1Name = $data['player1Name'];
$player2Name = $data['player2Name'];
$player1Score = $data['player1Score'];
$player2Score = $data['player2Score'];

// Get the current date and time
$gameDate = date('Y-m-d H:i:s');

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO scores (player1_name, player2_name, player1_score, player2_score, game_date) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("ssii", $player1Name, $player2Name, $player1Score, $player2Score, $gameDate);

// Execute the statement
if ($stmt->execute()) {
    echo "Scores saved successfully";
} else {
    echo "Error: " . $stmt->error;
}

// Close connections
$stmt->close();
$conn->close();
?>
