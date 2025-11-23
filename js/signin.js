
let signinForm = document.getElementById("signinForm");
let firstName = document.getElementById("firstname");
let lastName = document.getElementById("lastname");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmPassword");
// for loading
const signinBtn = document.getElementById("signinBtn");
const btnText = signinBtn.querySelector(".btn-text");
const btnSpinner = signinBtn.querySelector(".spinner-border");
function setLoading(isLoading, loadingText = "Signing...") {
    if (isLoading) {
        signinBtn.disabled = true;
        btnSpinner.classList.remove("d-none");
        btnText.textContent = loadingText;
    } else {
        signinBtn.disabled = false;
        btnSpinner.classList.add("d-none");
        btnText.textContent = "Sign in";
    }
}

// For toast
const toastElement = document.getElementById("registerToast");
const toastBody = document.getElementById("toast-body");
const toastInstance = new bootstrap.Toast(toastElement, { delay: 4000 });

function showToast(message, type = "success") {
    toastElement.classList.remove("toast-success", "toast-error");
    toastBody.textContent = message;
    if (type === "error") {
        toastElement.classList.add("toast-error");
    } else {
        toastElement.classList.add("toast-success");
    }
    toastInstance.show();
}

signinForm.onsubmit = (e) => {
    e.preventDefault();

    let emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!email.value) {
        showToast("✗ Please enter your email!", "error");
        return;
    }
    if (!emailPattern.test(email.value)) {
        showToast("✗ Invalid email format!", "error");
        return;
    }

    const pwd = password.value;
    const pwdPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!pwd) {
        showToast("✗ Please enter your password!", "error");
        return;
    } else if (!pwdPattern.test(pwd)) {
        showToast("Invalid Email or Password!", "error");
        return;
    }
    setLoading(true);

    let loginData = {
        email: email.value,
        password: password.value,
    };
    fetch(`http://blogs.csm.linkpc.net/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data && (data.token || data.message === "Login successful.")) {
                showToast("✓ Login Successfully!", "success");
                localStorage.setItem("authToken", data.data.token);
                location.href = "index.html";
            } else {
                showToast("✗ Invalid Email or Password!", "error");
            }
        })
        .catch(err => {
            console.error(err);
            showToast("✗ Network error. Try again.", "error");
        })
        .finally(() => {
            setLoading(false);
        });
};
