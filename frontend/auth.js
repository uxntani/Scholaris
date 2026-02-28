function showLogin() {
  loginToggle.classList.add('active');
  signupToggle.classList.remove('active');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
  welcomeText.textContent = 'Welcome Back!';
  hideMessages();
}

function showSignup() {
  signupToggle.classList.add('active');
  loginToggle.classList.remove('active');
  signupForm.classList.add('active');
  loginForm.classList.remove('active');
  welcomeText.textContent = 'Welcome to Scholaris!';
  hideMessages();
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.style.display = 'block';
}

function showSuccess(msg) {
  successMessage.textContent = msg;
  successMessage.style.display = 'block';
}

function hideMessages() {
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
}

// ==================== AUTH LOGIC ====================
async function handleLogin(e) {
  e.preventDefault();
  hideMessages();

  const email = loginEmail.value;
  const password = loginPassword.value;

  try {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }

    const data = await response.json();

    // 🔐 Store token
    localStorage.setItem("authToken", data.token);

    showSuccess("Login successful! Redirecting...");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);

  } catch (error) {
    showError(error.message);
  }
}

function handleSignup(e) {
  e.preventDefault();
  hideMessages();

  if (signupPassword.value !== signupConfirmPassword.value) {
    showError('Passwords do not match!');
    return;
  }

  showSuccess('Account created successfully!');
}

function handleForgotPassword(e) {
  e.preventDefault();
  hideMessages();
  showSuccess('Password reset link sent!');
}
