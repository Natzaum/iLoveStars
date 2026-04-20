<?php
session_start();
require 'connection.php';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    try {
        $email = trim($_POST['email']);
        $password = $_POST['password'];

        $query = mysqli_prepare($conn, 'SELECT id, username, password FROM users WHERE email = ?');
        mysqli_stmt_bind_param($query, 's', $email);
        mysqli_stmt_execute($query);
        $result = mysqli_stmt_get_result($query);
        $user = mysqli_fetch_assoc($result);

        if (!$user) {
            throw new Exception('Invalid email or password');
        }
        if ($password !== $user['password']) {
            throw new Exception('Invalid email or password');
        }

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $email;

        header('Location: ../frontend/home_page.php');
        exit;

    } catch (Exception $e) {
        header("Location: ../frontend/login.php?error=" . urlencode($e->getMessage()));
        exit;
    }
}
?>