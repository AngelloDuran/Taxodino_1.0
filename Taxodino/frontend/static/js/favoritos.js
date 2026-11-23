// ============================================
// favoritos.js — frontend/static/js/favoritos.js
// REQUIERE: config.js cargado antes en el HTML
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarFavoritos();
});

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================

function getUsuarioId() {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    return user ? user.id : null;
}

// ============================================
// TOGGLE FAVORITO — llamado desde dinosaurio.js y favoritos.js
// Guarda en BD si hay usuario logueado, sino solo en localStorage
// ============================================

async function toggleFavoriteDB(dinoId, button) {
    const usuarioId = getUsuarioId();
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const esFavorito = favorites.includes(dinoId);

    if (esFavorito) {
        // Quitar de favoritos
        const newFavs = favorites.filter(id => id !== dinoId);
        localStorage.setItem('favorites', JSON.stringify(newFavs));
        if (button) button.classList.remove('active');

        if (usuarioId) {
            try {
                await fetch(`${API_BASE_URL}/api/v1/favorites/${usuarioId}/${dinoId}`, {
                    method: 'DELETE'
                });
            } catch (e) {
                console.warn('No se pudo eliminar de BD, solo de localStorage:', e);
            }
        }
        showToast('❌ Eliminado de favoritos');
    } else {
        // Agregar a favoritos
        favorites.push(dinoId);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        if (button) button.classList.add('active');

        if (usuarioId) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/v1/favorites/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_id: usuarioId,
                        dinosaurio_id: dinoId
                    })
                });
                if (!res.ok) {
                    const err = await res.json();
                    // Si ya existe en BD no es un error grave
                    if (err.detail !== 'Ya está en favoritos') {
                        console.warn('Error al guardar en BD:', err.detail);
                    }
                }
            } catch (e) {
                console.warn('No se pudo guardar en BD, solo en localStorage:', e);
            }
        } else {
            showToast('⚠️ Inicia sesión para guardar favoritos en tu cuenta');
        }
        showToast('❤️ Agregado a favoritos');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
        background:#2D4A22;color:white;padding:10px 20px;border-radius:30px;
        z-index:9999;font-size:0.9rem;pointer-events:none;
        box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ============================================
// CARGAR FAVORITOS EN LA PÁGINA DE FAVORITOS
// Primero intenta desde BD, luego desde localStorage
// ============================================

async function cargarFavoritos() {
    const grid = document.getElementById('dinosaursGrid');
    if (!grid) return;

    const usuarioId = getUsuarioId();

    // Si hay usuario logueado, sincronizar BD → localStorage
    if (usuarioId) {
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/favorites/${usuarioId}`);
            if (res.ok) {
                const favsBD = await res.json();
                // Sincronizar localStorage con BD
                const ids = favsBD.map(f => f.dinosaurio_id);
                localStorage.setItem('favorites', JSON.stringify(ids));
            }
        } catch (e) {
            console.warn('No se pudo sincronizar favoritos desde BD:', e);
        }
    }

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (favorites.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;">
                <i class="fas fa-heart-broken" style="font-size:3rem;color:#E67E22;margin-bottom:1rem;display:block;"></i>
                <h3>No tienes favoritos aún</h3>
                <p>Explora dinosaurios y guarda tus favoritos ❤️</p>
                ${!usuarioId ? '<p style="color:#E67E22;margin-top:0.5rem;font-size:0.9rem;"><i class="fas fa-info-circle"></i> Inicia sesión para guardar favoritos en tu cuenta</p>' : ''}
                <a href="index.html" style="display:inline-block;margin-top:1rem;padding:10px 24px;background:#E67E22;color:white;border-radius:30px;text-decoration:none;font-weight:600;">
                    <i class="fas fa-search"></i> Explorar dinosaurios
                </a>
            </div>`;
        return;
    }

    grid.innerHTML = '<div class="loading-spinner" style="grid-column:1/-1;text-align:center;padding:2rem;"><i class="fas fa-dragon fa-spin" style="font-size:2rem;color:#E67E22;"></i><p>Cargando tus favoritos...</p></div>';

    try {
        const dinosaurios = [];
        for (const dinoId of favorites) {
            const res = await fetch(`${API_BASE_URL}/api/v1/dinosaurs/${dinoId}`);
            if (res.ok) dinosaurios.push(await res.json());
        }
        renderFavoritos(dinosaurios);
    } catch (error) {
        console.error('Error cargando favoritos:', error);
        grid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1;text-align:center;">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar</h3>
                <p>Intenta nuevamente más tarde</p>
            </div>`;
    }
}

// ============================================
// RENDER DE TARJETAS EN FAVORITOS
// ============================================

function renderFavoritos(dinosaurios) {
    const grid = document.getElementById('dinosaursGrid');
    if (!grid) return;

    if (dinosaurios.length === 0) {
        grid.innerHTML = `
            <div class="no-results" style="grid-column:1/-1;text-align:center;">
                <i class="fas fa-heart-broken"></i>
                <h3>No se encontraron dinosaurios</h3>
            </div>`;
        return;
    }

    grid.innerHTML = dinosaurios.map(dino => `
        <div class="dino-card">
            <img class="dino-image"
                 src="${dino.imagen_url || 'https://placehold.co/600x400/2D4A22/white?text=Dinosaurio'}"
                 alt="${escapeHtml(dino.nombre)}"
                 onerror="this.src='https://placehold.co/600x400/2D4A22/white?text=Dinosaurio'">
            <div class="dino-info">
                <h3 class="dino-name">${escapeHtml(dino.nombre)}</h3>
                <p class="dino-scientific">${escapeHtml(dino.nombre_cientifico || '')}</p>
                <div class="dino-details">
                    ${dino.dieta  ? `<span class="dino-badge"><i class="fas fa-drumstick-bite"></i> ${escapeHtml(dino.dieta)}</span>`  : ''}
                    ${dino.periodo? `<span class="dino-badge"><i class="fas fa-clock"></i> ${escapeHtml(dino.periodo)}</span>` : ''}
                </div>
                <p class="dino-description">${escapeHtml((dino.descripcion || '').substring(0, 120))}...</p>
                <div class="dino-footer">
                    <button class="favorite-btn active"
                            onclick="quitarFavorito(${dino.id}, this)">
                        <i class="fas fa-heart"></i>
                    </button>
                    <a href="index.html" class="dino-link">
                        Ver en inicio <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// QUITAR FAVORITO DESDE LA PÁGINA DE FAVORITOS
// ============================================

async function quitarFavorito(dinoId, button) {
    await toggleFavoriteDB(dinoId, button);

    // Animar y quitar la card
    const card = button ? button.closest('.dino-card') : null;
    if (card) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.remove();
            const grid = document.getElementById('dinosaursGrid');
            if (grid && grid.querySelectorAll('.dino-card').length === 0) {
                grid.innerHTML = `
                    <div class="no-results" style="grid-column:1/-1;text-align:center;padding:3rem;">
                        <i class="fas fa-heart-broken" style="font-size:3rem;color:#E67E22;margin-bottom:1rem;display:block;"></i>
                        <h3>No tienes favoritos aún</h3>
                        <a href="index.html" style="display:inline-block;margin-top:1rem;padding:10px 24px;background:#E67E22;color:white;border-radius:30px;text-decoration:none;font-weight:600;">
                            <i class="fas fa-search"></i> Explorar dinosaurios
                        </a>
                    </div>`;
            }
        }, 300);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}