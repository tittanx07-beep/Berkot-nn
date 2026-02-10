// ========== BERKOT.JS - CON AVISOS VISIBLES ==========

// 🎯 AVISO 1: ARCHIVO CARGADO
alert("✅ berkot.js se cargó CORRECTAMENTE");

console.log("🚀 ===== BERKOT.JS INICIADO =====");

// ===== CONFIGURACIÓN =====
const BERKOT_CONFIG = {
    BIN_ID: "https://api.jsonbin.io/v3/b/698ba4da43b1c97be97508c3",  // REEMPLAZA CON TU ID
    ACCESS_KEY: "$2a$10$ZyT2m555Top/p79kUV6U2OKumygoxSTJM8cZY.T1EvXLxx5jWJ08K",  // REEMPLAZA CON TU KEY
    ADMIN_PASS: "Berkot2026"
};

// ===== AVISO VISIBLE EN PÁGINA =====
function mostrarAviso(texto, tipo = 'info') {
    const aviso = document.createElement('div');
    aviso.id = 'berkot-aviso-' + Date.now();
    aviso.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#27ae60' : tipo === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 99999;
        font-family: Arial, sans-serif;
        font-weight: bold;
        animation: slideIn 0.5s ease;
        max-width: 300px;
    `;
    
    aviso.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <div>${texto}</div>
        </div>
    `;
    
    document.body.appendChild(aviso);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        aviso.style.animation = 'slideOut 0.5s ease';
        setTimeout(() => aviso.remove(), 500);
    }, 5000);
}

// ===== ANIMACIONES CSS =====
const estilos = document.createElement('style');
estilos.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes parpadeo {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(estilos);

// ===== BOTÓN DE ESTADO =====
function crearBotonEstado() {
    const boton = document.createElement('button');
    boton.id = 'berkot-estado-btn';
    boton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #2c3e50;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 12px;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: parpadeo 2s infinite;
    `;
    
    boton.innerHTML = `
        <i class="fas fa-sync-alt"></i> Berkot Online
        <span id="berkot-estado" style="margin-left: 5px; color: #2ecc71;">●</span>
    `;
    
    boton.onclick = function() {
        verificarEstado();
    };
    
    document.body.appendChild(boton);
    
    // Actualizar estado cada 30 segundos
    setInterval(actualizarEstado, 30000);
}

// ===== VERIFICAR ESTADO =====
async function verificarEstado() {
    mostrarAviso('🔍 Verificando conexión con JSONBin...', 'info');
    
    try {
        const url = `https://api.jsonbin.io/v3/b/${BERKOT_CONFIG.BIN_ID}/latest`;
        const respuesta = await fetch(url, {
            headers: { "X-Access-Key": BERKOT_CONFIG.ACCESS_KEY }
        });
        
        if (respuesta.ok) {
            mostrarAviso('✅ Conectado a JSONBin.io', 'success');
            document.getElementById('berkot-estado').style.color = '#2ecc71';
            return true;
        } else {
            mostrarAviso('⚠️ Error de conexión', 'error');
            document.getElementById('berkot-estado').style.color = '#e74c3c';
            return false;
        }
    } catch (error) {
        mostrarAviso('❌ Sin conexión a internet', 'error');
        document.getElementById('berkot-estado').style.color = '#e74c3c';
        return false;
    }
}

function actualizarEstado() {
    verificarEstado().then(conectado => {
        const estado = document.getElementById('berkot-estado');
        if (estado) {
            estado.style.color = conectado ? '#2ecc71' : '#e74c3c';
            estado.title = conectado ? 'Conectado' : 'Desconectado';
        }
    });
}

// ===== SINCRONIZAR PRECIOS =====
async function sincronizarPrecios() {
    mostrarAviso('🔄 Sincronizando precios...', 'info');
    console.log("Sincronizando precios...");
    
    // Esperar a que storeData exista
    if (!window.storeData) {
        setTimeout(sincronizarPrecios, 1000);
        return;
    }
    
    try {
        const url = `https://api.jsonbin.io/v3/b/${BERKOT_CONFIG.BIN_ID}/latest`;
        const respuesta = await fetch(url, {
            headers: { "X-Access-Key": BERKOT_CONFIG.ACCESS_KEY }
        });
        
        if (!respuesta.ok) throw new Error("Error " + respuesta.status);
        
        const datos = await respuesta.json();
        console.log("Datos recibidos:", datos.record);
        
        // Actualizar precios
        if (datos.record && datos.record.products) {
            let actualizados = 0;
            
            datos.record.products.forEach(productoOnline => {
                const productoLocal = window.storeData.products?.find(p => p.id === productoOnline.id);
                if (productoLocal && productoLocal.basePrice !== productoOnline.basePrice) {
                    productoLocal.basePrice = productoOnline.basePrice;
                    actualizados++;
                    console.log(`Actualizado: ${productoLocal.name} = $${productoOnline.basePrice}`);
                }
            });
            
            // Refrescar página
            if (actualizados > 0) {
                if (window.applyStoreData) window.applyStoreData();
                if (window.renderProducts) window.renderProducts();
                mostrarAviso(`✅ ${actualizados} precios actualizados`, 'success');
            } else {
                mostrarAviso('📊 Precios ya están actualizados', 'info');
            }
        }
    } catch (error) {
        console.warn("Error sincronizando:", error);
        mostrarAviso('⚠️ Error sincronizando precios', 'error');
    }
}

// ===== GUARDAR EN LA NUBE =====
async function guardarEnLaNube() {
    const password = prompt("🔐 Contraseña admin para guardar en la nube:");
    if (password !== BERKOT_CONFIG.ADMIN_PASS) {
        alert("❌ Contraseña incorrecta");
        return false;
    }
    
    mostrarAviso('☁️ Subiendo precios a la nube...', 'info');
    
    try {
        const url = `https://api.jsonbin.io/v3/b/${BERKOT_CONFIG.BIN_ID}`;
        const respuesta = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Key": BERKOT_CONFIG.ACCESS_KEY
            },
            body: JSON.stringify(window.storeData)
        });
        
        if (respuesta.ok) {
            mostrarAviso('✅ Precios guardados para TODOS los clientes!', 'success');
            return true;
        } else {
            throw new Error("Error " + respuesta.status);
        }
    } catch (error) {
        mostrarAviso('❌ Error: ' + error.message, 'error');
        return false;
    }
}

// ===== AÑADIR BOTÓN AL PANEL ADMIN =====
function añadirBotonNube() {
    const buscarPanel = setInterval(() => {
        const panelAdmin = document.getElementById('adminPanel');
        if (panelAdmin) {
            clearInterval(buscarPanel);
            
            const botonNube = document.createElement('button');
            botonNube.className = 'admin-btn';
            botonNube.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
            botonNube.style.margin = '10px 0';
            botonNube.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> GUARDAR EN LA NUBE';
            
            botonNube.onclick = guardarEnLaNube;
            
            panelAdmin.appendChild(botonNube);
            console.log("✅ Botón 'Guardar en la nube' añadido");
        }
    }, 1000);
}

// ===== INICIALIZAR =====
function iniciarBerkotOnline() {
    console.log("🚀 Iniciando Berkot Online...");
    
    // 1. Crear botón de estado
    crearBotonEstado();
    
    // 2. Verificar conexión
    setTimeout(verificarEstado, 2000);
    
    // 3. Sincronizar precios
    setTimeout(sincronizarPrecios, 3000);
    
    // 4. Añadir botón al panel admin
    setTimeout(añadirBotonNube, 5000);
    
    // 5. Sincronizar automáticamente cada 2 minutos
    setInterval(sincronizarPrecios, 120000);
    
    // Hacer funciones disponibles globalmente
    window.BERKOT_CONFIG = BERKOT_CONFIG;
    window.sincronizarPrecios = sincronizarPrecios;
    window.guardarEnLaNube = guardarEnLaNube;
    
    console.log("✅ Berkot Online inicializado");
}

// ===== EJECUTAR =====

// AVISO 2: INICIANDO
console.log("🔄 Iniciando Berkot Online...");

// Esperar a que la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // AVISO 3: PÁGINA CARGADA
        console.log("📄 Página cargada, iniciando...");
        setTimeout(iniciarBerkotOnline, 1000);
    });
} else {
    // AVISO 4: YA CARGADA
    console.log("⚡ Página ya cargada, iniciando inmediatamente...");
    setTimeout(iniciarBerkotOnline, 1000);
}

// AVISO 5: FINAL
console.log("🎯 Berkot.js cargado y listo");
