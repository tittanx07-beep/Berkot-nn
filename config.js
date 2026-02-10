// ===== CONFIGURACIÓN BERKOT - CORREGIDA Y PROBADA =====

const BERKOT_ONLINE_CONFIG = {
    // TU BIN ID DE JSONBIN.IO (solo el ID, no toda la URL)
    BIN_ID: "TU_ID_DEL_BIN_AQUI",  // Ejemplo: "65f4a8b8dc74654018a8c4f3"
    
    // TU ACCESS KEY
    ACCESS_KEY: "TU_ACCESS_KEY_AQUI",
    
    // CONTRASEÑA ADMIN
    ADMIN_PASSWORD: "Berkot2026",
    
    // URLs COMPLETAS
    get BIN_URL() {
        return `https://api.jsonbin.io/v3/b/${this.BIN_ID}`;
    },
    
    get BIN_URL_LATEST() {
        return `https://api.jsonbin.io/v3/b/${this.BIN_ID}/latest`;
    },
    
    // ===== FUNCIONES PRINCIPALES =====
    
    // 1. CARGAR DATOS DESDE INTERNET
    async loadOnlineData() {
        console.log("🌐 Intentando cargar desde JSONBin.io...");
        
        try {
            const response = await fetch(this.BIN_URL_LATEST, {
                headers: {
                    "X-Access-Key": this.ACCESS_KEY,
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("✅ Datos cargados desde internet:", result.record);
            return result.record;
            
        } catch (error) {
            console.warn("⚠️ No se pudo cargar online:", error.message);
            return null;
        }
    },
    
    // 2. GUARDAR DATOS EN INTERNET
    async saveOnlineData(data) {
        console.log("💾 Guardando en JSONBin.io...");
        
        try {
            const response = await fetch(this.BIN_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Key": this.ACCESS_KEY,
                    "X-Bin-Versioning": "false"
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                console.log("✅ Guardado exitoso en la nube");
                return true;
            } else {
                throw new Error(`Error guardando: ${response.status}`);
            }
            
        } catch (error) {
            console.error("❌ Error guardando:", error);
            return false;
        }
    },
    
    // 3. SINCRONIZAR CON TU PÁGINA
    async syncWithPage() {
        console.log("🔄 Sincronizando página con datos online...");
        
        // A. Cargar datos de internet
        const onlineData = await this.loadOnlineData();
        
        if (!onlineData) {
            console.log("🔄 Usando datos locales como respaldo");
            return false;
        }
        
        // B. Verificar que window.storeData existe
        if (!window.storeData) {
            console.error("❌ No se encontró storeData en la página");
            return false;
        }
        
        // C. ACTUALIZAR LOS PRECIOS EN TU PÁGINA
        if (onlineData.products && Array.isArray(onlineData.products)) {
            // Actualizar cada producto
            onlineData.products.forEach(onlineProduct => {
                const localProduct = window.storeData.products?.find(p => p.id === onlineProduct.id);
                if (localProduct) {
                    // ACTUALIZAR PRECIO
                    localProduct.basePrice = onlineProduct.basePrice;
                    console.log(`📊 Actualizado: ${localProduct.name} = $${onlineProduct.basePrice}`);
                }
            });
            
            // D. ACTUALIZAR INTERFAZ
            if (window.applyStoreData) {
                window.applyStoreData();
            }
            if (window.renderProducts) {
                window.renderProducts();
            }
            
            // E. Guardar localmente
            localStorage.setItem('berkot_last_online_sync', JSON.stringify(onlineData));
            localStorage.setItem('berkot_sync_time', new Date().toISOString());
            
            console.log("✅ Sincronización completa");
            return true;
        }
        
        return false;
    }
};

// ===== INTEGRACIÓN AUTOMÁTICA =====

// 1. SINCRONIZAR AL CARGAR LA PÁGINA
async function initializeOnlineSync() {
    console.log("🚀 Iniciando sincronización Berkot...");
    
    // Esperar a que la página cargue completamente
    if (!window.storeData) {
        setTimeout(initializeOnlineSync, 500);
        return;
    }
    
    // Intentar sincronizar
    const success = await BERKOT_ONLINE_CONFIG.syncWithPage();
    
    if (success) {
        showSyncStatus("✅ Conectado - Precios actualizados", "success");
    } else {
        showSyncStatus("📱 Modo local - Sin conexión", "warning");
    }
    
    // Programar sincronización automática cada 2 minutos
    setInterval(async () => {
        await BERKOT_ONLINE_CONFIG.syncWithPage();
    }, 120000); // 120 segundos = 2 minutos
}

// 2. AÑADIR BOTÓN DE SINCRONIZACIÓN MANUAL
function addSyncButton() {
    // Esperar a que exista el panel admin
    const checkInterval = setInterval(() => {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            clearInterval(checkInterval);
            
            // Crear botón de sincronización
            const syncButton = document.createElement('button');
            syncButton.className = 'admin-btn';
            syncButton.style.background = 'linear-gradient(135deg, #9b59b6, #8e44ad)';
            syncButton.style.margin = '5px';
            syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar Ahora';
            
            syncButton.onclick = async function() {
                syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
                syncButton.disabled = true;
                
                const success = await BERKOT_ONLINE_CONFIG.syncWithPage();
                
                if (success) {
                    alert('✅ Precios sincronizados en todos los dispositivos');
                    syncButton.innerHTML = '<i class="fas fa-check"></i> Sincronizado';
                    setTimeout(() => {
                        syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar Ahora';
                        syncButton.disabled = false;
                    }, 2000);
                } else {
                    alert('❌ Error sincronizando. Verifica conexión.');
                    syncButton.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar Ahora';
                    syncButton.disabled = false;
                }
            };
            
            // Añadir al panel admin
            const lastSection = adminPanel.querySelector('.admin-section:last-child');
            if (lastSection) {
                lastSection.appendChild(syncButton);
            }
        }
    }, 1000);
}

// 3. MODIFICAR TU FUNCIÓN saveStoreData PARA GUARDAR EN LA NUBE
function patchSaveStoreData() {
    if (!window.saveStoreData) return;
    
    // Guardar referencia original
    const originalSaveStoreData = window.saveStoreData;
    
    // Sobreescribir función
    window.saveStoreData = async function() {
        // 1. Guardar localmente (comportamiento original)
        originalSaveStoreData.call(this);
        
        // 2. Si es admin, guardar también en la nube
        if (window.adminSessionActive) {
            const password = prompt("📱 Contraseña para guardar en la nube:");
            if (password === BERKOT_ONLINE_CONFIG.ADMIN_PASSWORD) {
                const saving = document.createElement('div');
                saving.innerHTML = '<i class="fas fa-cloud-upload-alt fa-spin"></i> Subiendo a la nube...';
                saving.style.cssText = 'position:fixed; top:20px; right:20px; background:#3498db; color:white; padding:10px; border-radius:5px; z-index:99999;';
                document.body.appendChild(saving);
                
                const success = await BERKOT_ONLINE_CONFIG.saveOnlineData(window.storeData);
                
                setTimeout(() => saving.remove(), 3000);
                
                if (success) {
                    alert('✅ ¡Precios actualizados para TODOS los clientes!\n\nLos cambios se verán en otros dispositivos en 1-2 minutos.');
                } else {
                    alert('❌ Error subiendo a la nube. Los cambios solo se guardaron localmente.');
                }
            } else {
                alert('❌ Contraseña incorrecta. Cambios guardados solo localmente.');
            }
        }
    };
}

// 4. MOSTRAR ESTADO DE CONEXIÓN
function showSyncStatus(message, type = 'info') {
    // Eliminar notificación anterior
    const oldStatus = document.getElementById('berkotSyncStatus');
    if (oldStatus) oldStatus.remove();
    
    // Crear nueva notificación
    const status = document.createElement('div');
    status.id = 'berkotSyncStatus';
    status.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        z-index: 9998;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    status.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'cloud'}"></i>
        ${message}
    `;
    
    document.body.appendChild(status);
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        status.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => status.remove(), 300);
    }, 5000);
}

// 5. AÑADIR ANIMACIONES CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(-100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(-100%); opacity: 0; }
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .fa-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

// ===== INICIALIZAR TODO =====

// Esperar a que la página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // 1. Iniciar sincronización
        setTimeout(initializeOnlineSync, 1000);
        
        // 2. Añadir botón sync
        setTimeout(addSyncButton, 2000);
        
        // 3. Parchear función de guardado
        setTimeout(patchSaveStoreData, 3000);
    });
} else {
    // La página ya está cargada
    setTimeout(initializeOnlineSync, 1000);
    setTimeout(addSyncButton, 2000);
    setTimeout(patchSaveStoreData, 3000);
}

// ===== HACER DISPONIBLE GLOBALMENTE =====
window.BERKOT_ONLINE_CONFIG = BERKOT_ONLINE_CONFIG;
window.initializeOnlineSync = initializeOnlineSync;
