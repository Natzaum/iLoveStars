<!DOCTYPE html>
<html lang="en">

<head>
    <?php include 'includes/head.php' ?>
    <link href="styles.css" rel="stylesheet">
</head>

<body>
    <div class="container-fluid vh-100">
        <div class="row justify-content-center align-items-center h-100">

            <div class="sidebar glass-panel col-12 col-md-6 col-lg-3">
                <div class="planet-wrapper">
                    <div id="mars-scene" class="mars-scene" aria-hidden="true"></div>
                    <div class="planet-copy text-center">
                        <p class="planet-eyebrow">Interactive Planet</p>
                        <h2>Mars Orbit</h2>
                        <p>Explore the red planet while you enter the universe of your favorite stars.</p>
                    </div>
                </div>
            </div>

            <div class="col-12 col-md-6 col-lg-3 login-column">
                <div class="card shadow glass-panel-login p-3">
                    <form method="post" action="../backend/session.php">
                        <div class="card-header mb-3 text-center">
                            <h3>Search for Stars</h3>
                        </div>
                        <div class="card-body">

                            <div class="col-12 mb-3">
                                <label>Email</label>
                                <input name="email" class="form-control glass-panel" id="email">
                            </div>
                            <div class="col-12 mb-3">
                                <label>Password</label>
                                <div class="password-field">
                                    <input name="password" type="password" id="password"
                                        class="form-control glass-panel">
                                    <img id="visibility-on" src="../images/visibility_on.svg" alt="Show password"
                                        onclick="showPassword()">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center">
                            <input type="submit" href="#" class="register-link mb-3" value="Login">
                            <p>or</p>
                            <a href="../frontend/register.php" class="login-link">Register</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script type="module" src="includes/mars-scene.js"></script>
</body>

</html>

<script src="includes/scripts.js"></script>