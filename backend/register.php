<?php

require 'connection.php';

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
        if (strlen($username) < 4 || strlen($username) > 100) {
            throw new Exception("Invalid username");
        }
        if (strlen($password) < 6 || strlen($password) > 100) {
            throw new Exception("Invalid password");
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
        header("Location: ../frontend/login.php?success=1");

    } catch (Exception $e) {
        mysqli_rollback($conn);
        echo $e->getMessage();
    }
}
?>