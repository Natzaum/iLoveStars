<?php

session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: ../frontend/login.php');
    exit;
}

?>

<!DOCTYPE html>
<html lang="en">

<head>
    <?php include 'includes/head.php' ?>
</head>

<body>
    <div class="container-fluid">
        <h3>welcome <?php echo $_SESSION['username'] ?></h3>
    </div>
</body>

</html>