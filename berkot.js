// ========== BERKOT FIREBASE - VERSIÓN DEFINITIVA COMPLETA ==========
// ========== CON TODAS LAS CORRECCIONES Y MEJORAS ==========

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

// ===== FUNCIÓN PARA MOSTRAR PRODUCTOS - VERSIÓN CORREGIDA SIN DUPLICADOS =====
function mostrarProductosEnPagina() {
    console.log("🔄 Actualizando productos en la página...");
    
    // 1. ELIMINAR CONTENEDORES DUPLICADOS
    const contenedores = document.querySelectorAll('.products, .product-grid, #products, .product-list, [class*="producto"], [class*="product"], [id*="producto"], [id*="product"], #seccion-productos-berkot');
    
    if (contenedores.length > 1) {
        console.log(`⚠️ Eliminando ${contenedores.length - 1} contenedores duplicados...`);
        for (let i = 1; i < contenedores.length; i++) {
            contenedores[i].remove();
        }
    }
    
    // 2. OBTENER O CREAR CONTENEDOR PRINCIPAL
    let contenedorPrincipal = document.querySelector('#seccion-productos-berkot, .products, .product-grid, #products, .product-list');
    
    if (!contenedorPrincipal) {
        console.log("📦 Creando nuevo contenedor de productos...");
        const main = document.querySelector('main') || document.querySelector('.content') || document.querySelector('body');
        contenedorPrincipal = document.createElement('div');
        contenedorPrincipal.id = 'seccion-productos-berkot';
        contenedorPrincipal.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;
        main.appendChild(contenedorPrincipal);
        console.log("✅ Contenedor creado exitosamente");
    }
    
    // 3. GENERAR HTML DE PRODUCTOS
    let html = '';
    
    if (!window.storeData.products || window.storeData.products.length === 0) {
        html = `
            <div style="text-align: center; padding: 60px 20px; color: #666; background: #f9f9f9; border-radius: 12px;">
                <span style="font-size: 48px;">🛒</span>
                <h3 style="margin: 20px 0 10px;">No hay productos disponibles</h3>
                <p style="color: #999;">Agrega productos desde el panel de administración</p>
            </div>
        `;
    } else {
        html = `
            <h2 style="text-align: center; margin: 30px 0; color: #333; font-size: 2em;">🛍️ Nuestros Productos</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; padding: 20px;">
        `;
        
        window.storeData.products.forEach(p => {
            const unidad = p.unit || 'lb';
            const paso = unidad === 'unidad' ? 1 : 0.5;
            const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
            
            html += `
                <div style="
                    border: 1px solid #e0e0e0;
                    border-radius: 16px;
                    padding: 25px;
                    background: white;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease;
                    position: relative;
                " 
                onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 12px 24px rgba(0,0,0,0.12)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';">
                    
                    <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.4em; font-weight: 600;">${p.name || 'Producto'}</h3>
                    
                    <div style="display: flex; align-items: baseline; margin-bottom: 15px;">
                        <span style="font-size: 32px; color: #27ae60; font-weight: bold;">$${p.basePrice?.toFixed(2) || '0.00'}</span>
                        <span style="font-size: 16px; color: #666; margin-left: 5px;">/${unidad}</span>
                    </div>
                    
                    ${p.description ? `<p style="color: #666; margin: 0 0 20px 0; line-height: 1.5; font-size: 14px;">${p.description}</p>` : ''}
                    
                    <!-- SELECTOR DE CANTIDAD MEJORADO -->
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin: 15px 0;
                        padding: 15px;
                        background: #f8f9fa;
                        border-radius: 12px;
                        border: 1px solid #e9ecef;
                    ">
                        <span style="color: #495057; font-weight: 600;">Cantidad:</span>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <button onclick="disminuirCantidad('${p.id}', ${min}, ${paso})" style="
                                width: 36px;
                                height: 36px;
                                background: white;
                                border: 1px solid #ced4da;
                                border-radius: 8px;
                                font-size: 20px;
                                font-weight: bold;
                                color: #495057;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='white'">−</button>
                            
                            <input type="number" id="cantidad-${p.id}" value="${min}" min="${min}" step="${paso}" style="
                                width: 80px;
                                height: 40px;
                                text-align: center;
                                border: 1px solid #ced4da;
                                border-radius: 8px;
                                font-size: 16px;
                                font-weight: 600;
                                color: #495057;
                                background: white;
                            " onchange="actualizarTotalProducto('${p.id}', ${p.basePrice})">
                            
                            <button onclick="aumentarCantidad('${p.id}', ${paso})" style="
                                width: 36px;
                                height: 36px;
                                background: white;
                                border: 1px solid #ced4da;
                                border-radius: 8px;
                                font-size: 20px;
                                font-weight: bold;
                                color: #495057;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                transition: all 0.2s;
                            " onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='white'">+</button>
                        </div>
                        <span id="total-${p.id}" style="color: #27ae60; font-weight: bold; font-size: 20px;">
                            $${(p.basePrice * min).toFixed(2)}
                        </span>
                    </div>
                    
                    <!-- BOTÓN COMPRAR MEJORADO -->
                    <button onclick="comprarProducto('${p.id}')" style="
                        background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
                        color: white;
                        border: none;
                        padding: 16px 20px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        margin-top: 10px;
                        transition: all 0.3s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    " onmouseover="this.style.background='linear-gradient(135deg, #219a52 0%, #1e8744 100%)'; this.style.transform='scale(1.02)';" 
                       onmouseout="this.style.background='linear-gradient(135deg, #27ae60 0%, #219a52 100%)'; this.style.transform='scale(1)';">
                        🛒 Agregar al Carrito
                    </button>
                </div>
            `;
        });
        
        html += `</div>`;
    }
    
    contenedorPrincipal.innerHTML = html;
    console.log(`✅ ${window.storeData.products?.length || 0} productos mostrados correctamente`);
}

// ===== FUNCIONES DE CANTIDAD MEJORADAS =====
window.disminuirCantidad = function(id, min, paso) {
    const input = document.getElementById(`cantidad-${id}`);
    if (input) {
        let valor = parseFloat(input.value) || min;
        valor = Math.max(min, valor - paso);
        valor = Math.round(valor * 10) / 10;
        input.value = valor;
        actualizarTotalProducto(id, window.storeData.products.find(p => p.id === id)?.basePrice || 0);
    }
};

window.aumentarCantidad = function(id, paso) {
    const input = document.getElementById(`cantidad-${id}`);
    if (input) {
        let valor = parseFloat(input.value) || 0.5;
        valor = valor + paso;
        valor = Math.round(valor * 10) / 10;
        input.value = valor;
        actualizarTotalProducto(id, window.storeData.products.find(p => p.id === id)?.basePrice || 0);
    }
};

window.actualizarTotalProducto = function(id, precio) {
    const input = document.getElementById(`cantidad-${id}`);
    const totalSpan = document.getElementById(`total-${id}`);
    if (input && totalSpan) {
        const cantidad = parseFloat(input.value) || 0;
        const total = precio * cantidad;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }
};

// ===== FUNCIÓN DE COMPRA CORREGIDA =====
window.comprarProducto = function(id) {
    const producto = window.storeData.products.find(p => p.id === id);
    if (!producto) {
        alert("❌ Producto no encontrado");
        return;
    }
    
    const input = document.getElementById(`cantidad-${id}`);
    const cantidad = input ? parseFloat(input.value) : (producto.minQty || 0.5);
    
    const item = {
        id: producto.id,
        nombre: producto.name,
        precio: producto.basePrice,
        unidad: producto.unit || 'lb',
        cantidad: cantidad,
        total: producto.basePrice * cantidad,
        timestamp: Date.now()
    };
    
    let carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    const existente = carrito.findIndex(p => p.id === id);
    
    if (existente !== -1) {
        carrito[existente].cantidad += cantidad;
        carrito[existente].total = carrito[existente].precio * carrito[existente].cantidad;
        carrito[existente].timestamp = Date.now();
    } else {
        carrito.push(item);
    }
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    
    // NOTIFICACIÓN MEJORADA
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
        color: white;
        padding: 20px 25px;
        border-radius: 12px;
        z-index: 999999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 8px 25px rgba(39,174,96,0.3);
        font-family: Arial, sans-serif;
        max-width: 320px;
    `;
    notificacion.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 28px;">✅</span>
            <div>
                <strong style="font-size: 16px;">${cantidad.toFixed(1)} ${item.unidad} de ${producto.name}</strong>
                <div style="display: flex; justify-content: space-between; margin-top: 8px;">
                    <span style="opacity: 0.9;">Total:</span>
                    <span style="font-weight: bold; font-size: 18px;">$${item.total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
    
    actualizarContadorCarrito();
    console.log(`🛒 Compra exitosa: ${cantidad} ${item.unidad} de ${producto.name} - $${item.total.toFixed(2)}`);
};

// ===== ACTUALIZAR CONTADOR DEL CARRITO =====
window.actualizarContadorCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    
    let contador = document.getElementById('carrito-contador');
    if (!contador) {
        contador = document.createElement('span');
        contador.id = 'carrito-contador';
        contador.style.cssText = `
            position: fixed;
            bottom: 95px;
            right: 20px;
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            z-index: 999998;
            box-shadow: 0 2px 5px rgba(231,76,60,0.3);
        `;
        document.body.appendChild(contador);
    }
    
    contador.textContent = totalItems.toFixed(1);
    contador.style.display = totalItems > 0 ? 'flex' : 'none';
};

// ===== VER CARRITO MEJORADO =====
window.verCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    
    if (carrito.length === 0) {
        alert("🛒 Tu carrito está vacío");
        return;
    }
    
    let mensaje = "🛍️ MI CARRITO DE COMPRAS\n";
    mensaje += "══════════════════════\n\n";
    let totalGeneral = 0;
    
    carrito.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre}\n`;
        mensaje += `   ${item.cantidad.toFixed(1)} ${item.unidad} x $${item.precio.toFixed(2)}\n`;
        mensaje += `   Subtotal: $${item.total.toFixed(2)}\n\n`;
        totalGeneral += item.total;
    });
    
    mensaje += "══════════════════════\n";
    mensaje += `💰 TOTAL: $${totalGeneral.toFixed(2)}\n\n`;
    mensaje += "¿Vaciar carrito?";
    
    if (confirm(mensaje)) {
        localStorage.removeItem('berkot_carrito');
        actualizarContadorCarrito();
        alert("✅ Carrito vaciado exitosamente");
    }
};

// ===== BOTÓN DE CARRITO =====
setTimeout(() => {
    if (!document.getElementById('btn-carrito')) {
        const btnCarrito = document.createElement('button');
        btnCarrito.id = 'btn-carrito';
        btnCarrito.innerHTML = '🛒';
        btnCarrito.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 26px;
            cursor: pointer;
            z-index: 999997;
            box-shadow: 0 6px 20px rgba(52,152,219,0.4);
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        btnCarrito.onmouseover = () => {
            btnCarrito.style.transform = 'scale(1.1)';
            btnCarrito.style.boxShadow = '0 8px 25px rgba(52,152,219,0.5)';
        };
        btnCarrito.onmouseout = () => {
            btnCarrito.style.transform = 'scale(1)';
            btnCarrito.style.boxShadow = '0 6px 20px rgba(52,152,219,0.4)';
        };
        btnCarrito.onclick = window.verCarrito;
        document.body.appendChild(btnCarrito);
        actualizarContadorCarrito();
    }
}, 1500);

// ===== ESCUCHAR CAMBIOS DE FIREBASE EN TIEMPO REAL =====
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
            minQty: productos[key].minQty || 0.5
        }));
        
        console.log(`✅ ${window.storeData.products.length} productos sincronizados desde Firebase`);
        mostrarProductosEnPagina();
        
        // Backup local
        localStorage.setItem('berkot_backup_productos', JSON.stringify(window.storeData.products));
    }
}, (error) => {
    console.error("❌ Error de Firebase:", error);
    
    // Cargar backup local
    const backup = localStorage.getItem('berkot_backup_productos');
    if (backup) {
        window.storeData.products = JSON.parse(backup);
        mostrarProductosEnPagina();
        console.log("📦 Productos cargados desde backup local");
    }
});

// ===== FUNCIONES ADMIN =====
window.guardarProducto = async function(producto) {
    try {
        if (!producto.id) {
            const newRef = push(productosRef);
            producto.id = newRef.key;
            await set(newRef, {
                name: producto.name,
                basePrice: producto.basePrice,
                unit: producto.unit || 'lb',
                description: producto.description || '',
                minQty: 0.5
            });
        }
        alert("✅ Producto guardado exitosamente");
        return true;
    } catch (error) {
        console.error("Error:", error);
        alert("❌ Error al guardar: " + error.message);
        return false;
    }
};

window.eliminarProducto = async function(id) {
    if (confirm("¿Eliminar este producto permanentemente?")) {
        await remove(ref(db, `productos/${id}`));
    }
};

window.loginAdmin = async function(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return true;
    } catch (error) {
        alert("❌ Email o contraseña incorrectos");
        return false;
    }
};

// ===== ADMIN PANEL - BOTÓN EN IZQUIERDA =====
setTimeout(() => {
    // Eliminar botón anterior
    const btnExistente = document.getElementById('btn-admin-berkot');
    if (btnExistente) btnExistente.remove();
    
    // Botón admin en IZQUIERDA
    const btnAdmin = document.createElement('button');
    btnAdmin.id = 'btn-admin-berkot';
    btnAdmin.innerHTML = '⚙️ Admin';
    btnAdmin.style.cssText = `
        position: fixed;
        bottom: 20px;
        LEFT: 20px;
        padding: 12px 25px;
        background: linear-gradient(135deg, #FFA000 0%, #FF8F00 100%);
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 15px rgba(255,160,0,0.4);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    btnAdmin.onmouseover = () => {
        btnAdmin.style.transform = 'scale(1.05)';
        btnAdmin.style.boxShadow = '0 6px 20px rgba(255,160,0,0.5)';
    };
    btnAdmin.onmouseout = () => {
        btnAdmin.style.transform = 'scale(1)';
        btnAdmin.style.boxShadow = '0 4px 15px rgba(255,160,0,0.4)';
    };
    document.body.appendChild(btnAdmin);
    
    // Panel admin
    const panel = document.createElement('div');
    panel.id = 'panel-admin-berkot';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 450px;
        max-height: 85vh;
        overflow-y: auto;
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.25);
        z-index: 1000000;
        display: none;
        font-family: Arial, sans-serif;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h2 style="color: #FFA000; margin:0; font-size: 24px;">🔥 Berkot Admin</h2>
            <button id="cerrar-panel" style="background:none; border:none; font-size: 28px; cursor:pointer; color:#666;">&times;</button>
        </div>
        
        <div id="login-section">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 15px; color: white;">
                <h3 style="margin-top:0; color:white;">🔐 Acceso Administrador</h3>
                <input type="email" id="admin-email" placeholder="Correo electrónico" 
                       style="width:100%; padding:12px; margin-bottom:15px; border:none; border-radius:8px; font-size:14px;">
                <input type="password" id="admin-password" placeholder="Contraseña" 
                       style="width:100%; padding:12px; margin-bottom:15px; border:none; border-radius:8px; font-size:14px;">
                <button id="btn-login" style="
                    width:100%;
                    padding:12px;
                    background: white;
                    color: #764ba2;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='scale(1.02)';" onmouseout="this.style.transform='scale(1)';">Iniciar Sesión</button>
            </div>
        </div>
        
        <div id="admin-section" style="display:none;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="color:#333; margin:0;">➕ Nuevo Producto</h3>
                <button id="btn-logout" style="
                    padding: 8px 16px;
                    background: #e74c3c;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">Cerrar Sesión</button>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <input type="text" id="product-name" placeholder="Nombre del producto" 
                       style="width:100%; padding:12px; margin-bottom:12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <input type="number" id="product-price" placeholder="Precio" step="0.01"
                           style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
                    <select id="product-unit" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px; font-size:14px;">
                        <option value="lb">Libras (lb)</option>
                        <option value="kg">Kilogramos (kg)</option>
                        <option value="unidad">Unidad</option>
                    </select>
                </div>
                
                <textarea id="product-description" placeholder="Descripción del producto" rows="3"
                          style="width:100%; padding:12px; margin-bottom:15px; border:1px solid #ddd; border-radius:8px; font-size:14px; resize:vertical;"></textarea>
                
                <button id="btn-save" style="
                    width:100%;
                    padding:14px;
                    background: linear-gradient(135deg, #27ae60 0%, #219a52 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.background='linear-gradient(135deg, #219a52 0%, #1e8744 100%)';" 
                   onmouseout="this.style.background='linear-gradient(135deg, #27ae60 0%, #219a52 100%)';">
                    💾 Guardar Producto
                </button>
            </div>
            
            <h3 style="color:#333; margin-bottom:15px;">📋 Productos Actuales</h3>
            <div id="productos-lista-admin" style="max-height: 250px; overflow-y: auto;"></div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Eventos del panel
    btnAdmin.onclick = () => panel.style.display = 'block';
    document.getElementById('cerrar-panel').onclick = () => panel.style.display = 'none';
    
    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-password').value;
        if (await window.loginAdmin(email, pass)) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
            actualizarListaProductosAdmin();
        }
    };
    
    document.getElementById('btn-logout').onclick = async () => {
        await signOut(auth);
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
    };
    
    document.getElementById('btn-save').onclick = async () => {
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        
        if (!name) {
            alert("❌ Por favor ingresa un nombre");
            return;
        }
        if (!price || price <= 0) {
            alert("❌ Por favor ingresa un precio válido");
            return;
        }
        
        const producto = {
            name: name,
            basePrice: price,
            unit: document.getElementById('product-unit').value,
            description: document.getElementById('product-description').value.trim()
        };
        
        if (await window.guardarProducto(producto)) {
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-description').value = '';
            actualizarListaProductosAdmin();
        }
    };
    
    async function actualizarListaProductosAdmin() {
        const container = document.getElementById('productos-lista-admin');
        if (!container) return;
        
        if (!window.storeData.products || window.storeData.products.length === 0) {
            container.innerHTML = '<p style="color:#666; text-align:center; padding:20px;">📭 No hay productos</p>';
            return;
        }
        
        let html = '';
        window.storeData.products.forEach(prod => {
            html += `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-bottom: 1px solid #eee;
                    background: ${prod === window.storeData.products[window.storeData.products.length-1] ? 'none' : '#fafafa'};
                ">
                    <div>
                        <strong style="color:#333;">${prod.name}</strong>
                        <div style="color:#27ae60; font-weight:bold; font-size:14px; margin-top:4px;">
                            $${prod.basePrice?.toFixed(2)} / ${prod.unit || 'lb'}
                        </div>
                    </div>
                    <button onclick="eliminarProducto('${prod.id}')" style="
                        background: #e74c3c;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 5px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
                        🗑️ Eliminar
                    </button>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    console.log("✅ Admin Panel configurado en IZQUIERDA");
}, 1000);

// ===== WHATSAPP A LA DERECHA CON MENOR Z-INDEX =====
function fijarWhatsAppDerecha() {
    const selectores = [
        '[class*="whats"]', '[id*="whats"]',
        '[class*="Whats"]', '[id*="Whats"]',
        'a[href*="wa.me"]', 'a[href*="whatsapp"]',
        'a[href*="WA.me"]', 'a[href*="WhatsApp"]',
        'img[alt*="whats"]', 'img[alt*="Whats"]'
    ];
    
    let botones = document.querySelectorAll(selectores.join(','));
    
    botones.forEach(btn => {
        btn.style.position = 'fixed';
        btn.style.right = '20px';
        btn.style.left = 'auto';
        btn.style.bottom = '20px';
        btn.style.zIndex = '999990';
        btn.style.margin = '0';
    });
    
    // Buscar por texto también
    document.querySelectorAll('a, button, div, img').forEach(el => {
        const texto = (el.textContent || el.alt || '').toLowerCase();
        if (texto.includes('whatsapp') || texto.includes('whats')) {
            el.style.position = 'fixed';
            el.style.right = '20px';
            el.style.left = 'auto';
            el.style.bottom = '20px';
            el.style.zIndex = '999990';
        }
    });
}

// ===== OCULTAR CONTRASEÑA =====
function ocultarDatosSensibles() {
    document.querySelectorAll('*').forEach(el => {
        if (el.innerHTML) {
            el.innerHTML = el.innerHTML.replace(/berkot2026/gi, '••••••••');
            el.innerHTML = el.innerHTML.replace(/Berkot2026Admin/gi, '••••••••');
            el.innerHTML = el.innerHTML.replace(/admin@berkot\.com/gi, '••••@••••.com');
            el.innerHTML = el.innerHTML.replace(/Berkot2026/gi, '••••••••');
        }
    });
}

// ===== ESTILOS GLOBALES =====
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
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
        opacity: 1;
        height: 24px;
    }
`;
document.head.appendChild(estilos);

// ===== EJECUTAR INICIALIZACIÓN =====
setTimeout(() => {
    fijarWhatsAppDerecha();
    ocultarDatosSensibles();
}, 500);

setTimeout(fijarWhatsAppDerecha, 2000);
setTimeout(ocultarDatosSensibles, 2000);
setInterval(fijarWhatsAppDerecha, 8000);
setInterval(ocultarDatosSensibles, 10000);

// ===== INICIALIZAR =====
console.log("✅✅✅ SISTEMA BERKOT FIREBASE - VERSIÓN DEFINITIVA ✅✅✅");
console.log("🔥 Características activadas:");
console.log("   • Sincronización Firebase en tiempo real");
console.log("   • Selector de cantidad con +/-");
console.log("   • Carrito de compras con contador");
console.log("   • Sin productos duplicados");
console.log("   • Admin Panel en IZQUIERDA");
console.log("   • WhatsApp en DERECHA (sin tapar)");
console.log("   • Contraseña oculta automáticamente");
console.log("📍 Base de datos:", firebaseConfig.databaseURL);
