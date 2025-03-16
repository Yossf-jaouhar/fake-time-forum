// import { registerfunc } from './register.js';


// const success = localStorage.getItem("success");

// if (success === "true") {
//     localStorage.removeItem("success");
// } else {
//     registerfunc();
// }


// document.addEventListener("DOMContentLoaded", function () {
//     statement()
// })

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
     overflow: auto;
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
    <p id="errortitle" style="color: red; display: none;   font-size: 15px;"></p>
    <textarea id="contentID" maxlength="200" placeholder="your content..."></textarea>
    <p id="errorcontent" style="color: red; display: none;   font-size: 15px;"></p>
    <button id="buttonAddPost" type="submit">ADD</button>
</div>
`
function statement() {
    const addpost = document.getElementById("AddPost")
    addpost.addEventListener("click",  function () {
        addpost.outerHTML = creatpost
        creat()
    })
}

function creat() {
    const creat = document.getElementById("buttonAddPost")
    if (creat) {
        creat.addEventListener("click", async function(){
            const title = document.getElementById("titleID")
            const errortitle = document.getElementById("errortitle")
            const errorcontent = document.getElementById("errorcontent")
            const content = document.getElementById("contentID")
            const titlevalue = title.value.trim()
            const contentvalue = content.value.trim()
            if (titlevalue.length > 50) {
                title.style.borderColor = "red";
                errortitle.style.display = "block";

                errortitle.textContent = "your title it most have 50 char"
                return 
            }
            if (contentvalue.length > 200) {
                content.style.border = "red"
                errorcontent.style.display = "block"
                errorcontent.textContent = "your content it most have 200 char"
                return
            }
            const postdata = {
                title: titlevalue,
                content: contentvalue
            }

            try {
                const response = await fetch("http://localhost:8080/addpost" , {
                    method : "POST",
                    headers : {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(postdata),
                })

                if (response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`)
                }

                const data = await response.json()
                if (data.success) {
                    window.location.href = "http://localhost:8080/";
                    return
                } else {
                    alert("it is failed");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
            
        });
    }
}