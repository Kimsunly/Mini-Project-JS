let title = document.getElementById('title');
let categories = document.getElementById('categories');
let content = document.getElementById('content'); // hidden input
let file = document.getElementById('formFile');
let token = localStorage.getItem("authToken");

// Initialize Quill
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
    });

// Create Article
function createArticle(event) {
    event.preventDefault();

    // 💡 Get Quill HTML content and set to hidden input
    content.value = quill.root.innerHTML.trim();

    if (title.value == '') {
        document.getElementById('massages1').innerHTML = 'Title is required';
        return;
    }
    document.getElementById('massages1').innerHTML = '';

    if (categories.value == '') {
        document.getElementById('massages2').innerHTML = 'Category is required';
        return;
    }
    document.getElementById('massages2').innerHTML = '';

    if (!file.files[0]) {
        document.getElementById('massages1').innerHTML = '';
        document.getElementById('massages2').innerHTML = '';
        document.getElementById('messages3').innerHTML = 'Thumbnail is required';
        return;
    }
    if (content.value.trim() == '') {
        document.getElementById('massages1').innerHTML = '';
        document.getElementById('massages2').innerHTML = '';
        document.getElementById('messages3').innerHTML = '';
    document.getElementById('messages3').innerHTML = '';

    // ⚠ Quill sometimes produces "<p><br></p>" when empty
    if (content.value === '' || content.value === '<p><br></p>') {
        document.getElementById('messages4').innerHTML = 'Content is required';
        return;
    }
    
    document.getElementById('massages1').innerHTML = '';
    document.getElementById('massages2').innerHTML = '';
    document.getElementById('messages3').innerHTML = '';
    document.getElementById('messages4').innerHTML = '';
    toastLoading();

    // Data for article creation
    let data = {
        "title": title.value,
        "content": content.value,      // HTML from Quill
        "categoryId": Number(categories.value)
    };

    let formdata = new FormData();
    formdata.append("thumbnail", file.files[0]);

    // Create article
    fetch(`http://blogs.csm.linkpc.net/api/v1/articles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(res => res.json())
        .then(data => {
            let articleId = data.data.id;
            console.log(articleId);

            fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleId}/thumbnail`, {
            console.log("Created Article ID:", articleId);

            // Upload thumbnail
            return fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleId}/thumbnail`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: (formdata)
            }).then(res => res.json())
                .then(data => {
                    console.log(data);
                    document.getElementById('createArticleForm').reset();
                    toastStatus(data.message, data.result);
                }).catch(err => console.log(err))
                headers: { 'Authorization': `Bearer ${token}` },
                body: formdata
            });
        })
        .then(res => res.json())
        .then(data => {
            console.log("Thumbnail uploaded:", data);
        })
}


function toastLoading(message, result) {
    // let timerInterval;
    Swal.fire({
        title: 'Processing...',
        html: 'Please wait',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.toastLoading();
        }
    })
};

async function toastStatus(message, result) {
    // simulate async process
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
        .catch(err => console.log(err));
}
