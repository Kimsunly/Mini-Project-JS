let tbody = document.getElementById('tbody');
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUzNywiaWF0IjoxNzYyODQ2NTMxLCJleHAiOjE3NjM0NTEzMzF9.SuWR96swJdXeIAA1gGJE7owgXSLHgYWSigMW2c8xkpY";


getArticle();
function getArticle() {

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            // tbody.innerHTML = "";
            data.data.items.forEach(element => {
                tbody.innerHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <img src="${element.thumbnail}" class="article-thumb me-3" alt="">
                        <span>${element.title}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-light text-primary border">
                        ${element.category ? element.category.name : "null"}
                    </span>
                </td>
                <td>${moment(element.createdAt).format('lll')}</td>
                <td class="text-end">
                    <a href="#" class="btn btn-sm btn-outline-danger me-1">
                        <i class="bi bi-trash"></i>
                    </a>
                    <button onclick="updateArticle(${element.id})"
                        class="btn btn-sm btn-outline-secondary editBtn" 
                        data-bs-toggle="modal" 
                        data-bs-target="#exampleModal">
                        <i class="bi bi-pencil"></i>
                    </button>
                </td>
            </tr>
        `;

            });

        });
}


function updateArticle(id) {
    const myModalEl = document.getElementById('myModal');
    const myModal = new bootstrap.Modal(myModalEl);
    myModal.show();

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            data.data.items.forEach(element => {

                if (element.id == id) {
                    document.getElementById('title').value = element.title;
                    document.getElementById('content').value = element.content;
                    document.getElementById("thumbnail").src = element.thumbnail;
                }
            });

            fetch(`http://blogs.csm.linkpc.net/api/v1/categories`)
                .then(res => res.json())
                .then(data => {
                    data.data.items.forEach(element => {
                        console.log(id);
                        document.getElementById('categoriesModal').innerHTML += `<option value="${element.id}">${element.name}</option>`
                        if (element.id == id) {
                            document.getElementById('categoriesModal').value = element.id
                        }
                    });

                })

        });





    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${id}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`
        }

    })
}

function deleteArticle(id) {
    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
}