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
        document.getElementById('messages3').innerHTML = 'Thumbnail is required';
        return;
    }
    document.getElementById('messages3').innerHTML = '';

    // ⚠ Quill sometimes produces "<p><br></p>" when empty
    if (content.value === '' || content.value === '<p><br></p>') {
        document.getElementById('messages4').innerHTML = 'Content is required';
        return;
    }
    document.getElementById('messages4').innerHTML = '';

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
            console.log("Created Article ID:", articleId);

            // Upload thumbnail
            return fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleId}/thumbnail`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formdata
            });
        })
        .then(res => res.json())
        .then(data => {
            console.log("Thumbnail uploaded:", data);
        })
        .catch(err => console.log(err));
}
