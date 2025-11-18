let title = document.getElementById('title');
let categories = document.getElementById('categories');
let content = document.getElementById('content');
let file = document.getElementById('formFile');
let token = localStorage.getItem("authToken");


fetch(`http://blogs.csm.linkpc.net/api/v1/categories`)
    .then(res => res.json())
    .then(data => {
        console.log(data.data.items[1]);
        data.data.items.forEach(element => {
            categories.innerHTML += `<option value="${element.id}">${element.name}</option>`
        })
    });


function createArticle(event) {
    event.preventDefault();
    if (title.value == '') {
        document.getElementById('massages1').innerHTML = 'Title is required';
        return;
    }
    if (categories.value == '') {
        document.getElementById('massages1').innerHTML = '';
        document.getElementById('massages2').innerHTML = 'Category is required';
        return;
    }
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
        document.getElementById('messages4').innerHTML = 'Content is required';
        return;
    }
    
    document.getElementById('massages1').innerHTML = '';
    document.getElementById('massages2').innerHTML = '';
    document.getElementById('messages3').innerHTML = '';
    document.getElementById('messages4').innerHTML = '';
    toastLoading();

    let data = {
        "title": title.value,
        "content": content.value,
        "categoryId": Number(categories.value)
    }

    let formdata = new FormData();
    formdata.append("thumbnail", file.files[0]);


    fetch(`http://blogs.csm.linkpc.net/api/v1/articles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(data => {
            let articleId = data.data.id;
            console.log(articleId);

            fetch(`http://blogs.csm.linkpc.net/api/v1/articles/${articleId}/thumbnail`, {
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