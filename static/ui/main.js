import { is } from "./api.js";
import { initauth } from "./auth.js";
import { navbar, sidebar } from "./components.js";

let isauth = await is()
if (!initauth){
initauth()
}else{
    // hna khss init websocket connection
    // wkhss list diel users
    let body = document.querySelector("body")
    body.appendChild(navbar())
}