import { is, loadPosts } from "./api.js";
import { initauth } from "./auth.js";
import { navbar, sidebar, post } from "./components.js";

let isauth = await is()

if (!isauth){
initauth()
}else{
    // hna khss init websocket connection
    // wkhss list diel users
    let posts = await loadPosts()
    let body = document.querySelector("body")
    let contentarea = document.createElement("div")
    let postsctr = document.createElement("div")
    postsctr.classList.add("forum-posts")
    contentarea.classList.add("content-area")
    posts.forEach(pst => {
        postsctr.appendChild(post(pst))
    });
    contentarea.appendChild(postsctr)
    body.appendChild(navbar())
    body.appendChild(contentarea)
}