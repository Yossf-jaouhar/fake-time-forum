const login = `
<body>

    <div class="login-container">
        <h2>Login</h2>
            <div class="input-group">
                <label for="email">Email:</label>
                <input type="email" id="email" placeholder="Enter your email">
                <span id="emailError" class="error-message">Please enter a valid email</span>
            </div>
            <div class="input-group">
                <label for="password">Password:</label>
                <input type="password" id="password" placeholder="Enter your password">
                <span class="toggle-password" onclick="togglePassword()">👁 Show</span>
                <span id="passwordError" class="error-message">Please enter your password</span>
            </div>
            <button type="submit" class="login-btn">Login</button>
    </div>
`
document.addEventListener("DOMContentLoaded", function () {
    
    const loginButton = document.getElementById("login");
    if (loginButton) {
        loginButton.addEventListener("click", function () {
            document.getElementById("home.css").href = "frontend/css/login.css";
            document.body.innerHTML = login;
        });
    }
});
