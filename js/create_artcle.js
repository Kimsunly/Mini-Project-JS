let title = document.getElementById('title');
let categories = document.getElementById('categories');
let content = document.getElementById('content'); // hidden input
let file = document.getElementById('formFile');
let token = localStorage.getItem("authToken");

// Initialize Quill Editor
var quill = new Quill('#editor', {
    theme: 'snow'
});

// Fetch categories
fetch(`http://blogs.csm.linkpc.net/api/v1/categories`)
    .then(res => res.json())
    .then(data => {
        data.data.items.forEach(element => {
            categories.innerHTML += `<option value="${element.id}">${element.name}</option>`;
        });
    })
    .catch(err => console.log("Category fetch error:", err));


// Create Article
async function createArticle(event) {
    event.preventDefault();

    // Insert Quill content into hidden input
    content.value = quill.root.innerHTML.trim();

    // ================= VALIDATION =================

    if (!title.value.trim()) {
        document.getElementById('massages1').innerHTML = 'Title is required';
        return;
    }
    document.getElementById('massages1').innerHTML = '';

    if (!categories.value) {
        document.getElementById('massages2').innerHTML = 'Category is required';
        return;
    }
    document.getElementById('massages2').innerHTML = '';

    if (!file.files[0]) {
        document.getElementById('messages3').innerHTML = 'Thumbnail is required';
        return;
    }
    document.getElementById('messages3').innerHTML = '';

    if (content.value === '' || content.value === '<p><br></p>') {
        document.getElementById('messages4').innerHTML = 'Content is required';
        return;
    }
    document.getElementById('messages4').innerHTML = '';

    // Loading Toast
    toastLoading();

    // ================= CREATE ARTICLE =================
    try {
        let articleData = {
            title: title.value,
            content: content.value,
            categoryId: Number(categories.value)
        };

        let createRes = await fetch(`http://blogs.csm.linkpc.net/api/v1/articles`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(articleData)
        });

        let createJson = await createRes.json();
        let articleId = createJson.data.id;

        console.log("Created Article ID:", articleId);

        // ================= UPLOAD THUMBNAIL =================
        let formdata = new FormData();
        formdata.append("thumbnail", file.files[0]);

        let thumbRes = await fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleId}/thumbnail`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formdata
        });

        let thumbJson = await thumbRes.json();
        console.log("Thumbnail uploaded:", thumbJson);

        document.getElementById('createArticleForm').reset();
        quill.setContents([]);

        toastStatus("Article created successfully", thumbJson.result);

    } catch (err) {
        console.log("Error:", err);
        toastStatus("An error occurred", false);
    }
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
