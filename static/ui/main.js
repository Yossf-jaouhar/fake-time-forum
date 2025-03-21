import { is, loadPosts } from "./api.js";
import { initauth } from "./auth.js";
import { navbar, sidebar } from "./components.js";

let isauth = await is()

if (!isauth){
initauth()
}else{
    // hna khss init websocket connection
    // wkhss list diel users
    loadPosts()
    let body = document.querySelector("body")
    body.appendChild(navbar())
}