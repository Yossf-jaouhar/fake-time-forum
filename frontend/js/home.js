
document.addEventListener("DOMContentLoaded", function () {
    statement()
})

const creatpost = `
<style>
   
#creatpost {
    width: 400px;
    height: 220px;
    background-color: #DCD7C9;
    margin-left: 100px;
    margin-top: 20px;
    color: white;
    text-align: center;
    font-size: 20px;

    border-radius: 10px;
}

#creatpost #titleID {
    margin-top: 3%;
    width: 80%;
    padding: 10px;
    font-size: 16px;
    border-radius: 15px;
    border: #f1f1f1;
    transition: border 0.3s;
}

#creatpost #contentID {
    width: 80%;
    height: 40%;
    border-radius: 15PX;
    margin-top: 10px;
    margin-left: 30px;
    display: block;
    padding: 10px;
    font-size: 16px;
    border: #f1f1f1;
    resize: none;
    outline: none;
}

#creatpost #contentID::-webkit-scrollbar {
    width: 6px;
    /* عرض شريط التمرير */
}

/* تخصيص المسار الخلفي لشريط التمرير */
#creatpost #contentID::-webkit-scrollbar-track {
    background: #f1f1f1;
    /* لون الخلفية */
    border-radius: 10px;
    /* زوايا دائرية */
}

/* تخصيص مقبض شريط التمرير */
#creatpost #contentID::-webkit-scrollbar-thumb {
    background: #005F20;
    /* لون المقبض */
    border-radius: 10px;
    /* زوايا دائرية */
}

/* تأثير عند تمرير الماوس على المقبض */
#creatpost #contentID::-webkit-scrollbar-thumb:hover {
    background: #0056b3;
    /* لون أغمق عند التمرير */
}


#creatpost button {
    background-color: var(--btn2);
    margin-top: 10px;
    color: white;
    padding: 10px 20px;
    font-size: 16px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

#creatpost button:hover {
    background-color: #005F20;
}
</style>
<div id="creatpost" class="creatpost">
    <input id="titleID" type="text" placeholder="your title..." maxlength="50">
    <textarea id="contentID" maxlength="200" placeholder="your content..."></textarea>
    <button type="submit">ADD</button>
</div>
`
function statement() {
    console.log("hi")
    const addpost = document.getElementById("AddPost")
    addpost.addEventListener("click", function () {
        addpost.outerHTML = creatpost
    })
}