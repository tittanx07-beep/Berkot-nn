// ========== BERKOT FIREBASE - VERSIÓN DEFINITIVA FUNCIONAL ==========
// ========== CONFIGURADO CON TUS CREDENCIALES ==========

console.log("🔥 BERKOT FIREBASE - Iniciando sistema...");

// ===== 🔴 TUS CREDENCIALES DE FIREBASE (YA CONFIGURADAS) 🔴 =====
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

// ===== IMPORTAR FIREBASE DESDE CDN =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== INICIALIZAR FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ===== VARIABLE GLOBAL DE PRODUCTOS =====
window.storeData = window.storeData || { products: [] };

// ===== 1. ESCUCHAR CAMBIOS EN TIEMPO REAL =====
const productosRef = ref(db, 'productos');

onValue(productosRef, (snapshot) => {
    const productos = snapshot.val();
    
    if (productos) {
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
        
        // ACTUALIZAR LA INTERFAZ SI EXISTEN LAS FUNCIONES
        if (typeof window.renderProducts === 'function') {
            window.renderProducts();
        }
        if (typeof window.actualizarInterfaz === 'function') {
            window.actualizarInterfaz();
        }
        if (typeof window.cargarListaProductosAdmin === 'function') {
            window.cargarListaProductosAdmin();
        }
        
        // DISPARAR EVENTO PERSONALIZADO
        window.dispatchEvent(new CustomEvent('firebase-productos-actualizados', { 
            detail: window.storeData.products 
        }));
    }
}, (error) => {
    console.error("❌ Error cargando productos:", error);
});

// ===== 2. FUNCIÓN PARA GUARDAR PRODUCTO =====
window.guardarProducto = async function(producto) {
    try {
        if (!producto.id) {
            // NUEVO PRODUCTO
            const newRef = push(productosRef);
            producto.id = newRef.key;
            await set(newRef, {
                name: producto.name || "Nuevo Producto",
                basePrice: producto.basePrice || 1.00,
                description: producto.description || "",
                unit: producto.unit || "lb",
                minQty: producto.minQty || 0.5,
                available: producto.available !== false,
                icon: producto.icon || "fa-box"
            });
        } else {
            // ACTUALIZAR PRODUCTO EXISTENTE
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

// ===== 3. FUNCIÓN PARA ELIMINAR PRODUCTO =====
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

// ===== 4. FUNCIÓN PARA INICIAR SESIÓN =====
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

// ===== 5. FUNCIÓN PARA CERRAR SESIÓN =====
window.logoutAdmin = async function() {
    await signOut(auth);
    console.log("✅ Sesión cerrada");
};

// ===== 6. CREAR PANEL ADMIN Y BOTÓN FLOTANTE =====
function crearPanelAdmin() {
    // ELIMINAR PANEL ANTERIOR SI EXISTE
    const panelExistente = document.getElementById('berkot-firebase-panel');
    if (panelExistente) panelExistente.remove();
    
    const btnExistente = document.getElementById('btn-admin-berkot');
    if (btnExistente) btnExistente.remove();
    
    // ===== BOTÓN FLOTANTE =====
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
        transition: transform 0.3s;
    `;
    btnAdmin.onmouseover = () => btnAdmin.style.transform = 'scale(1.05)';
    btnAdmin.onmouseout = () => btnAdmin.style.transform = 'scale(1)';
    document.body.appendChild(btnAdmin);
    
    // ===== PANEL ADMIN =====
    const panel = document.createElement('div');
    panel.id = 'berkot-firebase-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 550px;
        max-height: 85vh;
        overflow-y: auto;
        background: white;
        padding: 25px;
        border-radius: 20px;
        box-shadow: 0 15px 50px rgba(0,0,0,0.3);
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
        
        <!-- SECCIÓN LOGIN -->
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
        
        <!-- SECCIÓN ADMIN (OCULTA INICIALMENTE) -->
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
            
            <!-- FORMULARIO NUEVO PRODUCTO -->
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
            
            <!-- LISTA DE PRODUCTOS -->
            <h3 style="color: #333; margin-bottom: 15px;">📋 Productos en Tienda</h3>
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
    
    // ABRIR PANEL
    btnAdmin.onclick = () => {
        panel.style.display = 'block';
        actualizarListaProductos();
    };
    
    // CERRAR PANEL
    document.getElementById('cerrar-panel').onclick = () => {
        panel.style.display = 'none';
    };
    
    // LOGIN
    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        if (await window.loginAdmin(email, password)) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
            actualizarListaProductos();
        }
    };
    
    // LOGOUT
    document.getElementById('btn-logout').onclick = async () => {
        await window.logoutAdmin();
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
        document.getElementById('admin-email').value = '';
        document.getElementById('admin-password').value = '';
    };
    
    // GUARDAR PRODUCTO
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
            // LIMPIAR FORMULARIO
            nameInput.value = '';
            priceInput.value = '';
            document.getElementById('product-description').value = '';
            
            // ACTUALIZAR LISTA
            actualizarListaProductos();
            
            alert("✅ Producto guardado exitosamente");
        }
    };
    
    // FUNCIÓN PARA ACTUALIZAR LISTA DE PRODUCTOS
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
                            $${prod.basePrice.toFixed(2)} / ${prod.unit || 'lb'}
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
}

// ===== 7. INICIALIZAR TODO CUANDO CARGUE LA PÁGINA =====
function iniciarBerkotFirebase() {
    console.log("🚀 Inicializando Berkot Firebase...");
    
    // CREAR PANEL ADMIN
    setTimeout(() => {
        try {
            crearPanelAdmin();
            console.log("✅ Panel admin creado exitosamente");
        } catch (error) {
            console.error("❌ Error creando panel admin:", error);
        }
    }, 1000);
    
    console.log("✅ Berkot Firebase inicializado correctamente");
}

// ===== 8. EJECUTAR INICIALIZACIÓN =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarBerkotFirebase);
} else {
    setTimeout(iniciarBerkotFirebase, 500);
}

// ===== 9. EXPORTAR FUNCIONES PARA USO GLOBAL =====
window.BERKOT_FIREBASE = {
    db,
    auth,
    guardarProducto: window.guardarProducto,
    eliminarProducto: window.eliminarProducto,
    loginAdmin: window.loginAdmin,
    logoutAdmin: window.logoutAdmin
};

console.log("🔥 Sistema Berkot Firebase listo y funcionando!");
console.log("✅ Credenciales configuradas correctamente");
console.log("📍 Base de datos:", firebaseConfig.databaseURL);
