let signupForm = document.getElementById("signupForm");
let firstName = document.getElementById("firstname");
let lastName = document.getElementById("lastname");
let email = document.getElementById("email");
let password = document.getElementById("password");
let confirmPassword = document.getElementById("confirmPassword");
// for loading
const signupBtn = document.getElementById("signupBtn");
const btnText = signupBtn.querySelector(".btn-text");
const btnSpinner = signupBtn.querySelector(".spinner-border");
function setLoading(isLoading, loadingText = "Signing...") {
    if (isLoading) {
        signupBtn.disabled = true;
        btnSpinner.classList.remove("d-none");
        btnText.textContent = loadingText;
    } else {
        signupBtn.disabled = false;
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

signupForm.onsubmit = (e) => {
    e.preventDefault();

    if (firstName.value.trim() == "") {
        showToast("✗ Please enter your first name!", "error");
        return;
    }

    if (lastName.value.trim() == "") {
        showToast("✗ Please enter your last name!", "error");
        return;
    }

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
        showToast("✗ Password must be 8+ chars with uppercase, lowercase, number & special character!", "error");
        return;
    }

    if (!confirmPassword.value) {
        showToast("✗ Please confirm your password!", "error");
        return;
    } else if (pwd && confirmPassword.value !== pwd) {
        showToast("✗ Passwords do not match!", "error");
        return;
    }

    setLoading(true);

    let registerData = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value,
        confirmPassword: confirmPassword.value
    };
    fetch(`http://blogs.csm.linkpc.net/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.success || data.message === "Register successful.") {
                showToast("✓ Registration Successful! Welcome aboard!", "success");
                location.href = "login.html"
            } else if (
                data.message &&
                (data.message.toLowerCase().includes("email already exists") ||
                    data.message.toLowerCase().includes("email is already registered") ||
                    data.message.toLowerCase().includes("user already exists"))
            ) {
                showToast("✗ Email already exists! Please use a different email.", "error");
            } else if (data.error || data.message) {
                showToast("✗ " + (data.error || data.message), "error");
            } else {
                showToast("✗ Registration failed. Please try again.", "error");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showToast("✗ Network error. Please try again.", "error");
        })
        .finally(() => {
            setLoading(false);
        });
};

