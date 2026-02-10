// ===== CONFIGURACIÓN BERKOT - JSONBIN.IO =====

const JSONBIN_CONFIG = {
    // TU URL DEL BIN (PASO 2.2)
    BIN_URL: "https://api.jsonbin.io/v3/b/698ba4da43b1c97be97508c3",
    
    // TU ACCESS KEY (PASO 3.1)
    ACCESS_KEY: "$2a$10$ZyT2m555Top/p79kUV6U2OKumygoxSTJM8cZY.T1EvXLxx5jWJ08K",
    
    // CONTRASEÑA ADMIN
    ADMIN_PASSWORD: "Berkot2026",
    
    // FUNCIÓN PARA CARGAR DATOS
    async loadData() {
        try {
            const response = await fetch(this.BIN_URL + "/latest", {
                headers: {
                    "X-Access-Key": this.ACCESS_KEY
                }
            });
            
            if (!response.ok) throw new Error("Error cargando datos");
            
            const data = await response.json();
            return data.record; // Devuelve solo los datos
        } catch (error) {
            console.error("Error cargando JSONBin:", error);
            return null;
        }
    },
    
    // FUNCIÓN PARA GUARDAR DATOS (SOLO ADMIN)
    async saveData(newData) {
        // Verificar contraseña
        const password = prompt("Contraseña admin para guardar cambios:");
        if (password !== this.ADMIN_PASSWORD) {
            alert("❌ Contraseña incorrecta");
            return false;
        }
        
        try {
            const response = await fetch(this.BIN_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Key": this.ACCESS_KEY,
                    "X-Bin-Versioning": "false"
                },
                body: JSON.stringify(newData)
            });
            
            if (response.ok) {
                alert("✅ Precios actualizados para TODOS los clientes!");
                return true;
            } else {
                throw new Error("Error guardando");
            }
        } catch (error) {
            alert("❌ Error: " + error.message);
            return false;
        }
    }
};

// ===== INTEGRACIÓN CON TU PÁGINA EXISTENTE =====

// Esta función se ejecuta cuando la página carga
async function initializeBerkotWithJSONBin() {
    console.log("🔄 Cargando datos desde JSONBin.io...");
    
    // 1. Intentar cargar desde JSONBin
    const onlineData = await JSONBIN_CONFIG.loadData();
    
    if (onlineData && window.storeData) {
        // 2. Combinar datos online con tu página
        Object.assign(window.storeData, onlineData);
        
        // 3. Actualizar la interfaz
        if (window.applyStoreData) window.applyStoreData();
        if (window.renderProducts) window.renderProducts();
        
        console.log("✅ Datos cargados desde la nube");
        
        // 4. Guardar localmente como respaldo
        localStorage.setItem('berkot_online_data', JSON.stringify(onlineData));
        
        // 5. Mostrar notificación
        if (window.showNotification) {
            window.showNotification("Datos actualizados desde la nube", "success");
        }
    } else {
        // Usar datos locales si no hay conexión
        console.log("⚠️ Usando datos locales");
        const localData = localStorage.getItem('berkot_online_data');
        if (localData && window.storeData) {
            Object.assign(window.storeData, JSON.parse(localData));
            if (window.applyStoreData) window.applyStoreData();
            if (window.renderProducts) window.renderProducts();
        }
    }
}

// ===== PANEL ADMIN MEJORADO =====

// Añadir botón "Guardar en la nube" al panel admin existente
function addJSONBinButtonToAdminPanel() {
    // Esperar a que exista el panel admin
    setTimeout(() => {
        const adminPanel = document.getElementById('adminPanel');
        if (adminPanel) {
            // Crear botón
            const saveCloudBtn = document.createElement('button');
            saveCloudBtn.className = 'admin-btn';
            saveCloudBtn.style.background = 'linear-gradient(135deg, #2196F3, #1976D2)';
            saveCloudBtn.style.marginTop = '10px';
            saveCloudBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Guardar en la Nube para Todos';
            
            saveCloudBtn.onclick = async function() {
                if (window.storeData) {
                    const success = await JSONBIN_CONFIG.saveData(window.storeData);
                    if (success) {
                        // Recargar datos para ver cambios
                        initializeBerkotWithJSONBin();
                    }
                }
            };
            
            // Añadir al panel admin
            const lastSection = adminPanel.querySelector('.admin-section:last-child');
            if (lastSection) {
                lastSection.appendChild(saveCloudBtn);
            }
            
            // Añadir indicador de estado
            const statusDiv = document.createElement('div');
            statusDiv.id = 'jsonbinStatus';
            statusDiv.style.cssText = `
                background: #4CAF50;
                color: white;
                padding: 10px;
                border-radius: 5px;
                margin: 10px 0;
                text-align: center;
                display: none;
            `;
            statusDiv.innerHTML = '<i class="fas fa-cloud"></i> Conectado a JSONBin.io';
            adminPanel.prepend(statusDiv);
            
            // Mostrar estado
            setTimeout(() => {
                statusDiv.style.display = 'block';
            }, 1000);
        }
    }, 2000);
}

// ===== EJECUTAR AL CARGAR =====

// Esperar a que tu página cargue
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // 1. Inicializar datos desde JSONBin
        initializeBerkotWithJSONBin();
        
        // 2. Añadir botón al panel admin
        addJSONBinButtonToAdminPanel();
        
        // 3. Añadir atajo de teclado para admin
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                if (window.storeData) {
                    JSONBIN_CONFIG.saveData(window.storeData);
                }
            }
        });
    });
} else {
    // La página ya está cargada
    initializeBerkotWithJSONBin();
    addJSONBinButtonToAdminPanel();
}

// ===== HACER CONFIG DISPONIBLE GLOBALMENTE =====
window.JSONBIN_CONFIG = JSONBIN_CONFIG;
window.initializeBerkotWithJSONBin = initializeBerkotWithJSONBin;
