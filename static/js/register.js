
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

