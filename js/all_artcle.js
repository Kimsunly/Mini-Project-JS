let tbody = document.getElementById('tbody');
let token = localStorage.getItem("authToken");
let categories = document.getElementById('categoriesModal');
let File = document.getElementById('formFile');
let thumbnailImg = document.getElementById('thumbnailImg');
let thumbnailModal = document.getElementById('thumbnailModal');
let search = document.getElementById('search');
let pagination = document.getElementById('paginationTest');
let totalCate = document.getElementById('sumCategory');

let deleteId = null;
let updateID = null;

let myModal;  // global
let currentPage = 1;
let perPage = 5;

window.onload = () => {
    const myModalEl = document.getElementById('myModal');
    myModal = new bootstrap.Modal(myModalEl);
};


getArticle();
function more() {
    currentPage++;
    getArticle();
}


function getArticle() {
    tbody.innerHTML = ""; // clear table before reloading

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/own?search=${search.value}&_page=${currentPage}&_per_page=${perPage}&sortBy=createdAt&sortDir=asc`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {

            // Render rows
            data.data.items.forEach(element => {
                tbody.innerHTML += `
                    <tr class="align-middle mt-3">
                        <td>
                            <div class="d-flex align-items-center justify-content-start gap-5">
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
                        <td class="text-center d-flex gap-2 justify-content-start align-items-center mt-4">
                            <button onclick="deleteArticle(${element.id})"
                                class="btn btn-sm btn-outline-danger me-1">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="updateArticle(${element.id})"
                                class="btn btn-sm btn-outline-secondary editBtn"
                                data-bs-toggle="modal"
                                data-bs-target="#exampleModal">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </td>
                    </tr>`;
            });

            // Build pagination
            renderPagination(data.data.totalPages);
        });
}
function renderPagination(totalPages) {
    let pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    // Prev button
    pagination.innerHTML += `
        <li class="${currentPage === 1 ? 'disabled' : ''}">
            <a href="#" onclick="changePage(${currentPage - 1})">Prev</a>
        </li>
    `;

    // Pages 1, 2, 3, ...
    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <li class="${i === currentPage ? 'active' : ''}">
                <a href="#" onclick="changePage(${i})">${i}</a>
            </li>
        `;
    }

    // Next button
    pagination.innerHTML += `
        <li class="${currentPage === totalPages ? 'disabled' : ''}">
            <a href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
}

function changePage(page) {
    currentPage = page;
    getArticle();
}



search.onkeyup = () => {
    tbody.innerHTML = '';
    getArticle(currentPage);
}

function updateArticle(id) {
    myModal.show();
    updateID = id;

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/own?search=&_page=1&_per_page=10&sortBy=createdAt&sortDir=asc`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(Info => {

            Info.data.items.forEach(element => {

                if (element.id == id) {
                    thumbnailImg.classList.remove('d-none');

                    if (element.thumbnail.src != "") {
                        thumbnailModal.classList.add('d-none');
                    }

                    document.getElementById('title').value = element.title;
                    quill.root.innerHTML = element.content;
                    document.getElementById("thumbnail").src = element.thumbnail;

                    if (element.category != null) {
                        categories.innerHTML += `<option value="${element.category.id}" selected>${element.category.name}</option>`;
                    } else {
                        categories.innerHTML += `<option value="0" selected>Please Select</option>`;
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

function removeImage() {
    thumbnailModal.classList.remove('d-none');
    thumbnailImg.classList.add('d-none');
}


function Update() {
    toastLoading()
    event.preventDefault();
    const catId = updateID

    let formData = new FormData();
    formData.append('thumbnail', File.files[0]);

    document.getElementById('content').value = quill.root.innerHTML;


    data = {
        "title": document.getElementById('title').value,
        "content": document.getElementById('content').value,
        "categoryId": Number(categories.value)
    }

    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${catId}`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(data => {

            fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${catId}/thumbnail`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            }).then(res => res.json())
                .then(data => {
                    tbody.innerHTML = '';
                    getArticle();
                    console.log(data);
                    if (data.result == true) {
                        toastStatus("Article updated successfully", data.result);
                    } else {
                        toastStatus(data.message, data.result);
                    }
                    myModal.hide();
                    File.value = "";
                })
        })


}
function deleteArticle(id) {
    deleteId = id;
    var myModal = new bootstrap.Modal(document.getElementById('deleteModal'));
    myModal.show();
}

function btnComfirm() {
    toastLoading()
    const modalEl = document.getElementById('deleteModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${deleteId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => res.json())
        .then(data => {
            console.log(data);
            toastStatus(data.message, data.result);
            modal.hide();
            tbody.innerHTML = '';
            getArticle();
        })
}

// ================= TOASTS =================
function toastLoading() {
    Swal.fire({
        title: 'Processing...',
        html: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function toastStatus(message, result) {
    Swal.fire({
        toast: true,
        position: 'bottom-end',
        icon: result ? 'success' : 'error',
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
    });
}


var quill;

document.addEventListener("DOMContentLoaded", function () {
    quill = new Quill('#quillEditor', {
        theme: 'snow'
    });
});

