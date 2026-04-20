<?php
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

$db_host = $_ENV['DB_HOST'] ?? '';
$db_user = $_ENV['DB_USER'] ?? '';
$db_password = $_ENV['DB_PASSWORD'] ?? '';
$db_name = $_ENV['DB_NAME'] ?? '';

$conn = mysqli_connect($db_host, $db_user, $db_password, $db_name);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $repeat_password = $_POST['repeat_password'];

    mysqli_begin_transaction($conn);

    try {
        if ($password !== $repeat_password) {
            throw new Exception("Password must be the same");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid E-mail");
        }
        if (!$email || !$username || !$password) {
            throw new Exception("All fields are needed");
        }

        $register_user_query = mysqli_prepare($conn, 'INSERT INTO users (email, username, password) 
    VALUES (?, ?, ?)');

        if (!$register_user_query) {
            throw new Exception("Failed to register user");
        }

        mysqli_stmt_bind_param($register_user_query, 'sss', $email, $username, $password);
        mysqli_stmt_execute($register_user_query);

        mysqli_commit($conn);
        echo "Register successfully";
        header("Location: ../frontend/login.html?success=1");

    } catch (Exception $e) {
        mysqli_rollback($conn);
        echo $e->getMessage();
    }
}
?>