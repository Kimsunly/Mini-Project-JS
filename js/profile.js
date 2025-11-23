let token = localStorage.getItem('authToken');
if (!token) location.href = 'login.html';

let nameEl = document.getElementById("profileName");
let createdAt = document.getElementById("createdAt");
let avatarEl = document.getElementById("profileAvatar");
let alertBox = document.getElementById("alertBox");
let loadingOverlay = document.getElementById("loadingOverlay");
let avatarInput = document.getElementById("avatarInput");
let firstInput = document.getElementById("firstInput");
let lastInput = document.getElementById("lastInput");
let emailInput = document.getElementById("emailInput");

function showAlert(message, type) {
    alertBox.className = `alert alert-${type} show`;
    alertBox.innerText = message;
    setTimeout(() => alertBox.classList.remove('show'), 5000);
}

const fetchUserData = () => {
    fetch('http://blogs.csm.linkpc.net/api/v1/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => { if (!res.ok) throw new Error(); return res.json(); })
        .then(data => {
            if (data.data) {
                firstInput.value = data.data.firstName || '';
                lastInput.value = data.data.lastName || '';
                emailInput.value = data.data.email || '';
                nameEl.textContent = `${data.data.firstName || ''} ${data.data.lastName || ''}`.trim() || 'User';
                createdAt.textContent = data.data.registeredAt || 'N/A';
                if (data.data.avatar) avatarEl.src = data.data.avatar;
            }
        })
        .catch(() => { localStorage.removeItem('authToken'); location.href = 'login.html'; });
};

function triggerFile() { avatarInput.click(); }

avatarInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showAlert('Please select a valid image file.', 'error'); return; }
    if (file.size > 5 * 1024 * 1024) { showAlert('Image size should be less than 5MB.', 'error'); return; }

    const reader = new FileReader();
    reader.onload = e => avatarEl.src = e.target.result;
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("avatar", file);
    loadingOverlay.classList.add("show");

    fetch("http://blogs.csm.linkpc.net/api/v1/profile/avatar", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(result => {
            loadingOverlay.classList.remove("show");
            if (result.ok) { showAlert("Avatar uploaded successfully!", "success"); fetchUserData(); }
            else { showAlert(result.data.message || "Failed to upload avatar!", "error"); fetchUserData(); }
        })
        .catch(() => { loadingOverlay.classList.remove("show"); showAlert("Error uploading avatar!", "error"); fetchUserData(); });
});

function deleteAvatar() {
    if (!confirm("Are you sure you want to delete your avatar?")) return;
    loadingOverlay.classList.add("show");

    fetch("http://blogs.csm.linkpc.net/api/v1/profile/avatar", {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json().then(data => ({ ok: res.ok, data })))
        .then(result => {
            loadingOverlay.classList.remove("show");
            if (result.ok) { avatarEl.src = "./img/avatar/avatar-illustrated-01.png"; showAlert("Avatar deleted successfully!", "success"); }
            else showAlert(result.data.message || "Failed to delete avatar!", "error");
        })
        .catch(() => { loadingOverlay.classList.remove("show"); showAlert("Error deleting avatar!", "error"); });
}

const updateUserData = async () => {
    if (!firstInput.value.trim() || !lastInput.value.trim() || !emailInput.value.trim()) { showAlert('All fields are required!', 'error'); return; }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(emailInput.value)) { showAlert('Please enter a valid Gmail address!', 'error'); return; }

    loadingOverlay.classList.add("show");

    try {
        const res = await fetch('http://blogs.csm.linkpc.net/api/v1/profile', {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ firstName: firstInput.value.trim(), lastName: lastInput.value.trim(), email: emailInput.value.trim() })
        });

        loadingOverlay.classList.remove("show");

        if (res.ok) { showAlert('Profile updated successfully!', 'success'); fetchUserData(); }
        else { const errorData = await res.json(); showAlert('Failed to update profile: ' + (errorData.message || 'Unknown error'), 'error'); }
    } catch {
        loadingOverlay.classList.remove("show");
        showAlert('Error updating profile!', 'error');
    }
};

function logout() { localStorage.removeItem('authToken'); location.href = 'login.html'; }

fetchUserData();
