// ============================================
// login.js — frontend/static/js/login.js
// REQUIERE: config.js cargado antes en el HTML
// ============================================

function createDinoBackground() {
    const container = document.getElementById('dino-bg-container');
    if (!container) return;
    const dinoImages = [
        STATIC_BASE_URL + '/static/img/dinosauriof1.png',
        STATIC_BASE_URL + '/static/img/dinosauriof2.png',
        STATIC_BASE_URL + '/static/img/dinosauriof3.png',
        STATIC_BASE_URL + '/static/img/dinosauriof4.png',
        STATIC_BASE_URL + '/static/img/dinosauriof5.png',
        STATIC_BASE_URL + '/static/img/dinosauriof6.png',
        STATIC_BASE_URL + '/static/img/dinosauriof7.png',
        STATIC_BASE_URL + '/static/img/dinosauriof8.png',
        STATIC_BASE_URL + '/static/img/dinosauriof9.png'
    ];
    for (let i = 0; i < 18; i++) {
        const dinoDiv = document.createElement('div');
        dinoDiv.className = 'dino-bg';
        const img = document.createElement('img');
        img.src = dinoImages[Math.floor(Math.random() * dinoImages.length)];
        img.alt = 'Dinosaurio fondo';
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        dinoDiv.appendChild(img);
        dinoDiv.style.left = Math.random() * 100 + '%';
        dinoDiv.style.animationDuration = (15 + Math.random() * 20) + 's';
        dinoDiv.style.animationDelay = Math.random() * 15 + 's';
        dinoDiv.style.width = (40 + Math.random() * 60) + 'px';
        dinoDiv.style.height = 'auto';
        container.appendChild(dinoDiv);
    }
}

function showError(message) {
    let errorDiv = document.getElementById('loginError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'loginError';
        errorDiv.style.cssText = `
            background:#E74C3C;
            color:white;
            padding:12px;
            border-radius:60px;
            text-align:center;
            margin-top:1rem;
            display:flex;
            align-items:center;
            justify-content:center;
            gap:10px;
            animation: slideUp 0.3s ease;
        `;
        const form = document.getElementById('loginForm');
        if (form) form.appendChild(errorDiv);
    }
    errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span>${message}</span>`;
    errorDiv.style.display = 'flex';
    setTimeout(() => { if (errorDiv) errorDiv.style.display = 'none'; }, 3000);
}

function mostrarExito(mensaje) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.innerHTML = `
            <img src="${STATIC_BASE_URL}/static/img/huella.png" alt="Huella" class="success-icon">
            <span>${mensaje}</span>`;
        successDiv.classList.add('show');
        successDiv.style.display = 'block';
        const container = document.querySelector('.login-container');
        if (container) {
            container.style.transform = 'scale(0.98)';
            setTimeout(() => { container.style.transform = ''; }, 200);
        }
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    createDinoBackground();

    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Si ya hay usuario logueado, redirigir al index
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id) {
        mostrarExito("✅ Ya tienes una sesión activa");
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const identifier = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!identifier) { 
            showError("❌ Ingresa tu nombre de usuario o email"); 
            usernameInput.focus(); 
            return; 
        }
        if (!password) { 
            showError("❌ Ingresa tu contraseña"); 
            passwordInput.focus(); 
            return; 
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.innerHTML : 'Iniciar Sesión';
        if (submitBtn) { 
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Validando...'; 
            submitBtn.disabled = true; 
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier, password: password })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar usuario completo en localStorage
                const userData = {
                    id: data.id,
                    nombre: data.nombre,
                    username: data.username,
                    email: data.email
                };
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
                console.log('✅ Usuario logueado:', userData);
                
                mostrarExito("✅ ¡Inicio de sesión exitoso! Redirigiendo...");
                
                setTimeout(() => { 
                    window.location.href = 'index.html'; 
                }, 2000);
            } else {
                showError(data.detail || "❌ Usuario o contraseña incorrectos");
                passwordInput.value = '';
                passwordInput.focus();
                if (submitBtn) { 
                    submitBtn.innerHTML = originalText; 
                    submitBtn.disabled = false; 
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showError("❌ Error de conexión con el servidor");
            if (submitBtn) { 
                submitBtn.innerHTML = originalText; 
                submitBtn.disabled = false; 
            }
        }
    });

    // Limpiar errores al escribir
    [usernameInput, passwordInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                const err = document.getElementById('loginError');
                if (err) err.style.display = 'none';
            });
        }
    });
});