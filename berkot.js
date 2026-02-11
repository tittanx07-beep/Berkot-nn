// ========== BERKOT ULTIMATE - SISTEMA COMPLETO ==========

console.log("🚀 Berkot Ultimate - Sistema completo iniciando...");

// ===== CONFIGURACIÓN =====
const BERKOT_ULTIMATE = {
    // ⚠️ REEMPLAZA CON TUS DATOS ⚠️
    BIN_ID: "698bb5e6d0ea881f40b08b3f",
    ACCESS_KEY: "$2a$10$kCE3/fq2JB928OPxvj1tlOPvv9VQf4.NmndkYnXaJ3oda7obH4.lm",
    PASSWORD: "Berkot2026",
    
    // Datos locales
    datosLocales: null,
    
    // Plantilla para nuevos productos
    PLANTILLA_PRODUCTO: {
        id: null,
        name: "Nuevo Producto",
        description: "Descripción del producto",
        basePrice: 1.00,
        unit: "lb",
        minQty: 0.5,
        icon: "fa-box",
        badge: "Nuevo",
        available: true
    },
    
    // ===== DETECCIÓN AUTOMÁTICA DE DATOS =====
    obtenerDatos() {
        console.log("🔍 Detectando datos...");
        
        // Método 1: storeData global
        if (window.storeData) {
            console.log("✅ Datos en storeData");
            this.datosLocales = window.storeData;
            return this.datosLocales;
        }
        
        // Método 2: localStorage
        const claves = ['berkot_store_data', 'berkot_online_data', ADMIN_CONFIG?.STORE_DATA_KEY];
        for (const clave of claves) {
            const datos = localStorage.getItem(clave);
            if (datos) {
                try {
                    this.datosLocales = JSON.parse(datos);
                    console.log(`✅ Datos en ${clave}`);
                    return this.datosLocales;
                } catch (e) {}
            }
        }
        
        // Método 3: Crear datos base
        this.datosLocales = {
            storeName: "Berkot",
            storePhone: "+5356603249",
            storeHours: "8:00 AM - 6:00 PM",
            welcomeMessage: "Tu tienda de confianza",
            products: []
        };
        
        console.log("📝 Datos base creados");
        return this.datosLocales;
    },
    
    // ===== SINCRONIZACIÓN INTELIGENTE =====
    async sincronizarInteligente() {
        console.log("🔄 Sincronización inteligente...");
        
        // 1. Obtener datos locales
        const locales = this.obtenerDatos();
        
        // 2. Cargar de la nube
        const nube = await this.cargarDeNube();
        
        if (!nube) {
            console.log("⚠️ No hay datos en la nube, subiendo locales");
            await this.guardarEnNube(locales, false);
            return locales;
        }
        
        // 3. Fusionar inteligentemente
        const fusionados = this.fusionarInteligente(locales, nube);
        
        // 4. Actualizar storeData si existe
        if (window.storeData) {
            window.storeData = fusionados;
        }
        
        // 5. Guardar en localStorage
        localStorage.setItem('berkot_ultimate_data', JSON.stringify(fusionados));
        
        // 6. Guardar en la nube si hay cambios
        if (JSON.stringify(nube) !== JSON.stringify(fusionados)) {
            await this.guardarEnNube(fusionados, false);
        }
        
        console.log(`✅ Sincronizado: ${fusionados.products?.length || 0} productos`);
        return fusionados;
    },
    
    // ===== FUSIÓN INTELIGENTE =====
    fusionarInteligente(locales, nube) {
        const resultado = { ...nube };
        
        if (!resultado.products) resultado.products = [];
        if (!locales.products) locales.products = [];
        
        // Añadir productos locales que no están en la nube
        locales.products.forEach(prodLocal => {
            const existe = resultado.products.find(p => p.id === prodLocal.id);
            if (!existe) {
                resultado.products.push({ ...prodLocal });
            }
        });
        
        // Mantener el orden de la nube
        resultado.products.sort((a, b) => {
            const indexA = nube.products?.findIndex(p => p.id === a.id) ?? 1000;
            const indexB = nube.products?.findIndex(p => p.id === b.id) ?? 1000;
            return indexA - indexB;
        });
        
        return resultado;
    },
    
    // ===== CARGAR DE LA NUBE =====
    async cargarDeNube() {
        try {
            const url = `https://api.jsonbin.io/v3/b/${this.BIN_ID}/latest`;
            const respuesta = await fetch(url, {
                headers: { "X-Access-Key": this.ACCESS_KEY }
            });
            
            if (respuesta.ok) {
                const datos = await respuesta.json();
                console.log("☁️ Datos cargados de la nube");
                return datos.record;
            }
        } catch (error) {
            console.warn("❌ Error cargando de la nube:", error.message);
        }
        return null;
    },
    
    // ===== GUARDAR EN LA NUBE =====
    async guardarEnNube(datos, pedirPass = true) {
        if (pedirPass) {
            const pass = prompt("🔐 Contraseña admin (Berkot2026):");
            if (pass !== this.PASSWORD) {
                this.mostrarNotificacion("❌ Contraseña incorrecta", "error");
                return false;
            }
        }
        
        this.mostrarNotificacion("☁️ Guardando en la nube...", "info");
        
        try {
            const url = `https://api.jsonbin.io/v3/b/${this.BIN_ID}`;
            const respuesta = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Access-Key": this.ACCESS_KEY,
                    "X-Bin-Versioning": "false"
                },
                body: JSON.stringify(datos)
            });
            
            if (respuesta.ok) {
                this.mostrarNotificacion(
                    `✅ ${datos.products?.length || 0} productos guardados para TODOS`,
                    "success",
                    6000
                );
                return true;
            } else {
                throw new Error(`HTTP ${respuesta.status}`);
            }
        } catch (error) {
            this.mostrarNotificacion(`❌ Error: ${error.message}`, "error");
            return false;
        }
    },
    
    // ===== GESTIÓN DE PRODUCTOS =====
    añadirProducto() {
        const datos = this.obtenerDatos();
        const nuevoId = Date.now().toString();
        
        const nuevoProducto = {
            ...this.PLANTILLA_PRODUCTO,
            id: nuevoId,
            name: `Producto ${datos.products.length + 1}`
        };
        
        datos.products.push(nuevoProducto);
        this.datosLocales = datos;
        
        // Actualizar storeData global
        if (window.storeData) {
            window.storeData = datos;
        }
        
        this.mostrarNotificacion("✅ Producto añadido", "success");
        return nuevoProducto;
    },
    
    actualizarProducto(index, campo, valor) {
        const datos = this.obtenerDatos();
        if (!datos.products || !datos.products[index]) return;
        
        datos.products[index][campo] = valor;
        this.datosLocales = datos;
        
        // Actualizar storeData global
        if (window.storeData) {
            window.storeData = datos;
        }
        
        // Guardar automáticamente después de 1 segundo
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.guardarEnNube(datos, false);
        }, 1000);
    },
    
    eliminarProducto(index) {
        const datos = this.obtenerDatos();
        if (!datos.products || !datos.products[index]) return;
        
        const nombre = datos.products[index].name;
        if (!confirm(`¿Eliminar "${nombre}"?`)) return;
        
        datos.products.splice(index, 1);
        this.datosLocales = datos;
        
        // Actualizar storeData global
        if (window.storeData) {
            window.storeData = datos;
        }
        
        this.mostrarNotificacion(`🗑️ ${nombre} eliminado`, "success");
        this.guardarEnNube(datos, false);
    },
    
    // ===== NOTIFICACIONES =====
    mostrarNotificacion(mensaje, tipo = "info", tiempo = 4000) {
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
                max-width: 400px;
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
        
        const icono = tipo === 'success' ? 'check-circle' :
                     tipo === 'error' ? 'exclamation-circle' :
                     tipo === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
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
};

// ===== INTEGRACIÓN CON PÁGINA PRINCIPAL =====

// 1. ACTUALIZAR INTERFAZ
function actualizarInterfaz() {
    if (window.applyStoreData) {
        try { window.applyStoreData(); } catch(e) {}
    }
    if (window.renderProducts) {
        try { window.renderProducts(); } catch(e) {}
    }
}

// 2. CARGAR LISTA DE PRODUCTOS EN PANEL ADMIN
function cargarListaProductosAdmin() {
    const contenedor = document.getElementById('lista-productos-admin');
    if (!contenedor) return;
    
    const datos = BERKOT_ULTIMATE.obtenerDatos();
    if (!datos.products || datos.products.length === 0) {
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
        const productoDiv = document.createElement('div');
        productoDiv.className = 'admin-input-group';
        productoDiv.style.cssText = `
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            background: white;
        `;
        
        productoDiv.innerHTML = `
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
                          style="width: 100%; min-height: 60px;">${producto.description || ''}</textarea>
            </div>
            
            <div style="display: flex; gap: 20px; margin-top: 10px;">
                <label style="display: flex; align-items: center; gap: 5px; font-size: 12px;">
                    <input type="checkbox" ${producto.available ? 'checked' : ''} 
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
        
        contenedor.appendChild(productoDiv);
    });
}

// 3. AÑADIR FUNCIÓN PARA EDITAR NOMBRE
BERKOT_ULTIMATE.editarProductoPrompt = function(index) {
    const datos = this.obtenerDatos();
    const producto = datos.products[index];
    if (!producto) return;
    
    const nuevoNombre = prompt("Nuevo nombre del producto:", producto.name);
    if (nuevoNombre && nuevoNombre.trim()) {
        this.actualizarProducto(index, 'name', nuevoNombre.trim());
        cargarListaProductosAdmin();
        actualizarInterfaz();
    }
};

// ===== PANEL ADMIN MEJORADO =====
function integrarPanelAdmin() {
    const intervalo = setInterval(() => {
        const panelAdmin = document.getElementById('adminPanel');
        if (panelAdmin) {
            clearInterval(intervalo);
            
            // Crear sección de gestión
            const seccion = document.createElement('div');
            seccion.className = 'admin-section';
            seccion.innerHTML = `
                <h3 class="section-title">
                    <i class="fas fa-cloud"></i> Berkot Ultimate - Gestión Completa
                </h3>
                
                <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <i class="fas fa-info-circle" style="color: #3498db;"></i>
                        <span style="font-size: 14px; color: #666;">
                            Sistema automático de sincronización en tiempo real
                        </span>
                    </div>
                </div>
                
                <div id="lista-productos-admin" style="margin-bottom: 20px;">
                    <!-- Los productos se cargarán aquí -->
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px;">
                    <button id="btn-ultimate-nuevo" class="admin-btn" style="background: #27ae60;">
                        <i class="fas fa-plus"></i> Nuevo Producto
                    </button>
                    <button id="btn-ultimate-sincronizar" class="admin-btn" style="background: #3498db;">
                        <i class="fas fa-sync-alt"></i> Sincronizar Ahora
                    </button>
                    <button id="btn-ultimate-guardar" class="admin-btn" style="background: #9b59b6;">
                        <i class="fas fa-cloud-upload-alt"></i> Guardar en Nube
                    </button>
                    <button id="btn-ultimate-forzar" class="admin-btn" style="background: #e74c3c;">
                        <i class="fas fa-bolt"></i> Forzar Sincronización
                    </button>
                </div>
                
                <div style="margin-top: 15px; font-size: 12px; color: #666; text-align: center;">
                    <i class="fas fa-mobile-alt"></i> Los cambios se verán en todos los dispositivos en segundos
                </div>
            `;
            
            // Insertar al principio
            panelAdmin.insertBefore(seccion, panelAdmin.firstChild);
            
            // Configurar botones
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
            
            document.getElementById('btn-ultimate-guardar').onclick = async () => {
                const datos = BERKOT_ULTIMATE.obtenerDatos();
                await BERKOT_ULTIMATE.guardarEnNube(datos, true);
            };
            
            document.getElementById('btn-ultimate-forzar').onclick = async () => {
                if (confirm("⚠️ ¿Forzar sincronización completa?\n\nEsto descargará todos los datos de la nube.")) {
                    const datos = await BERKOT_ULTIMATE.cargarDeNube();
                    if (datos) {
                        BERKOT_ULTIMATE.datosLocales = datos;
                        if (window.storeData) window.storeData = datos;
                        localStorage.setItem('berkot_ultimate_data', JSON.stringify(datos));
                        cargarListaProductosAdmin();
                        actualizarInterfaz();
                        BERKOT_ULTIMATE.mostrarNotificacion("✅ Sincronización forzada completa", "success");
                    }
                }
            };
            
            // Cargar lista inicial
            cargarListaProductosAdmin();
        }
    }, 1000);
}

// ===== PANEL DE CONTROL VISIBLE =====
function crearPanelControl() {
    const panel = document.createElement('div');
    panel.id = 'berkot-ultimate-panel';
    panel.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: rgba(44, 62, 80, 0.95);
        color: white;
        padding: 15px;
        border-radius: 15px;
        z-index: 9998;
        font-family: Arial, sans-serif;
        font-size: 13px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        min-width: 250px;
        backdrop-filter: blur(10px);
        border: 2px solid #9b59b6;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <strong style="color: #9b59b6;">
                <i class="fas fa-crown"></i> Berkot Ultimate
            </strong>
            <span id="ultimate-status" style="color: #2ecc71; font-size: 18px;">●</span>
        </div>
        
        <div style="font-size: 12px; color: #ecf0f1; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                <i class="fas fa-box" style="color: #3498db;"></i>
                <span>Productos: <span id="ultimate-contador">0</span></span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-cloud" style="color: #9b59b6;"></i>
                <span>Estado: <span id="ultimate-estado">Conectado</span></span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; margin-top: 5px;">
                <i class="fas fa-sync" style="color: #f39c12;"></i>
                <span>Sincroniza: <span id="ultimate-tiempo">ahora</span></span>
            </div>
        </div>
        
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button id="ultimate-btn-sync" style="
                flex: 1;
                padding: 8px;
                background: #3498db;
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            ">
                <i class="fas fa-sync-alt"></i> Sincronizar
            </button>
            
            <button id="ultimate-btn-add" style="
                flex: 1;
                padding: 8px;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
            ">
                <i class="fas fa-plus"></i> Añadir
            </button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Actualizar contador
    const actualizarPanel = () => {
        const datos = BERKOT_ULTIMATE.obtenerDatos();
        const count = datos.products?.length || 0;
        document.getElementById('ultimate-contador').textContent = count;
        
        // Actualizar estado
        const estado = document.getElementById('ultimate-estado');
        const statusIcon = document.getElementById('ultimate-status');
        
        if (BERKOT_ULTIMATE.BIN_ID === "TU_BIN_ID_AQUI") {
            estado.textContent = "No configurado";
            statusIcon.style.color = "#e74c3c";
        } else {
            estado.textContent = "Conectado";
            statusIcon.style.color = "#2ecc71";
        }
    };
    
    // Botones del panel
    document.getElementById('ultimate-btn-sync').onclick = async () => {
        document.getElementById('ultimate-tiempo').textContent = "sincronizando...";
        await BERKOT_ULTIMATE.sincronizarInteligente();
        actualizarPanel();
        document.getElementById('ultimate-tiempo').textContent = "ahora";
    };
    
    document.getElementById('ultimate-btn-add').onclick = () => {
        BERKOT_ULTIMATE.añadirProducto();
        actualizarPanel();
        actualizarInterfaz();
    };
    
    // Actualizar cada 5 segundos
    setInterval(actualizarPanel, 5000);
    actualizarPanel();
}

// ===== INICIALIZAR SISTEMA =====
async function iniciarBerkotUltimate() {
    console.log("🎯 Iniciando Berkot Ultimate...");
    
    // 1. Añadir estilos CSS
    const estilos = document.createElement('style');
    estilos.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(estilos);
    
    // 2. Crear panel de control
    crearPanelControl();
    
    // 3. Integrar con panel admin
    integrarPanelAdmin();
    
    // 4. Sincronizar inicialmente
    setTimeout(async () => {
        await BERKOT_ULTIMATE.sincronizarInteligente();
        actualizarInterfaz();
    }, 2000);
    
    // 5. Sincronizar automáticamente cada 2 minutos
    setInterval(async () => {
        await BERKOT_ULTIMATE.sincronizarInteligente();
        actualizarInterfaz();
    }, 120000);
    
    // 6. Hacer disponible globalmente
    window.BERKOT_ULTIMATE = BERKOT_ULTIMATE;
    
    console.log("✅ Berkot Ultimate inicializado correctamente");
}

// ===== VERIFICAR CREDENCIALES =====
function verificarConfiguracion() {
    if (BERKOT_ULTIMATE.BIN_ID === "TU_BIN_ID_AQUI" || 
        BERKOT_ULTIMATE.ACCESS_KEY === "TU_ACCESS_KEY_AQUI") {
        
        setTimeout(() => {
            BERKOT_ULTIMATE.mostrarNotificacion(
                "⚠️ Configura tus credenciales en berkot.js", 
                "warning", 
                10000
            );
        }, 3000);
    }
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
    }, 1000);
}

console.log("👑 Berkot Ultimate - Sistema completo cargado");

// ===== PROTECCIÓN MÁXIMA - ELIMINAR DATOS SENSIBLES =====
(function protegerDatosSensibles() {
    console.log("🛡️ Activando protección de datos sensibles...");
    
    // Esperar a que cargue la página
    function iniciarProteccion() {
        // Lista de datos a ocultar
        const datosPeligrosos = [
            'berkot2026', 'Berkot2026', 'BERKOT2026',
            'Contraseña:', 'Password:', 'contraseña:',
            'admin123', 'password', '123456'
        ];
        
        // 1. Eliminar texto visible
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            datosPeligrosos.forEach(dato => {
                if (node.textContent.includes(dato)) {
                    // Reemplazar con asteriscos
                    const nuevoTexto = node.textContent.replace(
                        new RegExp(dato, 'gi'),
                        '*******'
                    );
                    node.textContent = nuevoTexto;
                }
            });
        }
        
        // 2. Limpiar HTML
        document.querySelectorAll('*').forEach(element => {
            if (element.innerHTML) {
                let html = element.innerHTML;
                datosPeligrosos.forEach(dato => {
                    html = html.replace(new RegExp(dato, 'gi'), '*******');
                });
                element.innerHTML = html;
            }
        });
        
        // 3. Bloquear inspección (parcial)
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', e => {
            // Bloquear F12, Ctrl+Shift+I, Ctrl+U
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                alert('🔒 Acceso restringido');
            }
        });
        
        console.log("✅ Protección activada - Datos sensibles ocultos");
    }
    
    // Ejecutar en diferentes momentos
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarProteccion);
    } else {
        iniciarProteccion();
    }
    
    // Ejecuciones adicionales
    setTimeout(iniciarProteccion, 1000);
    setTimeout(iniciarProteccion, 3000);
    setInterval(iniciarProteccion, 30000); // Cada 30 segundos
})();
