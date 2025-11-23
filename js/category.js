let token = localStorage.getItem('authToken');
const perPage = 10;
let currentPage = 1;
let pagination = document.getElementById('paginationTest');
let totalCate = document.getElementById('sumCategory');
let idCate;
let body = document.getElementById('tbody');
let searchKeyWord = document.getElementById('searchKeyWord');

if (!token) {
    window.location.href = "login.html";
    throw new Error("No auth token, redirecting to login");
}
//------------------------------------ get user info --------------------------
fetch(`http://blogs.csm.linkpc.net/api/v1/auth/profile`, {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(res => res.json())
    .then(data => {
        document.getElementById('userName').innerText = data.data.firstName + " " + data.data.lastName;
        document.getElementById('userPic').src = data.data.avatar;
    });

//------------------------------------ get all categories ---------------------------
function getAllCate(page) {
    body.innerText = '';
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories?_page=${page}&_per_page=${perPage}&sortDir=desc&sortBy=createdAt&search=${searchKeyWord.value}`)
        .then(res => res.json())
        .then(data => {
            totalCate.innerText = 'showing ' + (perPage * page - 9) + ' to ' + perPage * page + ' of ' + data.data.meta.totalItems + " items";
            if (data.data.meta.totalItems == 0) {
                body.innerHTML = `<div class="search-empty">
                                    <h1>🔍 No matching records ...</h1> 
                                </div>`;
                return;
            }

            data.data.items.forEach(element => {
                body.innerHTML +=
                    `<tr>
                    <td class="align-middle">${element.name}</td>
                    <td align="right">
                        <button onclick="editCate(${element.id})" class="btn text-primary fs-5" data-bs-toggle="modal" data-bs-target="#editCate">
                            <i class="fa-regular fa-pen-to-square"></i>
                        </button>
                        <button onclick="openDelete(${element.id})" class="btn text-danger fs-5" data-bs-toggle="modal" data-bs-target="#deleteCate">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </td>
                </tr>`;
            });

            const totalPages = data.data.meta.totalPages;
            document.getElementById('paginationTest').innerHTML = `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <button class="page-link" onclick="getAllCate(${page - 1})"><i class="fa-solid fa-angle-left"></i></button>
            </li>
            ${Array.from({ length: totalPages }, (_, i) => `
                <li class="page-item ${page === i + 1 ? 'active' : ''}">
                    <button class="page-link" onclick="getAllCate(${i + 1})">${i + 1}</button>
                </li>
            `).join('')}
            <li class="page-item ${page === totalPages ? 'disabled' : ''}">
                <button class="page-link" onclick="getAllCate(${page + 1})"><i class="fa-solid fa-angle-right"></i></button>
            </li>
        `;
        });
}

//------------------------------------ search category ------------------------
searchKeyWord.onkeyup = () => {
    getAllCate(currentPage);
}

getAllCate(currentPage);

//---------------------------------- create category -------------------------
let saveCate = document.getElementById('saveCate');
saveCate.onclick = () => {
    let categoriesName = document.getElementById('categoriesName');

    // Check if input is empty
    if (!categoriesName.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter a category name!',
        });
        categoriesName.classList.add('is-invalid');
        return; // modal stays open
    }

    toastLoading();
    let data = { name: categoriesName.value }

    fetch('http://blogs.csm.linkpc.net/api/v1/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            toastStatus(data.message, data.result);
            console.log(data);
            getAllCate(currentPage);
            categoriesName.value = '';
            categoriesName.classList.remove('is-invalid');

            const modal = bootstrap.Modal.getInstance(document.getElementById('updateCate'));
            modal.hide();
        });
}

//---------------------------------- open modal edit -------------------------
function editCate(id) {
    idCate = id;
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${id}`)
        .then(res => res.json())
        .then(data => {
            const editInput = document.getElementById('editCateName');
            editInput.value = data.data.name || ''; // prefill input
            editInput.classList.remove('is-invalid');
        });
}

//----------------------------------- edit category ---------------------------
let saveEdit = document.getElementById('saveEditCate');
saveEdit.onclick = () => {
    const editInput = document.getElementById('editCateName');

    if (!editInput.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Please enter a category name!',
        });
        editInput.classList.add('is-invalid');
        return; // modal stays open
    }

    toastLoading();
    let data = { name: editInput.value }

    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${idCate}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            toastStatus(data.message, data.result);
            console.log(data);
            getAllCate(currentPage);

            editInput.value = '';
            editInput.classList.remove('is-invalid');

            const modal = bootstrap.Modal.getInstance(document.getElementById('editCate'));
            modal.hide();
        });
}

//----------------------------------- open modal delete category ------------
function openDelete(id) {
    idCate = id;
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${id}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('deleteStatus').innerText = data.data.name;
            console.log(data.data.name);
        });
}

//-------------------------------------- delete category ---------------------
let deleteCate = document.getElementById('btnDeleteCate');
deleteCate.onclick = () => {
    toastLoading();
    fetch(`http://blogs.csm.linkpc.net/api/v1/categories/${idCate}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            toastStatus(data.message, data.result);
            console.log(data);
            getAllCate(currentPage);
        });
}

//--------------------------------------------------- toast success ----------------
function showSucces() {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Product created successfully!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
    });
}

//----------------------------------------------- toast loading ------------------------
function toastLoading() {
    Swal.fire({
        title: 'Processing...',
        html: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    })
};

//----------------------------------------------- toast status -------------------------
async function toastStatus(message, result) {
    setTimeout(() => {
        Swal.fire({
            toast: true,
            position: 'bottom-end',
            icon: result ? 'success' : 'error',
            title: message,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });
    }, 1500);
}
