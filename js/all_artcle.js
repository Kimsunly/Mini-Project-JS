let tbody = document.getElementById('tbody');
let token = localStorage.getItem("authToken");
let categories = document.getElementById('categoriesModal');
let File = document.getElementById('formFile');



getArticle();
function getArticle() {

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            tbody.innerHTML = "";
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
                    <button onclick="deleteArticle(${element.id})" type="button" href="#" class="btn btn-sm btn-outline-danger me-1">
                        <i class="bi bi-trash"></i>
                    </bu>
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
    var myModalEl = document.getElementById('myModal');
    var myModal = new bootstrap.Modal(myModalEl);
    myModal.show();

    localStorage.setItem("articleId", id);

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(Info => {

            Info.data.items.forEach(element => {
                if (element.id == id) {
                    document.getElementById('title').value = element.title;
                    document.getElementById('content').value = element.content;
                    document.getElementById("thumbnail").src = element.thumbnail;
                    if (element.category != null) {
                        categories.innerHTML += `<option value="${element.category.id}" selected>${element.category.name}</option>`
                    } else {
                        categories.innerHTML += `<option value="0" selected>Please Select</option>`
                    }

                }

            });
            fetch('http://blogs.csm.linkpc.net/api/v1/categories')
                .then(res => res.json())
                .then(data => {

                    data.data.items.forEach(element => {
                        categories.innerHTML += `<option value="${element.id}">${element.name}</option>`
                    })
                })
        });

}



function Update() {
    event.preventDefault();
    const catId = localStorage.getItem("articleId");
    console.log(File.files[0]);

    let formData = new FormData();
    formData.append('thumbnail', File.files[0]);


    data = {
        "title": document.getElementById('title').value,
        "content": document.getElementById('content').value,
        "categoryId": Number(categories.value)
    }

    console.log(catId);

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${catId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(data => {
            console.log(data);
            getArticle();
        })

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${catId}/thumbnail`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    }).then(res => res.json())
        .then(data => {
            console.log(data);
        })

}

function deleteArticle(id) {
    if (confirm("Are you sure you want to delete this article?")) {
        fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                getArticle();
            })
    }
}