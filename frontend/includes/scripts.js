function showPassword() {
    var password = document.getElementById('password')

    if (password.type === 'password') {
        password.type = 'text'
    } else {
        password.type = 'password'
    }
}

function showRepeatedPassword() {
    var repeatPassword = document.getElementById('repeat-password')

    if (repeatPassword.type === 'password') {
        repeatPassword.type = 'text'
    } else {
        repeatPassword.type = 'password'
    }
}

document.querySelector('form').addEventListener('submit', function (e) {
    var password = document.getElementById('password').value
    var repeatPassword = document.getElementById('repeat-password').value
    if (password !== repeatPassword) {
        e.preventDefault();
        Swal.fire({
            position: "center",
            theme: "dark",
            icon: "error",
            title: "Password must be the same",
            showConfirmButton: false,
            timer: 1500
        });
    }

    var email = document.getElementById('email').value
    var username = document.getElementById('username').value

    if (!email || !username || !password || !repeatPassword) {
        e.preventDefault();
        Swal.fire({
            position: "center",
            theme: "dark",
            icon: "error",
            title: "All fields are required",
            showConfirmButton: false,
            timer: 1500
        });
    }

    if (username.length < 4 || username.length > 100) {
        e.preventDefault()
        Swal.fire({
            position: "center",
            theme: "dark",
            icon: "error",
            title: "Username must have at least 4 characters and a max of 100",
            showConfirmButton: false,
            timer: 1500
        });
    }

    if (password.length < 6 || username.length > 100) {
        e.preventDefault()
        Swal.fire({
            position: "center",
            theme: "dark",
            icon: "error",
            title: "Password must have at least 6 characters and a max of 100",
            showConfirmButton: false,
            timer: 1500
        });
    }
});

if (window.location.search.includes('success=1')) {
    Swal.fire({
        position: "center",
        theme: "dark",
        icon: "success",
        title: "Your user has successfully registered",
        showConfirmButton: false,
        timer: 1500
    });
}