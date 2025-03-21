export { register, login, is, loadPosts }
import { post } from "./components.js";
var id = 0
async function register(registerData, loginTab, loginForm, registerTab, registerForm) {
    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(registerData),
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        console.log(response.ok)
        if (response.ok) {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            return
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
    }
}
async function login(loginData) {
    try {
        const response = await fetch("/sign-in", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        if (response.ok) {
            console.log("loggedwith succes")
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
const is = async () => {
    try {
        let resp = await fetch('/auth')
        return resp.ok
    } catch (error) {
        return false
    }

}

async function loadPosts(){
    const resp = await fetch(`/fetchpost?lastpost=${id}`);
    const posts = await resp.json();
    console.log(posts)

    return posts
    }