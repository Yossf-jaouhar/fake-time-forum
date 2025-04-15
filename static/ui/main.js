import { Categories, is } from "./api.js";
import { initauth } from "./auth.js";
import { renderMainPage } from "./render.js";

let isauth = await is()

if (!isauth) {
    initauth()
} else {
    renderMainPage()  
}
