// ========== BERKOT.JS - CON DIAGNÓSTICO AUTOMÁTICO ==========

console.log("🚀 ===== BERKOT.JS INICIADO =====");

// ===== CONFIGURACIÓN =====
// ⚠️ REEMPLAZA CON TUS DATOS REALES ⚠️
const BERKOT_CONFIG = {
    // TU Bin ID de JSONBin (solo el ID, ejemplo: "67a1b2c3d4e5f67890123456")
    BIN_ID: "698bb5e6d0ea881f40b08b3f",
    
    // TU Access Key de JSONBin (ejemplo: "$2a$10$AbCdEfGhIjKlMnOpQrStUv")
    ACCESS_KEY: "$2a$10$kCE3/fq2JB928OPxvj1tlOPvv9VQf4.NmndkYnXaJ3oda7obH4.lm",
    
    // Contraseña admin
    ADMIN_PASS: "Berkot2026",
    
    // Mostrar configuración actual (para debug)
    mostrarConfig() {
        console.log("📋 Configuración actual:");
        console.log("- Bin ID:", this.BIN_ID);
        console.log("- Access Key:", this.ACCESS_KEY ? "✅ Definida" : "❌ Faltante");
        console.log("- Bin ID válido:", this.BIN_ID.length > 10 ? "✅" : "❌");
        console.log("- Access Key válida:", this.ACCESS_KEY.startsWith('$2a$') ? "✅" : "❌");
    }
};

// ===== MOSTRAR ESTADO INICIAL =====
BERKOT_CONFIG.mostrarConfig();

// Verificar si las credenciales están configuradas
if (!BERKOT_CONFIG.BIN_ID || BERKOT_CONFIG.BIN_ID === "PEGA_TU_BIN_ID_AQUI") {
    alert("⚠️ BERKOT.JS NO CONFIGURADO\n\nPor favor:\n1. Abre berkot.js en GitHub\n2. Cambia BIN_ID y ACCESS_KEY\n3. Usa tus datos reales de JSONBin.io");
    console.error("❌ ERROR: Berkout.js no configurado. Usa datos reales.");
}

// ===== NOTIFICACIONES VISIBLES =====
function mostrarNotificacion(mensaje, tipo = 'info', tiempo = 5000) {
    // Crear contenedor si no existe
    let contenedor = document.getElementById('berkot-notificaciones');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'berkot-notificaciones';
        contenedor.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            max-width: 350px;
        `;
        document.body.appendChild(contenedor);
    }
    
    // Crear notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        background: ${tipo === 'success' ? '#27ae60' : 
                     tipo === 'error' ? '#e74c3c' : 
                     tipo === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideInRight 0.3s ease;
        font-family: Arial, sans-serif;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    // Icono según tipo
    let icono = 'info-circle';
    if (tipo === 'success') icono = 'check-circle';
    if (tipo === 'error') icono = 'exclamation-circle';
    if (tipo === 'warning') icono = 'exclamation-triangle';
    
    notificacion.innerHTML = `
        <i class="fas fa-${icono}" style="font-size: 20px;"></i>
        <div>${mensaje}</div>
    `;
    
    contenedor.appendChild(notificacion);
    
    // Auto-eliminar
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, tiempo);
}

// ===== VERIFICAR CONEXIÓN =====
async function verificarConexionJsonBin() {
    console.log("🔍 Verificando conexión con JSONBin...");
    
    // Verificar credenciales
    if (!BERKOT_CONFIG.BIN_ID || BERKOT_CONFIG.BIN_ID === "PEGA_TU_BIN_ID_AQUI") {
        mostrarNotificacion('❌ Falta configurar BIN_ID en berkot.js', 'error');
        return false;
    }
    
    if (!BERKOT_CONFIG.ACCESS_KEY || BERKOT_CONFIG.ACCESS_KEY === "PEGA_TU_ACCESS_KEY_AQUI") {
        mostrarNotificacion('❌ Falta configurar ACCESS_KEY en berkot.js', 'error');
        return false;
    }
    
    try {
        const url = `https://api.jsonbin.io/v3/b/${BERKOT_CONFIG.BIN_ID}/latest`;
        console.log("URL:", url);
        
        const respuesta = await fetch(url, {
            headers: { 
                "X-Access-Key": BERKOT_CONFIG.ACCESS_KEY,
                "Content-Type": "application/json"
            }
        });
        
        console.log("Respuesta:", respuesta.status, respuesta.statusText);
        
        if (respuesta.ok) {
            const datos = await respuesta.json();
            console.log("✅ Conexión exitosa:", datos);
            mostrarNotificacion(`✅ Conectado a JSONBin (${datos.record?.products?.length || 0} productos)`, 'success');
            return datos.record;
        } else {
            let mensajeError = `Error ${respuesta.status}: `;
            
            switch(respuesta.status) {
                case 401: mensajeError += "Access Key incorrecta"; break;
                case 403: mensajeError += "Sin permisos para este Bin"; break;
                case 404: mensajeError += "Bin ID no existe"; break;
                case 429: mensajeError += "Límite de peticiones excedido"; break;
                default: mensajeError += "Error desconocido";
            }
            
            console.error("❌ Error conexión:", mensajeError);
            mostrarNotificacion(`❌ ${mensajeError}`, 'error');
            return false;
        }
    } catch (error) {
        console.error("❌ Error de red:", error);
        mostrarNotificacion('❌ Error de red o sin conexión a internet', 'error');
        return false;
    }
}

// ===== SINCRONIZAR PRECIOS =====
async function sincronizarPrecios() {
    console.log("🔄 Sincronizando precios...");
    
    // Verificar conexión primero
    const datosOnline = await verificarConexionJsonBin();
    
    if (!datosOnline || !window.storeData) {
        console.log("No se pudo sincronizar");
        return;
    }
    
    // Actualizar precios si hay datos nuevos
    if (datosOnline.products && window.storeData.products) {
        let cambios = 0;
        
        datosOnline.products.forEach(prodOnline => {
            const prodLocal = window.storeData.products.find(p => p.id === prodOnline.id);
            if (prodLocal && prodLocal.basePrice !== prodOnline.basePrice) {
                console.log(`📊 Actualizando ${prodLocal.name}: $${prodLocal.basePrice} → $${prodOnline.basePrice}`);
                prodLocal.basePrice = prodOnline.basePrice;
                cambios++;
            }
        });
        
        if (cambios > 0) {
            // Actualizar interfaz
            if (window.applyStoreData) window.applyStoreData();
            if (window.renderProducts) window.renderProducts();
            
            mostrarNotificacion(`✅ ${cambios} precios actualizados desde la nube`, 'success');
            console.log(`${cambios} precios actualizados`);
        } else {
            mostrarNotificacion('📊 Precios ya están sincronizados', 'info');
        }
    }
}

// ===== GUARDAR EN LA NUBE =====
async function guardarEnLaNube() {
    if (!window.storeData) {
        mostrarNotificacion('❌ No hay datos para guardar', 'error');
        return;
    }
    
    // Pedir contraseña
    const password = prompt("🔐 Contraseña admin (Berkot2026):");
    if (password !== BERKOT_CONFIG.ADMIN_PASS) {
        mostrarNotificacion('❌ Contraseña incorrecta', 'error');
        return;
    }
    
    mostrarNotificacion('☁️ Guardando en la nube...', 'info');
    
    try {
        const url = `https://api.jsonbin.io/v3/b/${BERKOT_CONFIG.BIN_ID}`;
        const respuesta = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Access-Key": BERKOT_CONFIG.ACCESS_KEY,
                "X-Bin-Versioning": "false"
            },
            body: JSON.stringify(window.storeData)
        });
        
        if (respuesta.ok) {
            mostrarNotificacion('✅ ¡Precios guardados para TODOS los clientes!', 'success', 8000);
            
            // Mostrar cambios
            console.log("📋 Precios guardados:");
            window.storeData.products.forEach(p => {
                console.log(`- ${p.name}: $${p.basePrice}`);
            });
        } else {
            throw new Error(`Error ${respuesta.status}`);
        }
    } catch (error) {
        mostrarNotificacion(`❌ Error guardando: ${error.message}`, 'error');
    }
}

// ===== PANEL DE CONTROL VISIBLE =====
function crearPanelControl() {
    const panel = document.createElement('div');
    panel.id = 'berkot-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 70px;
        left: 20px;
        background: rgba(44, 62, 80, 0.95);
        color: white;
        padding: 15px;
        border-radius: 15px;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        min-width: 250px;
        backdrop-filter: blur(10px);
    `;
    
    panel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <strong style="color: #3498db;">☁️ Berkot Online</strong>
            <span id="berkot-status" style="color: #e74c3c;">●</span>
        </div>
        
        <div style="margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                <i class="fas fa-database" style="color: #9b59b6;"></i>
                <span id="berkot-bin-info">Bin: No configurado</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-key" style="color: #f39c12;"></i>
                <span id="berkot-key-info">Key: No configurada</span>
            </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button id="berkot-sync-btn" style="
                background: #3498db;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                flex: 1;
            ">
                <i class="fas fa-sync-alt"></i> Sincronizar
            </button>
            
            <button id="berkot-test-btn" style="
                background: #2ecc71;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                flex: 1;
            ">
                <i class="fas fa-wifi"></i> Probar
            </button>
        </div>
        
        <div style="margin-top: 10px; font-size: 11px; color: #95a5a6; text-align: center;">
            <i class="fas fa-info-circle"></i> Los cambios se verán en todos los dispositivos
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Actualizar info
    const actualizarInfo = () => {
        document.getElementById('berkot-bin-info').textContent = 
            `Bin: ${BERKOT_CONFIG.BIN_ID && BERKOT_CONFIG.BIN_ID !== "PEGA_TU_BIN_ID_AQUI" ? '✅ Configurado' : '❌ No configurado'}`;
        
        document.getElementById('berkot-key-info').textContent = 
            `Key: ${BERKOT_CONFIG.ACCESS_KEY && BERKOT_CONFIG.ACCESS_KEY !== "PEGA_TU_ACCESS_KEY_AQUI" ? '✅ Configurada' : '❌ No configurada'}`;
    };
    
    // Botón sincronizar
    document.getElementById('berkot-sync-btn').onclick = sincronizarPrecios;
    
    // Botón probar conexión
    document.getElementById('berkot-test-btn').onclick = async () => {
        const datos = await verificarConexionJsonBin();
        const status = document.getElementById('berkot-status');
        if (datos) {
            status.style.color = '#2ecc71';
            status.title = 'Conectado';
        } else {
            status.style.color = '#e74c3c';
            status.title = 'Desconectado';
        }
    };
    
    // Actualizar periódicamente
    setInterval(actualizarInfo, 30000);
    actualizarInfo();
}

// ===== AÑADIR BOTÓN AL PANEL ADMIN =====
function añadirBotonPanelAdmin() {
    const intervalo = setInterval(() => {
        const panelAdmin = document.getElementById('adminPanel');
        if (panelAdmin) {
            clearInterval(intervalo);
            
            const boton = document.createElement('button');
            boton.className = 'admin-btn';
            boton.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
            boton.style.margin = '10px 0';
            boton.style.fontSize = '16px';
            boton.style.padding = '12px';
            boton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> GUARDAR EN LA NUBE (PARA TODOS)';
            
            boton.onclick = guardarEnLaNube;
            
            // Insertar al principio
            const primeraSeccion = panelAdmin.querySelector('.admin-section');
            if (primeraSeccion) {
                primeraSeccion.appendChild(boton);
            } else {
                panelAdmin.appendChild(boton);
            }
            
            console.log("✅ Botón 'Guardar en la nube' añadido al panel admin");
        }
    }, 1000);
}

// ===== INICIALIZAR =====
function iniciarBerkotOnline() {
    console.log("🚀 Iniciando Berkot Online v2.0...");
    
    // 1. Crear panel de control
    crearPanelControl();
    
    // 2. Añadir botón al panel admin
    añadirBotonPanelAdmin();
    
    // 3. Verificar conexión inicial
    setTimeout(async () => {
        const datos = await verificarConexionJsonBin();
        const status = document.getElementById('berkot-status');
        if (status) {
            status.style.color = datos ? '#2ecc71' : '#e74c3c';
        }
    }, 2000);
    
    // 4. Sincronizar precios inicialmente
    setTimeout(sincronizarPrecios, 3000);
    
    // 5. Sincronizar automáticamente cada 3 minutos
    setInterval(sincronizarPrecios, 180000);
    
    // Hacer funciones globales
    window.BERKOT_CONFIG = BERKOT_CONFIG;
    window.sincronizarPrecios = sincronizarPrecios;
    window.guardarEnLaNube = guardarEnLaNube;
    
    console.log("✅ Berkot Online inicializado correctamente");
}

// ===== CSS PARA ANIMACIONES =====
const estilosBerkot = document.createElement('style');
estilosBerkot.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes parpadeo {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }
`;
document.head.appendChild(estilosBerkot);

// ===== EJECUTAR CUANDO LA PÁGINA CARGUE =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarBerkotOnline);
} else {
    setTimeout(iniciarBerkotOnline, 1000);
}

console.log("🎯 Berkot.js cargado y listo para ejecutar");
