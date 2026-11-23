// ============================================
// menu-usuario.js — frontend/static/js/menu-usuario.js
// REQUIERE: config.js cargado antes en el HTML
// MENÚ DINÁMICO: cambia según estado de login
// ============================================

function actualizarMenuUsuario() {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdown = document.getElementById('userDropdown');
    const userNameSpan = document.getElementById('userNameDisplay');
    
    if (!userMenuTrigger || !userDropdown) return;

    // Obtener usuario actual del localStorage
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    if (currentUser && currentUser.id) {
        // ========== USUARIO LOGUEADO ==========
        // Mostrar nombre del usuario
        if (userNameSpan) {
            userNameSpan.textContent = currentUser.nombre || currentUser.username || 'Usuario';
        }
        
        // Opciones para usuario logueado
        userDropdown.innerHTML = `
            <a href="perfil.html">
                <i class="fas fa-user-circle"></i> 
                <span>Mi Perfil</span>
            </a>
            <hr>
            <a href="#" id="logoutBtn">
                <i class="fas fa-sign-out-alt"></i> 
                <span>Cerrar Sesión</span>
            </a>
        `;
        
        // Evento para cerrar sesión
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Limpiar localStorage
                localStorage.removeItem('currentUser');
                localStorage.removeItem('favorites');
                
                // Mostrar mensaje de cierre de sesión
                showToast('👋 ¡Hasta luego! Has cerrado sesión');
                
                // Redirigir al login después de 1 segundo
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            });
        }
    } else {
        // ========== USUARIO NO LOGUEADO ==========
        if (userNameSpan) {
            userNameSpan.textContent = '';
        }
        
        // Opciones para usuario no logueado
        userDropdown.innerHTML = `
            <a href="login.html">
                <i class="fas fa-sign-in-alt"></i> 
                <span>Iniciar Sesión</span>
            </a>
            <hr>
            <a href="registro.html">
                <i class="fas fa-user-plus"></i> 
                <span>Registrarse</span>
            </a>
        `;
    }
}

// Función auxiliar para mostrar mensajes temporales
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #2D4A22;
        color: white;
        padding: 12px 24px;
        border-radius: 30px;
        font-size: 0.9rem;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
        font-family: 'Poppins', sans-serif;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// Escuchar cambios en localStorage (para cuando se loguea desde otra pestaña)
window.addEventListener('storage', function(e) {
    if (e.key === 'currentUser') {
        actualizarMenuUsuario();
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const userDropdown = document.getElementById('userDropdown');
    
    if (!userMenuTrigger || !userDropdown) {
        console.warn('Menú de usuario no encontrado en esta página');
        return;
    }

    // Actualizar menú según estado actual
    actualizarMenuUsuario();

    // Toggle dropdown al hacer click
    userMenuTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
    });
    
    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (!userMenuTrigger.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
    
    // Evitar que el dropdown se cierre al hacer click dentro
    userDropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
});