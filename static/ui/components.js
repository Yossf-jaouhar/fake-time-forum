export { auth, comment, post, postinput, sidebar, navbar ,userBubble,persoChat}
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
let comment = (comment) => `<div class="comment">
    <div class="comment-header">
        <span class="comment-author">${comment.sender}</span>
        <span class="comment-date">${comment.date}</span>
    </div>
    <div class="comment-content">
        <p>${comment.content}</p>
    </div>
                </div>`
let post = (post) => `<div class="forum-post">
                            <div class="post-header">
                                <div class="post-author">
                                    <div class="post-avatar">JD</div>
                                    <div class="post-name">${post.author}</div>
                                </div>
                                <div class="post-date">${post.date}</div>
                            </div>
                            <div class="post-content">
                                <p>${post.content}</p>
                            </div>
                            <div class="post-categories">
                            ${post.categories.forEach(cat => {
    let diva = document.createElement("div")
    diva.classList.add("post-action")
    diva.textContent = cat
})}
                            </div>
                            </div>
                            <div class="post-comments">
                            </div>
                </div>`
let postinput = (categories) => `<div class="post-form-container">
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
                </div>`
let userBubble = (uData, personalChat) => {
    let uBuble = document.createElement('bubble')
    uBuble.id = uData.name
    if (uData.active) { uBuble.classList.add(on) }
    uBuble.textContent = uData.name
    uBuble.onClick(() => {
        personalChat.id = uData.name
        personalChat.classList.add("shown")
    })
    return uBuble
}
let persoChat = (ws) => {
    let pChat = document.createElement('chat')
    let chat = document.createElement('messages')
    // Create input field
    let input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type a message...';
    input.classList.add('chat-input');
    // Create cancel button
    let cancel = document.createElement('button');
    cancel.textContent = 'Close';
    cancel.classList.add('cancel');
    // Append everything to the chat container
    pChat.append(cancel, chat, input);
    cancel.onclick = () => {
        pChat.classList.remove('shown');
        chat.innerHTML = "";
        input.value = "";
    };
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && input.value.trim() !== "") {
            let msg = document.createElement('msg');
            msg.classList.add('messageSent');
            let data = input.value.trim()
            msg.textContent = data;
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send({
                    type: "message",
                    reciever: pChat.id,
                    content: data
                });
            }
            input.value = "";
        } else if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send({
                type: "signal",
                reciever: pChat.id,
                content: "typing"
            });
        }
    });
    return pChat
}
let sidebar = (users) => `<div class="sidebar">
                    <div class="sidebar-header">
                        <h2>Users</h2>
                    </div>
                    <div class="sidebar-content">
                        <ul class="user-list">
                            ${users.map(user => `
                                <li class="user-item ${user.active ? 'active' : ''}">
                                    <div class="user-avatar-item">CR7</div>
                                    <div class="user-details">
                                        <div class="user-name">${user.name}</div>
                                        <div class="user-status">${user.active ? 'online' : 'offline'}</div>
                                    </div>
                                    <div class="user-online-status ${user.active ? 'online' : 'offline'}"></div>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>`
let navbar = () => document.createRange().createContextualFragment(`<div class="navbar">
        <div class="logo">Connect</div>
        <div class="nav-links">
            <a href="#">Posts</a>
            <a href="#">Chats</a>
        </div>
                </div>`).firstElementChild