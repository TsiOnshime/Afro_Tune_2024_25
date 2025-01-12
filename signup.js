document.addEventListener("DOMContentLoaded", () => {
    // Email page logic
    if (document.getElementById("nextEmail")) {
      // Load email from localStorage if available
      const savedEmail = localStorage.getItem("email");
      if (savedEmail) {
        document.getElementById("email").value = savedEmail;
      }
  
      document.getElementById("nextEmail").addEventListener("click", () => {
        const email = document.getElementById("email").value;
        const emailError = document.getElementById("emailError");
  
        if (!email) {
          emailError.textContent = "Email is required!";
        } else if (!validateEmail(email)) {
          emailError.textContent = "Please enter a valid email!";
        } else {
          localStorage.setItem("email", email); // Store email in localStorage
          emailError.textContent = "";
          window.location.href = "createpassword.html"; // Redirect to password page
        }
      });
    }
  
    // Password page logic
    if (document.getElementById("nextPassword")) {
      // Load password from localStorage if available
      const savedPassword = localStorage.getItem("password");
      if (savedPassword) {
        document.getElementById("password").value = savedPassword;
      }
  
      document.getElementById("nextPassword").addEventListener("click", () => {
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const passwordError = document.getElementById("passwordError");
        const confirmPasswordError = document.getElementById("confirmPasswordError");
  
        if (!password || password.length < 8) {
          passwordError.textContent = "Password must be at least 8 characters!";
        } else if (password !== confirmPassword) {
          confirmPasswordError.textContent = "Passwords do not match!";
        } else {
          localStorage.setItem("password", password); // Store password in localStorage
          passwordError.textContent = "";
          confirmPasswordError.textContent = "";
          window.location.href = "info.html"; // Redirect to info page
        }
      });
    }
  
    // Info page logic
    if (document.getElementById("submitInfo")) {
      document.getElementById("submitInfo").addEventListener("click", async () => {
        const name = document.getElementById("name").value;
        const dob = document.getElementById("dob").value;
        const gender = document.querySelector('input[name="gender"]:checked');
        const nameError = document.getElementById("nameError");
        const dobError = document.getElementById("dobError");
        const genderError = document.getElementById("genderError");
  
        let valid = true;
  
        if (!name) {
          nameError.textContent = "Name is required!";
          valid = false;
        } else {
          nameError.textContent = "";
        }
  
        if (!dob) {
          dobError.textContent = "Date of birth is required!";
          valid = false;
        } else {
          dobError.textContent = "";
        }
  
        if (!gender) {
          genderError.textContent = "Gender is required!";
          valid = false;
        } else {
          genderError.textContent = "";
        }
  
        if (valid) {
          // Gather all data and make API request
          const data = {
            email: localStorage.getItem("email"),
            userPassword: localStorage.getItem("password"),
            fullName: name,
            dateOfBirth: dob,
            gender: gender.value
          };
  
          await registerUser(data);
        }
      });
    }
  });
  
  // Function to validate email format
  function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Function to make API call to register user
  async function registerUser(data) {
    try {
      const response = await fetch("http://localhost:3006/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        alert("Registration successful!");
        window.location.href = "login.html"; // Redirect to login page after successful registration
      } else {
        alert("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("An error occurred during registration.");
    }
  }
  