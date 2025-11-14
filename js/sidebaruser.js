let authToken = localStorage.getItem("authToken");
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