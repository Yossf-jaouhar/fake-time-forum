import { loadChat, loadComments } from "./api.js";
import { initauth } from "./auth.js";
import { toast } from "./chat.js";

export { auth, comment, post, postinput, header, userBubble, persoChat, msg }
let auth = () => `<div class="tabs">
            <div class="tab active" id="login-tab">Login</div>
            <div class="tab" id="register-tab">Register</div>
        </div>
        
        <div class="tab-content">
            <form id="login-form">
                <div class="form-group">
                    <label for="login-username">Username or Email</label>
                    <input type="text" id="login-username" required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit">Login</button>
            </form>
            
            <form id="register-form" class="hidden">
                <div class="form-group">
                    <label for="nickname">Nickname</label>
                    <input type="text" id="nickname" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstname">First Name</label>
                        <input type="text" id="first-name" required>
                    </div>
                    <div class="form-group">
                        <label for="lastname">Last Name</label>
                        <input type="text" id="last-name" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="gender">Gender</label>
                        <select id="gender" required>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="age">Age</label>
                        <input type="text" id="age" pattern="[0-9]+" required>
                    </div>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit">Register</button>
            </form>
                </div>`
let comment = (comment) => {
    let cmment = document.createElement('div')
    cmment.classList.add('comment')
    cmment.id=comment.id
    cmment.innerHTML = `
    <div class="comment-header">
        <span class="comment-author">${comment.user}</span>
        <span class="comment-date">${time(comment.created_at)}</span>
    </div>
    <div class="comment-content">
        <p>${comment.content}</p>
    </div>
                `
    return cmment
}

function post(postData) {
    // Extract initials for avatar
    const nameParts = postData.publisher.split(' ');
    const initials = nameParts.map(part => part[0]).join('').toUpperCase();

    // Format categories
    const categoriesHTML = postData.categories?.map(category =>
        `<div class="category">${category}</div>`
    ).join('');

    // Create post HTML
    const postHTML = `<div class="post-container">
                        <div class="publisher">
                            <div class="avatar">${initials}</div>
                            <div class="name">${postData.publisher}</div>
                        </div>
                        <div class="post-title">${postData.title}</div>
                        <div class="post-createdAt">${time(postData.date_creation)}
                        <div class="post-content">${postData.content}</div>
                        <div class="categories">
                          ${categoriesHTML ? categoriesHTML : ""}
                        </div>
                        </div>
                    `;
    let cmtsArea = document.createElement('div')
    cmtsArea.classList.add('comment-holder','hide')
    let comments = document.createElement('div')
    comments.classList.add('comment-list')
    cmtsArea.append(comments)
    let commentIN = document.createElement('input')

    commentIN.classList.add('comment-input')
    cmtsArea.append(commentIN)
    commentIN.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && commentIN.value.trim() !== "") {
            let cmt = commentIN.value.trim()
            try {
                const response = await fetch('/addComment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        comment: cmt,
                        postid: postData.id
                    })
                });

                if (!response.ok) {
                    toast({ err: "faile to add comment", code: response.status })
                    throw new Error(`Server error: ${response}`);
                }
                const result = await response.json();            
                comments.prepend(comment({content:cmt,created_at:Date.now(),user:result.user}))
                commentIN.value = "";
            } catch (error) {
                console.error(error);
            }
        }
    })
    loadComments(postData.id, 0, comments)
    let post = document.createElement('div')
    post.classList.add('post')
    let show = document.createElement('button')
    show.innerText = "comments"
    post.id = postData.id
    post.innerHTML = postHTML
    post.append(cmtsArea)
    post.append(show)
    show.addEventListener('click', () => {
cmtsArea.classList.toggle('hide')
    })
    return post;
}
function postinput(categories) {
    // Create a container div and set innerHTML
    const container = document.createElement('div');
    container.innerHTML = `<div class="post-form-container">
                    <h2 class="form-title">Create New Post</h2>
                    <form id="postForm">
                        <div class="form-group">
                            <label for="post-title">Post Title</label>
                            <input 
                                type="text" 
                                id="post-title" 
                                name="title" 
                                placeholder="Enter a title for your post"
                                required
                            >
                        </div>
                        <div class="form-group">
                            <label for="post-content">Post Content</label>
                            <textarea 
                                id="post-content" 
                                name="content" 
                                placeholder="Write your post content here..."
                                required
                            ></textarea>
                        </div>
                        <div class="form-group">
                            <label>Categories</label>
                            <div class="categories-container">
                                <div class="categories-grid">
                                    ${categories.map(cat => `
                                        <div class="category-option">
                                            <input type="checkbox" id="category-${cat}" name="categories" value="${cat}">
                                            <label for="category-${cat}">${cat}</label>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <button type="submit" class="submit-button">Publish Post</button>
                    </form>
                </div>`;

    // Get the actual form element from within the container
    const form = container.querySelector('#postForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = form.querySelector('#post-title').value.trim();
        const content = form.querySelector('#post-content').value.trim();

        const selectedCategories = Array.from(
            form.querySelectorAll('input[name="categories"]:checked')
        ).map(input => input.value);

        const postData = {
            title,
            content,
            categories: selectedCategories
        };

        try {
            const response = await fetch('/addpost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            if (!response.ok) {
                toast({ err: "faile to add post", code: response.status })
                throw new Error(`Server error: ${response}`);
            }
            const result = await response.json();
            postData.id = result.id
            postData.publisher = result.publisher
            form.querySelector('#post-content').value = ""
            form.querySelector('#post-title').value= ""
            Array.from(
                form.querySelectorAll('input[name="categories"]:checked')
            ).forEach(input => {input.checked =false})
            document.querySelector('.posts').prepend(post(postData))
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    });

    return container.firstElementChild;
}
let userBubble = (uData, personalChat) => {
    let uBuble = document.createElement('div')
    const msgs = document.querySelector('.messages')
    uBuble.id = uData.name
    uBuble.dataset.time = uData.time
    uBuble.classList.add("user")
    let indecator = document.createElement('div')
    indecator.classList.add('typing-indicator')
    indecator.innerHTML = `<span></span><span></span><span></span>`
    if (uData.state) { uBuble.classList.add('on') }
    uBuble.innerHTML = `<p>${uData.name}</p>`
    uBuble.append(indecator)
    uBuble.addEventListener('click', () => {
        msgs.innerHTML = ""
        uBuble.classList.remove('note')
        personalChat.id = uData.name
        personalChat.classList.add("show")
        loadChat(uData.name, 0, msgs)
    })
    return uBuble
}
let msg = (msg, received) => {
    let is = 'sent'
    if (received) {
        is = 'received'
    }
    let mesg = document.createElement('div')
    mesg.classList.add('message', is)
    mesg.id = msg.id
    mesg.innerHTML = `
<div class="author">
    <div class="avatar">
        ${received ? msg.sender.split(" ").map(e => e[0]).join("") : "Y"}
    </div>
    <div class="name">
        ${received ? msg.sender : "You"}
    </div>
    <div class="time">
        ${time(msg.sent_at)}
    </div>
</div>
<div class="content">
    ${msg.content}
</div>
`
    return mesg
}
let persoChat = (ws) => {
    let pChat = document.createElement('div')
    pChat.classList.add('chatholder')
    let chat = document.createElement('div')
    chat.classList.add('messages')
    // Create input field
    let input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    input.classList.add('chat-input');
    let cancel = document.createElement('button');
    cancel.textContent = 'Close';
    cancel.classList.add('cancel');
    pChat.append(cancel, chat, input);
    cancel.onclick = () => {
        pChat.classList.remove('show');
        chat.innerHTML = "";
        pChat.id=""
        input.value = "";
    };
    let can = true

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== "") {
            let data = input.value.trim()
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "message",
                    reciever: pChat.id,
                    content: data
                }));
            }
            input.value = "";
        } else if (ws && ws.readyState === WebSocket.OPEN && can) {
            can = false
            setTimeout(() => { can = true }, 1000)
            ws.send(JSON.stringify({
                type: "signal",
                reciever: pChat.id,
                content: "typing"
            }));
        }
    });
    return pChat
}
export function time(inputDate) {
    const date = new Date(inputDate);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = [
        { label: 'y', seconds: 31536000 },
        { label: 'mo', seconds: 2592000 },
        { label: 'w', seconds: 604800 },
        { label: 'd', seconds: 86400 },
        { label: 'h', seconds: 3600 },
        { label: 'min', seconds: 60 },
        { label: 's', seconds: 1 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label} ago`;
        }
    }

    return 'just now';
}

let header = () => {
    let header = document.createElement('header')
    let logout = document.createElement('button')
    logout.innerText = "logout"
    logout.addEventListener('click', () => {
        window.dispatchEvent(new Event('logout'))
        fetch('/logout', { method: "POST" }).then(() => {
            initauth()
        }).catch(err => {
            throw err
        })
    })
    let spe = document.createElement('div')
    spe.innerText = "fake-time forum"
    header.appendChild(spe)
    header.appendChild(logout)
    return header
}
