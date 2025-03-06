const login = `
<body>
    <div class="login-container">
        <h2>Login</h2>
            <div id="emailpassword">
                <div id="inputemail" class="input-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" placeholder="Enter your email">
                    <span id="emailError" class="error-message">Please enter a valid email</span>
                </div>
                <div id="inputpassword" class="input-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" placeholder="Enter your password">
                    <span class="toggle-password" onclick="togglePassword()">👁 Show</span>
                    <span id="passwordError" class="error-message">Please enter your password</span>
                </div>
            </div>
            <button type="submit" id="loginbtn" class="login-btn">Login</button>
    </div>
`

document.addEventListener("DOMContentLoaded", function () {
    
    const loginButton = document.getElementById("login")
    if (loginButton) {
        loginButton.addEventListener("click", function () {
            document.getElementById("home.css").href = "frontend/css/login.css"
            document.body.innerHTML = login
            setupLoginEvent()
        })
       
    }

    

   

})

function setupLoginEvent() {
    const loginBtn = document.getElementById("loginbtn");
    if (loginBtn) {
        console.log("hhhhhhhhhh")
        loginBtn.addEventListener("click", function (event) {
            event.preventDefault(); 
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email.includes("@") || email.length < 5) {
                document.getElementById("emailError").style.display = "block";
            } else {
                document.getElementById("emailError").style.display = "none";
            }

            if (password.length < 6) {
                document.getElementById("passwordError").style.display = "block";
            } else {
                document.getElementById("passwordError").style.display = "none";
            }

            console.log("Email:", email);
            console.log("Password:", password);
        });
    }
}
