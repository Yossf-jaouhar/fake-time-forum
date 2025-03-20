import { auth } from "./components.js";
import { register, login } from "./api.js";
export{initauth}
function initauth(){
let ctr = document.querySelector(".container")
let authdiv = document.createElement("div") 
authdiv.innerHTML= auth()
ctr.appendChild(authdiv)
const loginTab = authdiv.querySelector('#login-tab');
const registerTab = authdiv.querySelector('#register-tab');
const loginForm = authdiv.querySelector('#login-form');
const registerForm = authdiv.querySelector('#register-form');

loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
});

const registerFormElement = authdiv.querySelector('#register-form');
registerFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = authdiv.querySelector("#email").value.trim();
    const password = authdiv.querySelector("#password").value.trim();
    const age = authdiv.querySelector("#age").value.trim();
    const firstName = authdiv.querySelector("#first-name").value.trim();
    const lastName = authdiv.querySelector("#last-name").value.trim();
    const gender = authdiv.querySelector("#gender").value;
    const nickname = authdiv.querySelector("#nickname").value.trim();
    const registerData = {
        email: email,
        password: password,
        age: age,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        nickname: nickname,
    };
    register(registerData, loginTab, loginForm, registerTab, registerForm)
});

const loginFormElement = authdiv.querySelector('#login-form');
loginFormElement.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value
    const loginData = {
        login: email,
        password: password
    };
    login(loginData)
});
}