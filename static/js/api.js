// API endpoints
const API = {
    auth: {
        check: '/auth',
        login: '/sign-in',
        register: '/signup',
        logout: '/logout'
    },
    chat: {
        messages: '/chat',
    },
    
    posts: {
        fetch: '/fetchpost',
        add: '/addpost',
        comments: {
            fetch: '/fetchcomment',
            add: '/addComment'
        }
    }
};

// Authentication state
let isAuthenticated = false;

// API call wrapper with error handling
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include' // Important: This ensures cookies are sent with requests
        });
        // Handle 403 Unauthorized responses
        if (response.status === 403) {
            isAuthenticated = false;
            // Redirect to login if unautorized
            window.dispatchEvent(new CustomEvent('auth:required'));
            throw new Error('Please login to continue');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data);
        }

        return data;
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

// Auth API functions
export const auth = {
    check: async () => {
        try {
            await apiCall(API.auth.check, { method: 'GET' });
            isAuthenticated = true;
            return { success: true };
        } catch (error) {
            isAuthenticated = false;
            throw error;
        }
    },

    login: async (credentials) => {
        const response = await apiCall(API.auth.login, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        isAuthenticated = true;
        return response;
    },

    register: async (userData) => {
        // Transform the data to match backend expectations
        const transformedData = {
            username: userData.nickname, // Map nickname to username
            email: userData.email,
            password: userData.password,
            age: userData.age,
            firstName: userData.firstName,
            lastName: userData.lastName,
            gender: userData.gender,
            nickname: userData.nickname
        };
        
        const response = await apiCall(API.auth.register, {
            method: 'POST',
            body: JSON.stringify(transformedData)
        });
        return response;
    },

    logout: async () => {
        try {            
            const response = await apiCall(API.auth.logout, { 
                method: 'POST',
            });
            isAuthenticated = false;
            return response;
        } catch (error) {
            isAuthenticated = false;
            throw error;
        }
    },

    // Helper method to check if user is authenticated
    isAuthenticated: () => isAuthenticated
};

export const chat = {
    getMessages: () => apiCall(API.chat.messages, { method: 'GET' }),
    sendMessage: (message) => apiCall(API.chat.messages, {
        method: 'POST',
        body: JSON.stringify(message)
    })
};

// Posts API functions
export const posts = {
    fetch: () => apiCall(API.posts.fetch, { method: 'GET' }),
    add: (post) => apiCall(API.posts.add, {
        method: 'POST',
        body: JSON.stringify({
            title: post.title,
            content: post.content,
            categories: post.categories
        })
    }),
    comments: {
        fetch: (postId) => apiCall(`${API.posts.comments.fetch}?post_id=${postId}`, {
            method: 'GET'
        }),
        add: (comment) => apiCall(API.posts.comments.add, {
            method: 'POST',
            body: JSON.stringify(comment)
        })
    }    
}; 