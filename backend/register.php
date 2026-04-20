<?php

require 'connection.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $repeat_password = $_POST['repeat_password'];

    mysqli_begin_transaction($conn);

    try {
        if (!$email || !$username || !$password) {
            throw new Exception("All fields are needed");
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Invalid E-mail");
        }
        if (strlen($username) < 4 || strlen($username) > 100) {
            throw new Exception("Invalid username");
        }
        if (strlen($password) < 6 || strlen($password) > 100) {
            throw new Exception("Password must have at least 6 characters and a max of 100");
        }
        if ($password !== $repeat_password) {
            throw new Exception("Password must be the same");
        }

        $exists_query = mysqli_prepare($conn, 'SELECT email, username FROM users WHERE email = ? OR username = ?');
        mysqli_stmt_bind_param($exists_query, 'ss', $email, $username);
        mysqli_stmt_execute($exists_query);
        $exists_result = mysqli_stmt_get_result($exists_query);
        $exists = mysqli_fetch_assoc($exists_result);

        if ($exists) {
            if ($exists['email'] === $email) {
                throw new Exception('This E-mail already exists');
            }
            if ($exists['username'] === $username) {
                throw new Exception('This username already exists');
            }
        }

        $user_register_query = mysqli_prepare($conn, 'INSERT INTO users (email, username, password) 
    VALUES (?, ?, ?)');

        if (!$user_register_query) {
            throw new Exception("Failed to register user");
        }

        mysqli_stmt_bind_param($user_register_query, 'sss', $email, $username, $password);
        mysqli_stmt_execute($user_register_query);

        mysqli_commit($conn);
        header("Location: ../frontend/login.php?success=1");
        exit;

    } catch (Exception $e) {
        mysqli_rollback($conn);
        header("Location: ../frontend/register.php?error=" . urlencode($e->getMessage()));
        exit;
    }
}
?>