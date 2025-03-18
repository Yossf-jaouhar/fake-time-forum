// DOM helper functions
export const createElement = (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    
    return element;
};

// Form validation
export const validateForm = (formData, rules) => {
    const errors = {};
    
    Object.entries(rules).forEach(([field, validations]) => {
        const value = formData[field];
        
        validations.forEach(validation => {
            if (validation.required && !value) {
                errors[field] = `${field} is required`;
            }
            if (validation.minLength && value.length < validation.minLength) {
                errors[field] = `${field} must be at least ${validation.minLength} characters`;
            }
            if (validation.pattern && !validation.pattern.test(value)) {
                errors[field] = `${field} format is invalid`;
            }
        });
    });
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Date formatting
export const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
};

// Local storage wrapper
export const storage = {
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};

// Event debouncer
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}; 