
let page = 1;
let perPage = 9;

const authToken = localStorage.getItem("authToken");

if (!authToken) {
    window.location.href = "login.html";
    throw new Error("No auth token, redirecting to login");
}

function getAllArticle() {
    fetch(`http://blogs.csm.linkpc.net/api/v1/articles?_page=${page}&_per_page=${perPage}&sortBy=createdAt&sortDir=desc`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`
        }
    })
        .then(res => {
            // If token invalid/expired → logout and redirect
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("authToken");
                window.location.href = "login.html";
                throw new Error("Unauthorized, token invalid");
            }
            return res.json();
        })
        .then(data => {
            let items = data.data.items;

            items.forEach(element => {
                document.getElementById("card").innerHTML += `
                    <div class="col-12 col-md-6 col-lg-4">
                        <div class="card custom-card">
                            <div class="card-img-wrapper position-relative">
                                <img src="${element.thumbnail}" class="card-img" alt="Photo">
                                <span class="category-badge position-absolute top-0 start-0 m-2 px-2 py-1 rounded">
                                    ${element.category ? element.category.name : "NULL"}
                                </span>
                            </div>
                            <div class="card-body">
                                <h1 class="py-2">${element.title}</h1>
                                <div class="d-flex justify-content-between align-items-center mt-4">
                                    <div class="d-flex align-items-center author-info">
                                        <img src="${element.creator.avatar}" alt=""
                                            class="rounded-circle bg-primary" width="40" height="40">
                                        <small class="ms-2 text-muted">
                                            ${element.creator.firstName} ${element.creator.lastName}
                                        </small>
                                    </div>
                                    <button class="btn btn-primary btn-modern" onclick="toDetail(${element.id})">
                                        View Detail
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
            });

            if (items.length < perPage) {
                document.getElementById("loadMoreBtn").style.display = "none";
            }
        })
        .catch(err => console.error("Error:", err));
}

let searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    const keyword = this.value.toLowerCase();

    const cards = document.querySelectorAll("#card .card");

    cards.forEach(card => {
        const title = card.querySelector("h1").textContent.toLowerCase();

        if (title.includes(keyword)) {
            card.parentElement.style.display = "block";
        } else {
            card.parentElement.style.display = "none";
        }
    });
});

let sidebarUser = document.getElementById("sidebar-user");
let navUserImage = document.getElementById("nav-user-img");

function loadsidebarUser() {
    fetch(`http://blogs.csm.linkpc.net/api/v1/auth/profile`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${authToken}`
        }
    })
        .then(res => {
            if (res.status === 401 || res.status === 403) {
                localStorage.removeItem("authToken");
                window.location.href = "login.html";
                throw new Error("Unauthorized, token invalid");
            }
            return res.json();
        })
        .then(data => {
            sidebarUser.innerHTML = `
                        <span class="sidebar-user-img" id="sidebar-user-img">
                            <picture>
                                <img src="${data.data.avatar}" alt="User name">
                            </picture>
                        </span>
                        <div class="sidebar-user-info" id="sidebar-user-info">
                            <span class="sidebar-user__title">${data.data.firstName + " " + data.data.lastName}</span>
                        </div>
                    `;
            navUserImage.innerHTML = `
                        <picture>
                            <img src="${data.data.avatar}" alt="User name">
                        </picture>
                    `;
        })
        .catch(err => console.error("Error:", err));
}

loadsidebarUser();
getAllArticle(page);

function loadMore() {
    page++;
    getAllArticle(page);
}

function logout() {
    fetch(`http://blogs.csm.linkpc.net/api/v1/auth/logout`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${authToken}`
        }
    })
        .catch(err => console.error("Logout error:", err))
        .finally(() => {
            localStorage.removeItem("authToken");
            window.location.href = "login.html";
        });
}

function toDetail(id) {
    sessionStorage.setItem("detail-id", id);
    location.href = "detail_articles.html";
}