// ============================================
// registro.js — frontend/static/js/registro.js
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

// ============================================
// VALIDACIÓN DE CONTRASEÑA
// ============================================
function checkPasswordStrength(password) {
    const requirements = {
        mayuscula: /[A-Z]/.test(password),
        minuscula: /[a-z]/.test(password),
        numero:    /[0-9]/.test(password),
        especial:  /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        longitud:  password.length >= 8
    };

    function updateReq(id, isValid) {
        const el = document.getElementById(id);
        if (!el) return;
        const icon = el.querySelector('i');
        if (isValid) {
            el.className = 'valid';
            if (icon) icon.className = 'fas fa-check-circle';
        } else if (password.length === 0) {
            el.className = 'neutral';
            if (icon) icon.className = 'fas fa-circle';
        } else {
            el.className = 'invalid';
            if (icon) icon.className = 'fas fa-times-circle';
        }
    }

    updateReq('req-mayuscula', requirements.mayuscula);
    updateReq('req-minuscula', requirements.minuscula);
    updateReq('req-numero',    requirements.numero);
    updateReq('req-especial',  requirements.especial);
    updateReq('req-longitud',  requirements.longitud);

    return Object.values(requirements).every(Boolean);
}

function checkPasswordsMatch(password, confirmPassword) {
    const matchMessage = document.getElementById('matchMessage');
    if (!matchMessage) return false;
    if (confirmPassword === '') {
        matchMessage.innerHTML = '';
        matchMessage.className = 'password-match-message';
        return false;
    }
    if (password === confirmPassword) {
        matchMessage.innerHTML = '<i class="fas fa-check-circle"></i> Las contraseñas coinciden';
        matchMessage.className = 'password-match-message match-success';
        return true;
    } else {
        matchMessage.innerHTML = '<i class="fas fa-times-circle"></i> Las contraseñas no coinciden';
        matchMessage.className = 'password-match-message match-error';
        return false;
    }
}

function mostrarError(mensaje) {
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.cssText = `
        position:fixed;
        bottom:20px;
        right:20px;
        background:#e74c3c;
        color:white;
        padding:12px 24px;
        border-radius:8px;
        z-index:1000;
        font-size:14px;
        box-shadow:0 2px 10px rgba(0,0,0,0.2);
        max-width:350px;
        white-space:pre-line;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function mostrarExito(mensaje) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.innerHTML = `
            <img src="${STATIC_BASE_URL}/static/img/huella.png" alt="Huella" class="success-icon">
            <span>${mensaje}</span>
        `;
        successDiv.classList.add('show');
        successDiv.style.display = 'block';
        const container = document.querySelector('.register-container');
        if (container) {
            container.style.transform = 'scale(0.98)';
            setTimeout(() => { container.style.transform = ''; }, 200);
        }
    }
}

// ============================================
// REGISTRO Y LOGIN AUTOMÁTICO
// ============================================
async function registrarYLogin(nombre, username, email, password) {
    try {
        // 1. Registrar usuario
        const registerResponse = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, username, email, password })
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
            throw new Error(registerData.detail || registerData.message || "Error en el registro");
        }

        console.log('✅ Registro exitoso:', registerData);

        // 2. Iniciar sesión automáticamente
        const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: username, password: password })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
            // Guardar usuario en localStorage
            const userData = {
                id: loginData.id,
                nombre: loginData.nombre,
                username: loginData.username,
                email: loginData.email
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            console.log('✅ Login automático exitoso:', userData);
            return { success: true, message: "Registro y login exitoso" };
        } else {
            return { success: false, message: "Registro exitoso, pero no se pudo iniciar sesión automáticamente" };
        }
    } catch (error) {
        console.error('Error en registro/login:', error);
        return { success: false, message: error.message };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const form          = document.getElementById('registroForm');
    const passwordInput = document.getElementById('password');
    const confirmInput  = document.getElementById('confirmPassword');

    // Si ya hay usuario logueado, redirigir al index
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id) {
        mostrarExito("✅ Ya tienes una sesión activa");
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    if (!form) { 
        console.error('Formulario de registro no encontrado'); 
        return; 
    }

    createDinoBackground();

    // Inicializar requisitos en neutral
    document.querySelectorAll('.password-requirements li').forEach(req => {
        req.className = 'neutral';
        const icon = req.querySelector('i');
        if (icon) icon.className = 'fas fa-circle';
    });

    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            checkPasswordStrength(this.value);
            if (confirmInput && confirmInput.value !== '') {
                checkPasswordsMatch(this.value, confirmInput.value);
            }
        });
    }
    if (confirmInput) {
        confirmInput.addEventListener('input', function() {
            if (passwordInput) checkPasswordsMatch(passwordInput.value, this.value);
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nombre          = document.getElementById('nombre')?.value.trim() || '';
        const username        = document.getElementById('username')?.value.trim() || '';
        const email           = document.getElementById('email')?.value.trim() || '';
        const password        = passwordInput?.value || '';
        const confirmPassword = confirmInput?.value || '';

        // Validaciones
        if (nombre.length < 2) {
            mostrarError("El nombre debe tener al menos 2 letras.");
            document.getElementById('nombre')?.focus();
            return;
        }
        if (username.length < 3) {
            mostrarError("El nombre de usuario debe tener al menos 3 caracteres.");
            document.getElementById('username')?.focus();
            return;
        }
        if (!email.includes('@') || !email.includes('.')) {
            mostrarError("Correo electrónico no válido.");
            document.getElementById('email')?.focus();
            return;
        }
        if (!checkPasswordStrength(password)) {
            mostrarError("La contraseña no cumple con los requisitos.");
            passwordInput?.focus();
            return;
        }
        if (password !== confirmPassword) {
            mostrarError("Las contraseñas no coinciden.");
            confirmInput?.focus();
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : 'Registrar';
        if (submitBtn) { 
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'; 
            submitBtn.disabled = true; 
        }

        // Registrar y hacer login automático
        const result = await registrarYLogin(nombre, username, email, password);

        if (result.success) {
            mostrarExito("✅ ¡Registro exitoso! Redirigiendo al inicio...");
            form.reset();
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            mostrarError(result.message || "Error en el registro");
            if (submitBtn) { 
                submitBtn.textContent = originalText; 
                submitBtn.disabled = false; 
            }
        }
    });
});

// Agregar animación si no existe
if (!document.querySelector('#dino-animation-style')) {
    const style = document.createElement('style');
    style.id = 'dino-animation-style';
    style.textContent = `
        @keyframes slideIn { 
            from { transform: translateX(100%); opacity: 0; } 
            to { transform: translateX(0); opacity: 1; } 
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}