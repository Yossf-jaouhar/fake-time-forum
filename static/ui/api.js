export { register, login, is, loadPosts ,loadChat,loadComments}
import { toast } from "./chat.js";
import { post ,comment, msg} from "./components.js";
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
            console.log(response);
            toast(response)
            throw new Error(`HTTP Error: ${response.status} `);
        }
        if (response.ok) {
            renderMainPage()
            console.log("logged with succes")
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

async function loadPosts(id,Posts){        
    const resp = await fetch(`/fetchpost?start=${id}`).catch(err=>{toast(err)});
    const posts = await resp.json();
    posts?.forEach(pst => {
        Posts.append(post(pst))
    });
    const options = {
        root: document,
        threshold: 0.3,
      };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log(entry.target.id);
            observer.unobserve(entry.target);
            loadPosts(entry.target.id,Posts);
          }
        });
      }, options);
      observer.observe(Posts.lastChild)
}
async function loadChat(cid,id,chat){    
    console.log(`/fetchChat?with=${cid}&start=${id}`);
    const resp = await fetch(`/fetchChat?with=${cid}&start=${id}`).catch(err=>{toast(err)});    
    const Chat = await resp.json(); 
    let init =   chat.scrollHeight
    console.log(init);
    
    Chat?.forEach(mesg => {
       chat.prepend(msg(mesg,mesg.sender===cid))
    });

    chat.scrollTop= init
    if (id===0) {
        console.log("ytrtyui");
        
       chat.scrollTop =0 
    }
    const options = {
        root: document.querySelector('.mesages'),
        threshold: 1,
      };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            loadChat(cid,entry.target.id,chat);
          }
        });
      }, options);
      observer.observe(chat.firstChild)
}
async function loadComments(pid,id,Comments){    
    const resp = await fetch(`/fetchcomment?start=${id}&p_id=${pid}`);
    const cmts = await resp.json();
    cmts?.forEach(cmt => {
       Comments.append(msg(cmt,true))
    });
    const options = {
        root: Comments,
        threshold: 0.3,
      };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            loadComments(pid,entry.target.id,Comments);
          }
        });
      }, options);
      observer.observe(Comments.lastChild)
}