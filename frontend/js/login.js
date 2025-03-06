const login = `
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
.login-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 300px;
    text-align: center;
}
.login-container h2 {
    margin-bottom: 20px;
}
.input-group {
    margin-bottom: 15px;
    text-align: left;
}
.input-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}
.input-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
}
.toggle-password {
    cursor: pointer;
    font-size: 14px;
    color: blue;
    margin-top: 5px;
    display: block;
}
.login-btn {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
}
.login-btn:hover {
    background-color: #218838;
}
.error-message {
    color: red;
    font-size: 14px;
    display: none;
}

</style>
<body>

    <div class="login-container">
        <h2>Login</h2>
        <form id="loginForm">
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
        </form>
    </div>
`
document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.getElementById("login");
    if (loginButton) {
        loginButton.addEventListener("click", function () {
            document.body.innerHTML = login;
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();


        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        console.log(email, password)

        if (!email || !password) {
            return;
        }


        const userData = {
            email: email,
            password: password
        };


        try {
            const response = await fetch("http://localhost:8080/sign-in", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();


        } catch (error) {
            console.error(error);

        }
    });
});
