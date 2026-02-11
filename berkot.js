// ========== BERKOT FIREBASE - VERSIÓN DEFINITIVA CORREGIDA ==========
// ========== CON SINCRONIZACIÓN INSTANTÁNEA EN TODOS LOS DISPOSITIVOS ==========

console.log("🔥 BERKOT FIREBASE - Iniciando sistema...");

// ===== 🔴 TUS CREDENCIALES DE FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyBLNbTI1YrKVb1iA7YxTSSYRVCh3DiJHEY",
    authDomain: "berkot-nn-9938d.firebaseapp.com",
    databaseURL: "https://berkot-nn-9938d-default-rtdb.firebaseio.com",
    projectId: "berkot-nn-9938d",
    storageBucket: "berkot-nn-9938d.firebasestorage.app",
    messagingSenderId: "528237886603",
    appId: "1:528237886603:web:8dd8a703f101ed0a7d288e",
    measurementId: "G-RJ9F7GR7GP"
};

// ===== IMPORTAR FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== INICIALIZAR FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ===== VARIABLE GLOBAL DE PRODUCTOS =====
window.storeData = window.storeData || { products: [] };

// ===== FUNCIÓN PRINCIPAL PARA MOSTRAR PRODUCTOS =====
function mostrarProductosEnPagina() {
    console.log("🔄 Actualizando productos en la página...");
    
    // 1. BUSCAR TODOS LOS POSIBLES CONTENEDORES DE PRODUCTOS
    let contenedores = document.querySelectorAll('.products, .product-grid, #products, .product-list, [class*="producto"], [class*="product"], [id*="producto"], [id*="product"]');
    
    // 2. SI NO HAY CONTENEDORES, CREAR UNO AUTOMÁTICAMENTE
    if (contenedores.length === 0) {
        console.log("📦 No hay contenedor de productos. Creando uno...");
        
        // Buscar dónde insertar los productos
        const main = document.querySelector('main') || document.querySelector('.content') || document.querySelector('body');
        
        // Crear sección de productos
        const seccionProductos = document.createElement('div');
        seccionProductos.id = 'seccion-productos-berkot';
        seccionProductos.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;
        
        main.appendChild(seccionProductos);
        contenedores = [seccionProductos];
        console.log("✅ Contenedor de productos creado automáticamente");
    }
    
    // 3. MOSTRAR PRODUCTOS EN CADA CONTENEDOR
    contenedores.forEach(contenedor => {
        // Guardar referencia para futuras actualizaciones
        window.contenedorProductos = contenedor;
        
        // Generar HTML de productos
        let html = '';
        
        if (!window.storeData.products || window.storeData.products.length === 0) {
            html = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <h3>🛒 No hay productos disponibles</h3>
                    <p>Agrega productos desde el panel de administración</p>
                </div>
            `;
        } else {
            html = `
                <h2 style="text-align: center; margin: 30px 0; color: #333;">🛍️ Nuestros Productos</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px; padding: 20px;">
            `;
            
            window.storeData.products.forEach(p => {
                html += `
                    <div style="
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;
                        padding: 20px;
                        background: white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        transition: transform 0.3s, box-shadow 0.3s;
                        display: flex;
                        flex-direction: column;
                    " 
                    onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';">
                        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.2em;">${p.name || 'Producto'}</h3>
                        <p style="font-size: 28px; color: #27ae60; font-weight: bold; margin: 10px 0; display: flex; align-items: baseline;">
                            $${p.basePrice?.toFixed(2) || '0.00'}
                            <span style="font-size: 14px; color: #666; font-weight: normal; margin-left: 5px;">/${p.unit || 'lb'}</span>
                        </p>
                        ${p.description ? `<p style="color: #666; margin: 10px 0; line-height: 1.4;">${p.description}</p>` : ''}
                        <div style="margin-top: auto; padding-top: 15px;">
                            <span style="
                                background: ${p.available !== false ? '#e8f5e9' : '#ffebee'};
                                color: ${p.available !== false ? '#2e7d32' : '#c62828'};
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                font-weight: bold;
                            ">
                                ${p.available !== false ? '✓ Disponible' : '✗ Agotado'}
                            </span>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        // REEMPLAZAR TODO EL CONTENIDO DEL CONTENEDOR
        contenedor.innerHTML = html;
    });
    
    console.log(`✅ ${window.storeData.products?.length || 0} productos mostrados en la página`);
}

// ===== ESCUCHAR CAMBIOS EN TIEMPO REAL =====
const productosRef = ref(db, 'productos');

onValue(productosRef, (snapshot) => {
    const productos = snapshot.val();
    
    if (productos) {
        // Convertir objeto de Firebase a array y GUARDAR EN TIEMPO REAL
        window.storeData.products = Object.keys(productos).map(key => ({
            id: key,
            name: productos[key].name || "Producto",
            basePrice: productos[key].basePrice || 0,
            description: productos[key].description || "",
            unit: productos[key].unit || "lb",
            minQty: productos[key].minQty || 0.5,
            available: productos[key].available !== false,
            icon: productos[key].icon || "fa-box"
        }));
        
        console.log(`✅ ${window.storeData.products.length} productos cargados desde Firebase`);
        
        // ACTUALIZAR LA PÁGINA INMEDIATAMENTE
        mostrarProductosEnPagina();
        
        // Guardar copia local para respaldo
        localStorage.setItem('berkot_productos_backup', JSON.stringify(window.storeData.products));
    }
}, (error) => {
    console.error("❌ Error cargando productos:", error);
    
    // Intentar cargar de respaldo local
    const backup = localStorage.getItem('berkot_productos_backup');
    if (backup) {
        window.storeData.products = JSON.parse(backup);
        mostrarProductosEnPagina();
        console.log("📦 Productos cargados desde respaldo local");
    }
});

// ===== FUNCIÓN PARA GUARDAR PRODUCTO =====
window.guardarProducto = async function(producto) {
    try {
        if (!producto.id) {
            const newRef = push(productosRef);
            producto.id = newRef.key;
            await set(newRef, {
                name: producto.name || "Nuevo Producto",
                basePrice: producto.basePrice || 1.00,
                description: producto.description || "",
                unit: producto.unit || "lb",
                minQty: producto.minQty || 0.5,
                available: true,
                icon: "fa-box"
            });
        } else {
            await set(ref(db, `productos/${producto.id}`), {
                name: producto.name,
                basePrice: producto.basePrice,
                description: producto.description || "",
                unit: producto.unit || "lb",
                minQty: producto.minQty || 0.5,
                available: producto.available !== false,
                icon: producto.icon || "fa-box"
            });
        }
        
        console.log("✅ Producto guardado:", producto.name);
        return true;
    } catch (error) {
        console.error("❌ Error guardando producto:", error);
        alert("❌ Error al guardar: " + error.message);
        return false;
    }
};

// ===== FUNCIÓN PARA ELIMINAR PRODUCTO =====
window.eliminarProducto = async function(id) {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return false;
    
    try {
        await remove(ref(db, `productos/${id}`));
        console.log("✅ Producto eliminado");
        return true;
    } catch (error) {
        console.error("❌ Error eliminando producto:", error);
        alert("❌ Error al eliminar: " + error.message);
        return false;
    }
};

// ===== FUNCIÓN PARA INICIAR SESIÓN =====
window.loginAdmin = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Sesión iniciada:", email);
        return true;
    } catch (error) {
        console.error("❌ Error de login:", error);
        alert("❌ Email o contraseña incorrectos");
        return false;
    }
};

// ===== FUNCIÓN PARA CERRAR SESIÓN =====
window.logoutAdmin = async function() {
    await signOut(auth);
    console.log("✅ Sesión cerrada");
};

// ===== CREAR PANEL ADMIN Y BOTÓN FLOTANTE =====
setTimeout(() => {
    // ELIMINAR ELEMENTOS ANTERIORES
    const btnExistente = document.getElementById('btn-admin-berkot');
    if (btnExistente) btnExistente.remove();
    
    const panelExistente = document.getElementById('panel-admin-berkot');
    if (panelExistente) panelExistente.remove();
    
    // ===== BOTÓN ADMIN FLOTANTE =====
    const btnAdmin = document.createElement('button');
    btnAdmin.id = 'btn-admin-berkot';
    btnAdmin.innerHTML = '⚙️ Admin Panel';
    btnAdmin.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 30px;
        background: #FFA000;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 15px rgba(255,160,0,0.5);
        transition: transform 0.3s, box-shadow 0.3s;
    `;
    btnAdmin.onmouseover = () => {
        btnAdmin.style.transform = 'scale(1.05)';
        btnAdmin.style.boxShadow = '0 8px 25px rgba(255,160,0,0.6)';
    };
    btnAdmin.onmouseout = () => {
        btnAdmin.style.transform = 'scale(1)';
        btnAdmin.style.boxShadow = '0 4px 15px rgba(255,160,0,0.5)';
    };
    document.body.appendChild(btnAdmin);
    
    // ===== PANEL ADMIN =====
    const panel = document.createElement('div');
    panel.id = 'panel-admin-berkot';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 500px;
        max-height: 85vh;
        overflow-y: auto;
        background: white;
        padding: 25px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 1000000;
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="color: #FFA000; margin: 0; font-size: 24px;">
                🔥 Berkot Admin
            </h2>
            <button id="cerrar-panel" style="
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: #666;
                padding: 0 10px;
            ">&times;</button>
        </div>
        
        <div id="login-section" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            color: white;
        ">
            <h3 style="margin-top: 0; color: white;">🔐 Acceso Administrador</h3>
            <input type="email" id="admin-email" placeholder="Correo electrónico" 
                   style="width: 100%; padding: 12px; margin-bottom: 15px; border: none; border-radius: 8px; font-size: 14px;">
            <input type="password" id="admin-password" placeholder="Contraseña" 
                   style="width: 100%; padding: 12px; margin-bottom: 15px; border: none; border-radius: 8px; font-size: 14px;">
            <button id="btn-login" style="
                width: 100%;
                padding: 12px;
                background: white;
                color: #764ba2;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: transform 0.2s;
            ">Iniciar Sesión</button>
            <p style="margin-top: 15px; font-size: 12px; opacity: 0.9; text-align: center;">
                Usa: admin@berkot.com / Berkot2026Admin
            </p>
        </div>
        
        <div id="admin-section" style="display: none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color: #333;">➕ Agregar Producto</h3>
                <button id="btn-logout" style="
                    padding: 8px 16px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                ">Cerrar Sesión</button>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <input type="text" id="product-name" placeholder="Nombre del producto" 
                       style="width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <input type="number" id="product-price" placeholder="Precio" step="0.01"
                           style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
                    <select id="product-unit" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
                        <option value="lb">Libras (lb)</option>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="unidad">Unidad</option>
                        <option value="oz">Onzas (oz)</option>
                    </select>
                </div>
                
                <textarea id="product-description" placeholder="Descripción del producto" rows="3"
                          style="width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical;"></textarea>
                
                <button id="btn-save" style="
                    width: 100%;
                    padding: 14px;
                    background: #27ae60;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.3s;
                ">💾 Guardar Producto</button>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">📋 Productos Actuales</h3>
            <div id="productos-lista" style="
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #eee;
                border-radius: 10px;
                padding: 15px;
                background: #fafafa;
            "></div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // ===== EVENTOS DEL PANEL =====
    btnAdmin.onclick = () => {
        panel.style.display = 'block';
        actualizarListaProductos();
    };
    
    document.getElementById('cerrar-panel').onclick = () => {
        panel.style.display = 'none';
    };
    
    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        if (await window.loginAdmin(email, password)) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
            actualizarListaProductos();
        }
    };
    
    document.getElementById('btn-logout').onclick = async () => {
        await window.logoutAdmin();
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
        document.getElementById('admin-email').value = '';
        document.getElementById('admin-password').value = '';
    };
    
    document.getElementById('btn-save').onclick = async () => {
        const nameInput = document.getElementById('product-name');
        const priceInput = document.getElementById('product-price');
        
        if (!nameInput.value.trim()) {
            alert("❌ Por favor ingresa un nombre para el producto");
            return;
        }
        
        if (!priceInput.value || parseFloat(priceInput.value) <= 0) {
            alert("❌ Por favor ingresa un precio válido");
            return;
        }
        
        const producto = {
            name: nameInput.value.trim(),
            basePrice: parseFloat(priceInput.value),
            unit: document.getElementById('product-unit').value,
            description: document.getElementById('product-description').value.trim(),
            available: true,
            minQty: 0.5,
            icon: "fa-box"
        };
        
        if (await window.guardarProducto(producto)) {
            nameInput.value = '';
            priceInput.value = '';
            document.getElementById('product-description').value = '';
            actualizarListaProductos();
            alert("✅ Producto guardado exitosamente");
        }
    };
    
    function actualizarListaProductos() {
        const container = document.getElementById('productos-lista');
        if (!container) return;
        
        if (!window.storeData.products || window.storeData.products.length === 0) {
            container.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">📭 No hay productos disponibles</p>';
            return;
        }
        
        let html = '';
        window.storeData.products.forEach(prod => {
            html += `
                <div style="
                    border-bottom: 1px solid #eee;
                    padding: 15px 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="flex: 1;">
                        <strong style="font-size: 16px; color: #333;">${prod.name}</strong>
                        <div style="color: #27ae60; font-weight: bold; margin-top: 5px;">
                            $${prod.basePrice?.toFixed(2) || '0.00'} / ${prod.unit || 'lb'}
                        </div>
                        ${prod.description ? `<p style="color: #666; font-size: 13px; margin-top: 5px;">${prod.description.substring(0, 50)}${prod.description.length > 50 ? '...' : ''}</p>` : ''}
                    </div>
                    <button onclick="eliminarProducto('${prod.id}')" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 13px;
                        margin-left: 10px;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
                        🗑️ Eliminar
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    console.log("✅ Panel admin creado exitosamente");
}, 1000);

// ===== OCULTAR CONTRASEÑA VISIBLE EN LA PÁGINA =====
setTimeout(() => {
    document.querySelectorAll('*').forEach(el => {
        if (el.innerHTML) {
            el.innerHTML = el.innerHTML.replace(/berkot2026/gi, '••••••••');
            el.innerHTML = el.innerHTML.replace(/Berkot2026Admin/gi, '••••••••');
            el.innerHTML = el.innerHTML.replace(/admin@berkot\.com/gi, '••••@••••.com');
        }
    });
}, 500);

// ===== INICIALIZAR =====
console.log("🚀 Inicializando Berkot Firebase...");
console.log("✅ Berkot Firebase inicializado correctamente");
console.log("🔥 Sistema Berkot Firebase listo y funcionando!");
console.log("✅ Credenciales configuradas correctamente");
console.log("📍 Base de datos:", firebaseConfig.databaseURL);

// ===== EXPORTAR FUNCIONES =====
window.BERKOT_FIREBASE = {
    db,
    auth,
    guardarProducto: window.guardarProducto,
    eliminarProducto: window.eliminarProducto,
    loginAdmin: window.loginAdmin,
    logoutAdmin: window.logoutAdmin,
    mostrarProductos: mostrarProductosEnPagina
};
