import { auth, chat, posts } from './api.js';
import { createElement, validateForm, formatDate, storage, debounce } from './utils.js';

class App {
    constructor() {
        this.container = document.getElementById('app-container');
        this.nav = document.getElementById('main-nav');
        this.init();
        
        // Listen for authentication required events
        window.addEventListener('auth:required', () => {
            this.showLoginForm();
        });
    }

    async init() {
        try {
            await this.checkAuth();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showLoginForm();
        }
    }

    async checkAuth() {
        try {
            const response = await auth.check();
            if (response.success) {
                this.showMainApp();
            } else {
                this.showLoginForm();
            }
        } catch (error) {
            this.showLoginForm();
        }
    }

    showLoginForm() {
        this.container.innerHTML = '';
        this.nav.innerHTML = '';
        
        const formContainer = createElement('div', { className: 'auth-container' }, []);
        
        const loginForm = createElement('form', { className: 'login-form' }, [
            createElement('h2', {}, ['Login']),
            createElement('input', { type: 'text', id: 'login', placeholder: 'Email', required: true }),
            createElement('input', { type: 'password', id: 'password', placeholder: 'Password', required: true }),
            createElement('button', { type: 'submit' }, ['Login'])
        ]);

        const switchButton = createElement('button', { 
            type: 'button',
            className: 'switch-form'
        }, ['Switch to Register']);

        // Bind the click event properly
        switchButton.addEventListener('click', () => {
            this.showRegisterForm();
        });

        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.handleLogin();
        };

        formContainer.appendChild(loginForm);
        formContainer.appendChild(switchButton);
        this.container.appendChild(formContainer);
    }

    showRegisterForm() {
        this.container.innerHTML = '';
        
        const formContainer = createElement('div', { className: 'auth-container' }, []);
        
        const registerForm = createElement('form', { className: 'register-form' }, [
            createElement('h2', {}, ['Register']),
            createElement('input', { type: 'text', id: 'nickname', placeholder: 'Nickname', required: true }),
            createElement('input', { type: 'number', id: 'age', placeholder: 'Age', required: true }),
            createElement('input', { type: 'text', id: 'gender', placeholder: 'Gender', required: true }),
            createElement('input', { type: 'text', id: 'first-name', placeholder: 'First Name', required: true }),
            createElement('input', { type: 'text', id: 'last-name', placeholder: 'Last Name', required: true }),
            createElement('input', { type: 'email', id: 'email', placeholder: 'Email', required: true }),
            createElement('input', { type: 'password', id: 'password', placeholder: 'Password', required: true }),
            createElement('button', { type: 'submit' }, ['Register'])
        ]);

        const switchButton = createElement('button', { 
            type: 'button',
            className: 'switch-form'
        }, ['Switch to Login']);

        // Bind the click event properly
        switchButton.addEventListener('click', () => {
            this.showLoginForm();
        });

        registerForm.onsubmit = async (e) => {
            e.preventDefault();
            await this.handleRegister();
        };

        formContainer.appendChild(registerForm);
        formContainer.appendChild(switchButton);
        this.container.appendChild(formContainer);
    }

    async handleLogin() {
        const login = document.getElementById('login').value;
        const password = document.getElementById('password').value;

        const validation = validateForm(
            { login, password },
            {
                login: [{ required: true, pattern: /^\w{3,}$/ }],
                password: [{ required: true, minLength: 6 }]
            }
        );

        if (!validation.isValid) {
            alert(Object.values(validation.errors).join('\n'));
            return;
        }

        try {
            const response = await auth.login({ login, password });
            console.log(response,"response");
            if (response=="login succesfull") {
            await   this.showMainApp();
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister() {
        const formData = {
            nickname: document.getElementById('nickname').value,
            age: document.getElementById('age').value,
            gender: document.getElementById('gender').value,
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        const validation = validateForm(formData, {
            nickname: [{ required: true, minLength: 3 }],
            age: [{ required: true }],
            gender: [{ required: true }],
            firstName: [{ required: true }],
            lastName: [{ required: true }],
            email: [{ required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }],
            password: [{ required: true, minLength: 6 }]
        });

        if (!validation.isValid) {
            alert(Object.values(validation.errors).join('\n'));
            return;
        }

        try {
            const response = await auth.register(formData);
            if (response === "register succesfull") {                
            await    this.showMainApp();
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    async showMainApp() {
        // Check authentication before showing main app
        if (!auth.isAuthenticated()) {
            this.showLoginForm();
            return;
        }

        this.container.innerHTML = '';
        this.setupNavigation();
        
        const mainContent = createElement('div', { className: 'main-content' }, [
            this.createChatSection(),
            this.createPostsSection()
        ]);
        
        this.container.appendChild(mainContent);
        
        this.initializeWebSocket();
        this.loadPosts();
    }

    setupNavigation() {
        this.nav.innerHTML = '';
        
        const logoutButton = createElement('button', {
            className: 'nav-button',
        }, ['Logout']);
        logoutButton.addEventListener('click', () => this.handleLogout());
        this.nav.appendChild(logoutButton);
    }

    async handleLogout() {
        try {
            await auth.logout();
            this.showLoginForm();
        } catch (error) {
            alert('Logout failed: ' + error.message);
        }
    }

    createChatSection() {
        return createElement('div', { className: 'chat-section' }, [
            createElement('div', { className: 'messages', id: 'messages' }, []),
            createElement('div', { className: 'chat-input' }, [
                createElement('input', {
                    type: 'text',
                    id: 'message-input',
                    placeholder: 'Type a message...'
                }),
                createElement('button', {
                    onclick: () => this.sendMessage()
                }, ['Send'])
            ])
        ]);
    }

    createPostsSection() {
        // Define static categories
        const staticCategories = [
            'Technology',
            'Lifestyle',
            'Gaming',
            'Sports',
            'Music',
            'Movies',
            'Food',
            'Travel',
            'Other'
        ];

        const postsSection = createElement('div', { className: 'posts-section' }, [
            createElement('div', { className: 'posts-list', id: 'posts-list' }, []),
            createElement('div', { className: 'post-input' }, [
                createElement('input', {
                    id: 'post-title',
                    type: 'text',
                    placeholder: 'Post title...',
                    className: 'post-title-input'
                }),
                createElement('textarea', {
                    id: 'post-content',
                    placeholder: 'Write your post...',
                    className: 'post-content-input'
                }),
                createElement('div', { 
                    className: 'categories-section',
                    id: 'categories-container'
                }, [
                    createElement('label', {}, ['Categories:']),
                    createElement('div', {
                        className: 'categories-bubbles',
                        id: 'post-categories'
                    }, staticCategories.map(category => {
                        const bubble = createElement('div', { 
                            className: 'category-bubble',
                            'data-category': category.toLowerCase()
                        }, [category]);
                        
                        bubble.onclick = () => {
                            bubble.classList.toggle('selected');
                        };
                        
                        return bubble;
                    })),
                    createElement('small', { className: 'categories-help' }, 
                        ['Click categories to select them']
                    )
                ]),
                createElement('button', {
                    onclick: () => this.createPost(),
                    className: 'create-post-btn'
                }, ['Create Post'])
            ])
        ]);
        
        return postsSection;
    }

    createPostElement(post) {
        return createElement('div', { className: 'post' }, [
            createElement('div', { className: 'post-header' }, [
                createElement('h2', { className: 'post-title' }, [post.title]),
                createElement('div', { className: 'post-meta' }, [
                    createElement('span', { className: 'post-author' }, [post.author]),
                    createElement('span', { className: 'post-date' }, [formatDate(post.date)])
                ])
            ]),
            createElement('div', { className: 'post-content' }, [post.content]),
            createElement('div', { className: 'post-categories' }, 
                (post.categories || []).map(category =>
                    createElement('span', { className: 'category-tag' }, [
                        category.charAt(0).toUpperCase() + category.slice(1)
                    ])
                )
            ),
            createElement('div', { className: 'post-actions' }, [
                createElement('button', {
                    onclick: () => this.toggleComments(post.id),
                    className: 'comments-toggle'
                }, ['Comments'])
            ]),
            createElement('div', {
                className: 'comments-section',
                id: `comments-${post.id}`
            }, [])
        ]);
    }

    initializeWebSocket() {
        // WebSocket implementation for real-time chat
        // This would be implemented based on your backend WebSocket setup
    }

    async sendMessage() {
        if (!auth.isAuthenticated()) {
            this.showLoginForm();
            return;
        }

        const input = document.getElementById('message-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        try {
            await chat.sendMessage({ content: message });
            input.value = '';
        } catch (error) {
            if (error.message === 'Please login to continue') {
                this.showLoginForm();
            } else {
                alert('Failed to send message: ' + error.message);
            }
        }
    }

    async loadPosts() {
        if (!auth.isAuthenticated()) {
            this.showLoginForm();
            return;
        }

        try {
            const response = await posts.fetch();
            const postsList = document.getElementById('posts-list');
            postsList.innerHTML = '';
            
            if (response.posts.length === 0) {
                postsList.appendChild(
                    createElement('div', { className: 'no-posts' }, [
                        'No posts found'
                    ])
                );
                return;
            }

            response.posts.forEach(post => {
                const postElement = this.createPostElement(post);
                postsList.appendChild(postElement);
            });
        } catch (error) {
            if (error.message === 'Please login to continue') {
                this.showLoginForm();
            } else {
                console.error('Failed to load posts:', error);
                const postsList = document.getElementById('posts-list');
                postsList.innerHTML = '';
                postsList.appendChild(
                    createElement('div', { className: 'error-message' }, [
                        'Failed to load posts. ',
                        createElement('button', {
                            onclick: () => this.loadPosts(),
                            className: 'retry-button'
                        }, ['Retry'])
                    ])
                );
            }
        }
    }

    async toggleComments(postId) {
        const commentsSection = document.getElementById(`comments-${postId}`);
        if (commentsSection.children.length === 0) {
            try {
                const response = await posts.comments.fetch(postId);
                response.comments.forEach(comment => {
                    const commentElement = this.createCommentElement(comment);
                    commentsSection.appendChild(commentElement);
                });
            } catch (error) {
                console.error('Failed to load comments:', error);
            }
        } else {
            commentsSection.innerHTML = '';
        }
    }

    createCommentElement(comment) {
        return createElement('div', { className: 'comment' }, [
            createElement('div', { className: 'comment-header' }, [
                createElement('span', { className: 'comment-author' }, [comment.author]),
                createElement('span', { className: 'comment-date' }, [formatDate(comment.date)])
            ]),
            createElement('div', { className: 'comment-content' }, [comment.content])
        ]);
    }

    async createPost() {
        if (!auth.isAuthenticated()) {
            this.showLoginForm();
            return;
        }

        const titleInput = document.getElementById('post-title');
        const contentInput = document.getElementById('post-content');
        const selectedCategories = Array.from(
            document.querySelectorAll('.category-bubble.selected')
        ).map(bubble => bubble.dataset.category);
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        // Validate inputs
        if (!title) {
            alert('Please enter a title for your post');
            return;
        }
        if (!content) {
            alert('Please enter content for your post');
            return;
        }
        if (selectedCategories.length === 0) {
            alert('Please select at least one category');
            return;
        }
        
        try {
            await posts.add({ title, content, categories: selectedCategories });
            // Clear inputs after successful post
            titleInput.value = '';
            contentInput.value = '';
            // Unselect all categories
            document.querySelectorAll('.category-bubble.selected')
                .forEach(bubble => bubble.classList.remove('selected'));
            this.loadPosts();
        } catch (error) {
            if (error.message === 'Please login to continue') {
                this.showLoginForm();
            } else {
                alert('Failed to create post: ' + error.message);
            }
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
});
