document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            console.log("Logging in with:", { email, password });

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                if (response.ok) {
                    alert("Login successful!");
                    // Redirect user to dashboard or another page after login
                    window.location.href = "/dashboard.html";
                } else {
                    const errorMessage = await response.text();
                    alert("Login failed: " + errorMessage);
                }
            } catch (error) {
                console.error("Error logging in:", error);
                alert("An error occurred during login.");
            }
        });
    }
});
