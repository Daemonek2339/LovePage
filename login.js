// login.js (Obsługa logowania na index.html)
document.addEventListener('DOMContentLoaded', () => {
    const PASSWORD = "2024-02-14";
    const loginBtn = document.getElementById('login-btn');
    const hintBtn = document.getElementById('hint-btn');
    const hintText = document.getElementById('hint-text');
    const passwordInput = document.getElementById('password-input');
    const loginScreen = document.getElementById('login-screen');
    const errorMsg = document.getElementById('error-msg');
    let errorTimer = null;

    function authenticate() {
        // trim(): klawiatury w telefonach lubią dopisać spację na końcu
        if (passwordInput.value.trim() === PASSWORD) {
            loginScreen.classList.add('hidden');
            setTimeout(() => {
                window.location.href = "main.html";
            }, 1000);
        } else {
            errorMsg.classList.remove('hidden');
            passwordInput.style.borderBottomColor = '#ff3366';
            clearTimeout(errorTimer);
            errorTimer = setTimeout(() => {
                errorMsg.classList.add('hidden');
                passwordInput.style.borderBottomColor = '#ff2a85';
            }, 2000);
        }
    }

    loginBtn.addEventListener('click', authenticate);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') authenticate();
    });

    // Pokazywanie/ukrywanie podpowiedzi
    hintBtn.addEventListener('click', () => {
        hintText.classList.toggle('hidden');
        hintBtn.classList.toggle('active');
    });
});