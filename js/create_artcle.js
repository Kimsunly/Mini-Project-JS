let title = document.getElementById('title');
let categories = document.getElementById('categories');
let content = document.getElementById('content');
let file = document.getElementById('formFile');
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUzNywiaWF0IjoxNzYyODQ2NTMxLCJleHAiOjE3NjM0NTEzMzF9.SuWR96swJdXeIAA1gGJE7owgXSLHgYWSigMW2c8xkpY"


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
        document.getElementById('massages2').innerHTML = '';
        document.getElementById('messages3').innerHTML = 'Thumbnail is required';
        return;
    }
    if (content.value.trim() == '') {
        document.getElementById('messages3').innerHTML = '';
        document.getElementById('messages4').innerHTML = 'Content is required';
        return;
    }
    document.getElementById('messages4').innerHTML = '';

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
                }).catch(err => console.log(err))
        })


}

