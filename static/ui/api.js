export { register, login, is, loadPosts, loadChat, loadComments }
import { toast } from "./chat.js";
import { post, msg, comment } from "./components.js";
import { renderMainPage } from "./render.js";
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
            toast({ err: response.statusText, code: response.status })
            throw new Error(`HTTP Error: ${response.status}`);
        }
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
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
            toast({ err: response.statusText, code: response.status })

            console.log(response);
            throw new Error(`HTTP Error: ${response.status} `);
        }
        if (response.ok) {
            renderMainPage()
            toast({ err: "logged with succes", code: 200 })
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

async function loadPosts(id, Posts) {
    const resp = await fetch(`/fetchpost?start=${id}`);
    const posts = await resp.json();
    posts?.forEach(pst => {
        Posts.append(post(pst))
    });
    if (Posts.lastChild) {
        const options = {
            root: document,
            threshold: 0.3,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    if (entry.target.id !== id) {
                        loadPosts(entry.target.id, Posts);
                    }
                }
            });
        }, options);
        observer.observe(Posts.lastChild)
    }
}
export async function Categories() {
    let resp = await fetch('/categories')
    let cats = await resp.json()
    return cats
}
async function loadChat(cid, id, chat) {
    const resp = await fetch(`/fetchChat?with=${cid}&start=${id}`);
    const Chat = await resp.json();
    let before = chat.scrollHeight
    for (let index = 0; index < Chat?.length; index++) {
        const mesg = Chat[index];
        chat.prepend(msg(mesg, mesg.sender === cid))
    }

    chat.scrollTop = chat.scrollHeight - before
    if (chat.firstChild) {
        const options = {
            root: document.querySelector('.mesages'),
            threshold: 1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    if (entry.target.id !== id) {
                        loadChat(cid, entry.target.id, chat);
                    }
                }
            });
        }, options);
        observer.observe(chat.firstChild)
    }

}
async function loadComments(pid, id, Comments) {
    const resp = await fetch(`/fetchcomment?start=${id}&p_id=${pid}`);
    const cmts = await resp.json();
    cmts?.forEach(cmt => {
        Comments.append(comment(cmt))
    });
    if (Comments.lastChild) {
        const options = {
            root: Comments,
            threshold: 0.3,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);
                    if (entry.target.id !== id) {
                        loadComments(pid, entry.target.id, Comments);
                    }
                }
            });
        }, options);
        observer.observe(Comments.lastChild)
    }
}