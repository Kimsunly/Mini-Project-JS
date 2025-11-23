let id = sessionStorage.getItem("detail-id");
let authToken = localStorage.getItem("authToken");
if (!authToken) {
    window.location.href = "login.html";
    throw new Error("No auth token, redirecting to login");
}
fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${id}`, {
    method: "GET",
    headers: {
        Authorization: `Bearer ${authToken}`,
    },
})
    .then(res => res.json())
    .then(data => {
        const contentRaw = data.data.content;

        document.getElementById("thumbnail").src = data.data.thumbnail;
        document.getElementById("categories").innerHTML =
            data.data.category && data.data.category.name ? data.data.category.name : "NULL";
        document.getElementById("title").innerHTML = data.data.title;
        document.getElementById("content").innerHTML = contentRaw;
        document.getElementById("avatar").src = data.data.creator.avatar;
        document.getElementById("name").innerHTML = data.data.creator.firstName + " " + data.data.creator.lastName;
        console.log(data.data.content);
    })
let sidebarUser = document.getElementById("sidebar-user");
let navUserImage = document.getElementById("nav-user-img");
function loadsidebarUser() {
    fetch(`http://blogs.csm.linkpc.net/api/v1/auth/profile`, {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
        .then(res => res.json())
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
                    `
            navUserImage.innerHTML = `
                            <picture>
                                <img src="${data.data.avatar}" alt="User name">
                            </picture>
                        `
        })
}
loadsidebarUser();
