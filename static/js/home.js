document.addEventListener('DOMContentLoaded', () => {
    // Function to check if the user is authenticated
    async function checkAuthStatus() {
        try {
            const response = await fetch('/auth', {
                method: 'GET',
            });

            if (response.ok) {
                // If user is authenticated, show the main app
                displayMainApp();
            } else {
                // If not authenticated, show the login/register form
                displayLoginRegisterForm();
            }
        } catch (error) {
            console.error("Error checking authentication status:", error);
        }
    }

    // Display the login/register form
    function displayLoginRegisterForm() {
        const body = document.body;
        const registrationContainer = document.createElement('div');
        registrationContainer.id = 'registration-container';
        registrationContainer.classList.add('registration-container');
        body.appendChild(registrationContainer);

        const fields = [
            { id: 'nickname', placeholder: 'Nickname' },
            { id: 'age', placeholder: 'Age', type: 'number' },
            { id: 'gender', placeholder: 'Gender', type: 'text' },
            { id: 'first-name', placeholder: 'First Name' },
            { id: 'last-name', placeholder: 'Last Name' },
            { id: 'email', placeholder: 'E-mail', type: 'email' },
            { id: 'password', placeholder: 'Password', type: 'password' },
        ];

        // Create input fields for registration
        fields.forEach(field => {
            const input = document.createElement('input');
            input.id = field.id;
            input.type = field.type || 'text';
            input.placeholder = field.placeholder;
            registrationContainer.appendChild(input);
        });

        const registerButton = document.createElement('button');
        registerButton.id = 'register';
        registerButton.textContent = 'Register';
        registrationContainer.appendChild(registerButton);

        const loginButton = document.createElement('button');
        loginButton.id = 'login';
        loginButton.textContent = 'Login';
        registrationContainer.appendChild(loginButton);

        // Event listeners for login and register actions
        registerButton.addEventListener('click', handleRegistration);
        loginButton.addEventListener('click', handleLogin);
    }

    // Display the main chat and posts interface
    function displayMainApp() {
        const body = document.body;

        // Create Chat Container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-container';
        body.appendChild(chatContainer);

        const messagesContainer = document.createElement('div');
        messagesContainer.id = 'messages';
        messagesContainer.classList.add('messages');
        chatContainer.appendChild(messagesContainer);

        const messageInput = document.createElement('input');
        messageInput.id = 'message-input';
        messageInput.type = 'text';
        messageInput.placeholder = 'Type a message...';
        chatContainer.appendChild(messageInput);

        const sendMessageButton = document.createElement('button');
        sendMessageButton.id = 'send-message';
        sendMessageButton.textContent = 'Send';
        chatContainer.appendChild(sendMessageButton);

        // Create Posts Container
        const postsContainer = document.createElement('div');
        postsContainer.id = 'posts-container';
        postsContainer.classList.add('posts-container');
        body.appendChild(postsContainer);

        const postList = document.createElement('div');
        postList.id = 'post-list';
        postsContainer.appendChild(postList);

        const newPostInput = document.createElement('input');
        newPostInput.id = 'new-post-input';
        newPostInput.type = 'text';
        newPostInput.placeholder = 'Write a post...';
        postsContainer.appendChild(newPostInput);

        const addPostButton = document.createElement('button');
        addPostButton.id = 'add-post';
        addPostButton.textContent = 'Post';
        postsContainer.appendChild(addPostButton);
    }

    // Handle registration logic
    async function handleRegistration() {
        const registrationData = {
            nickname: document.getElementById('nickname').value.trim(),
            age: document.getElementById('age').value.trim(),
            gender: document.getElementById('gender').value.trim(),
            firstName: document.getElementById('first-name').value.trim(),
            lastName: document.getElementById('last-name').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim(),
        };

        // Check if all fields are filled
        for (let key in registrationData) {
            if (!registrationData[key]) {
                alert(`${key} is required!`);
                return;
            }
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData),
            });

            const data = await response.json();

            if (data.success) {
                alert("Registration successful!");
                checkAuthStatus();
            } else {
                alert("Registration failed: " + data.message);
            }
        } catch (error) {
            console.error("Registration error:", error);
        }
    }

    // Handle login logic
    async function handleLogin() {
        const username = document.getElementById('nickname')?.value.trim() || document.getElementById('email');
        const password = document.getElementById('password').value.trim();

        if (username && password) {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (data.success) {
                    alert("Login successful!");
                    checkAuthStatus();
                } else {
                    alert("Login failed: " + data.message);
                }
            } catch (error) {
                console.error("Login error:", error);
            }
        }
    }
    checkAuthStatus();
});
