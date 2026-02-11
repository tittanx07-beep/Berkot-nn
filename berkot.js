// ========== BERKOT ULTIMATE - VERSIÓN CORREGIDA FINAL ==========
console.log("🚀 Berkot Ultimate - Sistema completo iniciando...");

// ===== ESTILOS ADMIN =====
(function agregarEstilos() {
    const estilos = document.createElement('style');
    estilos.textContent = `
        .admin-input, .admin-select, .admin-textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-top: 5px;
            font-size: 14px;
        }
        .admin-input:focus, .admin-select:focus, .admin-textarea:focus {
            border-color: #3498db;
            outline: none;
        }
        .admin-btn {
            padding: 10px 15px;
            border: none;
            border-radius: 5px;
            color: white;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.3s;
        }
        .admin-btn:hover {
            opacity: 0.9;
        }
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(estilos);
})();

// ===== CONFIGURACIÓN =====
// 🔴 ¡PON TUS DATOS REALES AQUÍ! 🔴
const BERKOT_ULTIMATE = {
    BIN_ID: "698bb5e6d0ea881f40b08b3f",     // ← TU BIN_ID REAL
    ACCESS_KEY: "$2a$10$kCE3/fq2JB928OPxvj1tlOPvv9VQf4.NmndkYnXaJ3oda7obH4.lm",      // ← TU ACCESS_KEY REAL
    PASSWORD: "BerkotAdmin2026",            // ← CAMBIA ESTA CONTRASEÑA
    
    datosLocales: null,
    
    PLANTILLA_PRODUCTO: {
        id: null,
        name: "Nuevo Producto",
        description: "",
        basePrice: 1.00,
        unit: "lb",
        minQty: 0.5,
        icon: "fa-box",
        badge: "",
        available: true
    },
    
    obtenerDatos() {
        if (window.storeData) {
            this.datosLocales = window.storeData;
            return this.datosLocales;
        }
        
        const datosLocal = localStorage.getItem('berkot_ultimate_data');
        if (datosLocal) {
            try {
                this.datosLocales = JSON.parse(datosLocal);
                return this.datosLocales;
            } catch (e) {}
        }
        
        this.datosLocales = {
            storeName: "Berkot",
            storePhone: "+5356603249",
            storeHours: "8:00 AM - 6:00 PM",
            welcomeMessage: "Tu tienda de confianza",
            products: []
        };
        
        return this.datosLocales;
    },
    
    async cargarDeNube() {
        try {
            const url = `https://api.jsonbin.io/v3/b/${this.BIN_ID}/latest`;
            const res = await fetch(url, {
                headers: { "X-Access-Key": this.ACCESS_KEY }
            });
            if (res.ok) {
                const data = await res.json();
                return data.record;
            }
        } catch (e) {}
        return null;
    },
    
    async guardarEnNube(datos, pedirPass = true) {
        if (pedirPass) {
            const pass = prompt("🔐 Contraseña admin:");
            if (pass !== this.PASSWORD) {
                alert("❌ Contraseña incorrecta");
                return false;
            }
        }
        
        try {
            const url = `https://api.jsonbin.io/v3/b/${this.BIN_ID}`;
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Key": this.ACCESS_KEY,
                    "X-Bin-Versioning": "false"
                },
                body: JSON.stringify(datos)
            });
            
            if (res.ok) {
                this.mostrarNotificacion(`✅ ${datos.products?.length || 0} productos guardados`, "success");
                return true;
            }
        } catch (e) {}
        return false;
    },
    
    async sincronizarInteligente() {
        const locales = this.obtenerDatos();
        const nube = await this.cargarDeNube();
        
        if (!nube) {
            await this.guardarEnNube(locales, false);
            return locales;
        }
        
        const fusionados = { ...locales };
        fusionados.products = [...(locales.products || [])];
        
        nube.products?.forEach(prodNube => {
            if (!fusionados.products.find(p => p.id === prodNube.id)) {
                fusionados.products.push(prodNube);
            }
        });
        
        localStorage.setItem('berkot_ultimate_data', JSON.stringify(fusionados));
        if (window.storeData) window.storeData = fusionados;
        
        await this.guardarEnNube(fusionados, false);
        return fusionados;
    },
    
    async forzarSubidaCompleta() {
        const datos = this.obtenerDatos();
        this.mostrarNotificacion(`📦 Subiendo ${datos.products?.length || 0} productos...`, "info");
        return await this.guardarEnNube(datos, true);
    },
    
    añadirProducto() {
        const datos = this.obtenerDatos();
        const nuevo = {
            ...this.PLANTILLA_PRODUCTO,
            id: Date.now().toString(),
            name: `Producto ${(datos.products?.length || 0) + 1}`
        };
        
        if (!datos.products) datos.products = [];
        datos.products.push(nuevo);
        
        localStorage.setItem('berkot_ultimate_data', JSON.stringify(datos));
        if (window.storeData) window.storeData = datos;
        
        this.mostrarNotificacion("✅ Producto añadido", "success");
        this.guardarEnNube(datos, false);
        return nuevo;
    },
    
    actualizarProducto(index, campo, valor) {
        const datos = this.obtenerDatos();
        if (!datos.products?.[index]) return;
        
        datos.products[index][campo] = valor;
        localStorage.setItem('berkot_ultimate_data', JSON.stringify(datos));
        if (window.storeData) window.storeData = datos;
        
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.guardarEnNube(datos, false);
        }, 1000);
    },
    
    eliminarProducto(index) {
        const datos = this.obtenerDatos();
        if (!datos.products?.[index]) return;
        
        const nombre = datos.products[index].name;
        if (!confirm(`¿Eliminar "${nombre}"?`)) return;
        
        datos.products.splice(index, 1);
        localStorage.setItem('berkot_ultimate_data', JSON.stringify(datos));
        if (window.storeData) window.storeData = datos;
        
        this.mostrarNotificacion(`🗑️ ${nombre} eliminado`, "success");
        this.guardarEnNube(datos, false);
    },
    
    editarProductoPrompt(index) {
        const datos = this.obtenerDatos();
        const producto = datos.products?.[index];
        if (!producto) return;
        
        const nuevoNombre = prompt("Nuevo nombre del producto:", producto.name);
        if (nuevoNombre?.trim()) {
            this.actualizarProducto(index, 'name', nuevoNombre.trim());
            if (typeof cargarListaProductosAdmin === 'function') cargarListaProductosAdmin();
            if (typeof actualizarInterfaz === 'function') actualizarInterfaz();
        }
    },
    
    mostrarNotificacion(mensaje, tipo = "info", tiempo = 4000) {
        let contenedor = document.getElementById('berkot-notificaciones');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'berkot-notificaciones';
            contenedor.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                max-width: 400px;
            `;
            document.body.appendChild(contenedor);
        }
        
        const noti = document.createElement('div');
        noti.style.cssText = `
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
        `;
        
        const icono = tipo === 'success' ? 'check-circle' :
                     tipo === 'error' ? 'exclamation-circle' :
                     tipo === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        noti.innerHTML = `<i class="fas fa-${icono}"></i> ${mensaje}`;
        contenedor.appendChild(noti);
        
        setTimeout(() => {
            noti.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => noti.remove(), 300);
        }, tiempo);
    }
};

// ===== FUNCIONES DE INTERFAZ =====
function actualizarInterfaz() {
    if (window.applyStoreData) try { window.applyStoreData(); } catch(e) {}
    if (window.renderProducts) try { window.renderProducts(); } catch(e) {}
}

// ===== CARGAR LISTA DE PRODUCTOS =====
function cargarListaProductosAdmin() {
    const contenedor = document.getElementById('lista-productos-admin');
    if (!contenedor) return;
    
    const datos = BERKOT_ULTIMATE.obtenerDatos();
    
    if (!datos.products?.length) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #666;">
                <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 10px;"></i>
                <p>No hay productos aún</p>
            </div>
        `;
        return;
    }
    
    contenedor.innerHTML = '';
    
    datos.products.forEach((producto, index) => {
        const div = document.createElement('div');
        div.className = 'admin-product-card';
        div.style.cssText = `
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            background: white;
        `;
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <strong style="color: #2c3e50;">${producto.name || 'Sin nombre'}</strong>
                    <div style="font-size: 12px; color: #666;">
                        ID: ${producto.id} | Precio: $${producto.basePrice || '0.00'}
                    </div>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="BERKOT_ULTIMATE.editarProductoPrompt(${index})" 
                            style="background: #3498db; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="BERKOT_ULTIMATE.eliminarProducto(${index})" 
                            style="background: #e74c3c; color: white; border: none; width: 30px; height: 30px; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                <div>
                    <label style="font-size: 12px; color: #666;">Nombre</label>
                    <input type="text" class="admin-input" value="${producto.name || ''}" 
                           onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'name', this.value)">
                </div>
                <div>
                    <label style="font-size: 12px; color: #666;">Precio ($)</label>
                    <input type="number" step="0.01" class="admin-input" value="${producto.basePrice || 0}" 
                           onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'basePrice', parseFloat(this.value))">
                </div>
                <div>
                    <label style="font-size: 12px; color: #666;">Unidad</label>
                    <select class="admin-select" onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'unit', this.value)">
                        <option value="lb" ${producto.unit === 'lb' ? 'selected' : ''}>Libras</option>
                        <option value="kg" ${producto.unit === 'kg' ? 'selected' : ''}>Kilogramos</option>
                        <option value="onz" ${producto.unit === 'onz' ? 'selected' : ''}>Onzas</option>
                        <option value="unidad" ${producto.unit === 'unidad' ? 'selected' : ''}>Unidades</option>
                    </select>
                </div>
                <div>
                    <label style="font-size: 12px; color: #666;">Mínimo</label>
                    <input type="number" step="0.01" class="admin-input" value="${producto.minQty || 0.5}" 
                           onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'minQty', parseFloat(this.value))">
                </div>
            </div>
            
            <div style="margin-top: 10px;">
                <label style="font-size: 12px; color: #666;">Descripción</label>
                <textarea class="admin-textarea" 
                          onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'description', this.value)"
                          style="width: 100%; min-height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">${producto.description || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 20px; margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 5px; font-size: 12px;">
                    <input type="checkbox" ${producto.available !== false ? 'checked' : ''} 
                           onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'available', this.checked)">
                    Disponible
                </label>
                <label style="display: flex; align-items: center; gap: 5px; font-size: 12px;">
                    <input type="text" class="admin-input" value="${producto.icon || 'fa-box'}" 
                           onchange="BERKOT_ULTIMATE.actualizarProducto(${index}, 'icon', this.value)" 
                           placeholder="fa-icon" style="width: 100px;">
                    Icono
                </label>
            </div>
        `;
        
        contenedor.appendChild(div);
    });
}

// ===== PANEL ADMIN =====
function integrarPanelAdmin() {
    const intervalo = setInterval(() => {
        const panelAdmin = document.getElementById('adminPanel');
        if (panelAdmin) {
            clearInterval(intervalo);
            
            const seccion = document.createElement('div');
            seccion.className = 'admin-section';
            seccion.innerHTML = `
                <h3 class="section-title">
                    <i class="fas fa-cloud"></i> Berkot Ultimate - Gestión de Productos
                </h3>
                
                <div id="lista-productos-admin" style="margin-bottom: 20px;"></div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 20px 0;">
                    <button id="btn-ultimate-nuevo" class="admin-btn" style="background: #27ae60;">
                        <i class="fas fa-plus"></i> Nuevo Producto
                    </button>
                    <button id="btn-ultimate-sincronizar" class="admin-btn" style="background: #3498db;">
                        <i class="fas fa-sync"></i> Sincronizar
                    </button>
                    <button id="btn-ultimate-forzar" class="admin-btn" style="background: #e74c3c;">
                        <i class="fas fa-cloud-upload-alt"></i> FORZAR SUBIDA
                    </button>
                </div>
                
                <div style="font-size: 12px; color: #666; text-align: center; margin-top: 10px;">
                    <i class="fas fa-info-circle"></i> Los cambios se guardan automáticamente en la nube
                </div>
            `;
            
            panelAdmin.insertBefore(seccion, panelAdmin.firstChild);
            
            document.getElementById('btn-ultimate-nuevo').onclick = () => {
                BERKOT_ULTIMATE.añadirProducto();
                cargarListaProductosAdmin();
                actualizarInterfaz();
            };
            
            document.getElementById('btn-ultimate-sincronizar').onclick = async () => {
                await BERKOT_ULTIMATE.sincronizarInteligente();
                cargarListaProductosAdmin();
                actualizarInterfaz();
            };
            
            document.getElementById('btn-ultimate-forzar').onclick = async () => {
                if (confirm("⚠️ ¿FORZAR SUBIDA? Esto SOBREESCRIBIRÁ la nube con TODOS tus productos actuales.")) {
                    await BERKOT_ULTIMATE.forzarSubidaCompleta();
                }
            };
            
            cargarListaProductosAdmin();
        }
    }, 1000);
}

// ===== PANEL FLOTANTE =====
function crearPanelControl() {
    const panel = document.createElement('div');
    panel.id = 'berkot-ultimate-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: linear-gradient(145deg, #2c3e50, #34495e);
        color: white;
        padding: 15px;
        border-radius: 15px;
        z-index: 9998;
        font-family: Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        min-width: 250px;
        border: 2px solid #3498db;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <i class="fas fa-crown" style="color: #f1c40f; font-size: 20px;"></i>
            <strong style="font-size: 16px;">Berkot Ultimate</strong>
            <span style="margin-left: auto; background: #27ae60; padding: 3px 10px; border-radius: 20px; font-size: 11px;">
                ONLINE
            </span>
        </div>
        <div style="margin-bottom: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span><i class="fas fa-box"></i> Productos:</span>
                <span id="ultimate-contador" style="font-weight: bold; color: #f1c40f;">0</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span><i class="fas fa-cloud"></i> Nube:</span>
                <span id="ultimate-estado" style="color: #2ecc71;">Conectado</span>
            </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button id="panel-sync" style="padding: 10px; background: #3498db; color: white; border: none; border-radius: 8px; cursor: pointer;">
                <i class="fas fa-sync"></i> Sinc
            </button>
            <button id="panel-add" style="padding: 10px; background: #27ae60; color: white; border: none; border-radius: 8px; cursor: pointer;">
                <i class="fas fa-plus"></i> Añadir
            </button>
            <button id="panel-force" style="padding: 10px; background: #e74c3c; color: white; border: none; border-radius: 8px; cursor: pointer; grid-column: span 2;">
                <i class="fas fa-cloud-upload-alt"></i> FORZAR SUBIDA A NUBE
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    document.getElementById('panel-sync').onclick = async () => {
        await BERKOT_ULTIMATE.sincronizarInteligente();
        cargarListaProductosAdmin();
        actualizarInterfaz();
    };
    
    document.getElementById('panel-add').onclick = () => {
        BERKOT_ULTIMATE.añadirProducto();
        cargarListaProductosAdmin();
        actualizarInterfaz();
    };
    
    document.getElementById('panel-force').onclick = async () => {
        if (confirm("⚠️ ¿FORZAR SUBIDA COMPLETA? Esto reemplazará TODOS los productos en la nube.")) {
            await BERKOT_ULTIMATE.forzarSubidaCompleta();
        }
    };
    
    function actualizarPanel() {
        const datos = BERKOT_ULTIMATE.obtenerDatos();
        const contador = document.getElementById('ultimate-contador');
        if (contador) contador.textContent = datos.products?.length || 0;
    }
    
    setInterval(actualizarPanel, 2000);
    actualizarPanel();
}

// ===== VERIFICAR CONFIGURACIÓN =====
function verificarConfiguracion() {
    if (BERKOT_ULTIMATE.BIN_ID === "TU_BIN_ID_AQUI" || 
        BERKOT_ULTIMATE.ACCESS_KEY === "TU_ACCESS_KEY_AQUI" ||
        BERKOT_ULTIMATE.BIN_ID.includes("TU_")) {
        console.warn("⚠️ Configura tus credenciales de JSONBin.io en berkot.js");
        setTimeout(() => {
            BERKOT_ULTIMATE.mostrarNotificacion?.("⚠️ Configura tus credenciales en berkot.js", "warning", 10000);
        }, 2000);
    }
}

// ===== OCULTAR CONTRASEÑA =====
setTimeout(function() {
    document.querySelectorAll('div, span, p, label, td, th, h1, h2, h3, h4').forEach(el => {
        if (el.innerHTML) {
            el.innerHTML = el.innerHTML.replace(/berkot2026/gi, '••••••••');
            el.innerHTML = el.innerHTML.replace(/Berkot2026/gi, '••••••••');
            el.innerHTML = el.innerHTML.replace(/Contraseña:.*?(<br>|$)/gi, '');
        }
    });
}, 500);

// ===== INICIALIZAR =====
async function iniciarBerkotUltimate() {
    console.log("🎯 Iniciando Berkot Ultimate...");
    
    crearPanelControl();
    integrarPanelAdmin();
    
    setTimeout(async () => {
        await BERKOT_ULTIMATE.sincronizarInteligente();
        actualizarInterfaz();
        console.log("✅ Sincronización inicial completada");
    }, 1500);
    
    window.BERKOT_ULTIMATE = BERKOT_ULTIMATE;
    console.log("✅ Berkot Ultimate inicializado correctamente");
}

// ===== EJECUTAR =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        iniciarBerkotUltimate();
        verificarConfiguracion();
    });
} else {
    setTimeout(() => {
        iniciarBerkotUltimate();
        verificarConfiguracion();
    }, 500);
}

console.log("👑 Berkot Ultimate - Versión Corregida Final Cargada");
