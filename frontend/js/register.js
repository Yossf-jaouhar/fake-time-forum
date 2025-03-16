const register = `
<style>
    body {
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f4f4f4;
        margin: 0;
    }
    .container {
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        width: 300px;
        text-align: center;
    }
    h2 {
        margin-bottom: 20px;
    }
    .input-group {
        margin-bottom: 15px;
        text-align: left;
    }
    .input-group label {
        display: block;
        font-weight: bold;
        margin-bottom: 5px;
    }
    .input-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    button {
        width: 100%;
        padding: 10px;
        background: #007BFF;
        border: none;
        color: white;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
    }
    button:hover {
        background: #0056b3;
    }
</style>

<div class="container">
    <h2>Register</h2>
    <div class="input-group">
        <label for="username">Username</label>
        <input type="text" id="username" name="username" required>
    </div>
    <div class="input-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
    </div>
    <div class="input-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
    </div>
    <div class="input-group">
        <label for="confirm-password">Confirm Password</label>
        <input type="password" id="confirm-password" name="confirm-password" required>
    </div>
    <div class="input-group">
        <label for="age">Age</label>
        <input type="number" id="age" name="age" required>
    </div>
    <div class="input-group">
        <label for="first-name">First Name</label>
        <input type="text" id="first-name" name="first-name" required>
    </div>
    <div class="input-group">
        <label for="last-name">Last Name</label>
        <input type="text" id="last-name" name="last-name" required>
    </div>
    <div class="input-group">
        <label for="gender">Gender</label>
        <select id="gender" name="gender" required>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
        </select>
    </div>
    <div class="input-group">
        <label for="nickname">Nickname</label>
        <input type="text" id="nickname" name="nickname">
    </div>
    <button type="submit">Register</button>
</div>

`

export function registerfunc() {
    document.body.innerHTML = register;
    setupRegisterEvent();
}

const registerButton = document.getElementById("register");

if (registerButton) {
    registerButton.addEventListener("click", function () {
        document.body.innerHTML = register;
        setupRegisterEvent();
    });
}

function setupRegisterEvent() {
    const registerBtn = document.querySelector("button[type='submit']");
    if (registerBtn) {
        registerBtn.addEventListener("click", async function (event) {
            event.preventDefault();  // Prevent form submission

            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();
            const confirmPassword = document.getElementById("confirm-password").value.trim();
            const age = document.getElementById("age").value.trim();
            const firstName = document.getElementById("first-name").value.trim();
            const lastName = document.getElementById("last-name").value.trim();
            const gender = document.getElementById("gender").value;
            const nickname = document.getElementById("nickname").value.trim();

            // username.trim() 
            if (!username || username.length < 3) {
                alert("Username must be at least 3 characters long.");
                return;
            }
            if (!email.includes("@") || email.length < 5) {
                alert("Please enter a valid email.");
                return;
            }
            if (password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            if (!age || isNaN(age) || age < 18) {
                alert("Age must be a number and at least 18.");
                return;
            }
            if (!firstName || !lastName) {
                alert("First and Last Name are required.");
                return;
            }

            const registerData = {
                username: username,
                email: email,
                password: password,
                age: age,
                firstName: firstName,
                lastName: lastName,
                gender: gender,
                nickname: nickname,
            };

            try {
                const response = await fetch("http://localhost:8080/sign-up", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(registerData),
                });
                
                
                
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    localStorage.setItem("success", data.success);
                    window.location.href = "http://localhost:8080/";
                    return
                } else {
                    alert(data.message || "Registration failed.");
                }
            } catch (error) {
                console.error("Error:", error);
                alert("An error occurred. Please try again later.");
            }
        });
    }

}

