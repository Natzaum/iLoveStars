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

const urlParams = new URLSearchParams(window.location.search)
const error = urlParams.get('error')

if (window.location.search.includes('success=1')) {
    Swal.fire({
        position: "center",
        theme: "dark",
        icon: "success",
        title: "Your user has successfully registered",
        showConfirmButton: false,
        timer: 2500
    });
}

if (error) {
    Swal.fire({
        position: "center",
        theme: "dark",
        icon: "error",
        title: error,
        showConfirmButton: false,
        timer: 2500
    });
}
