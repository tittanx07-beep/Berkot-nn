// ========== BERKOT FIREBASE - VERSIÓN DEFINITIVA CON CARRITO Y CANTIDADES ==========
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

// ===== FUNCIÓN PARA MOSTRAR PRODUCTOS CON CANTIDADES =====
function mostrarProductosEnPagina() {
    console.log("🔄 Actualizando productos en la página...");
    
    // 1. BUSCAR CONTENEDORES DE PRODUCTOS
    let contenedores = document.querySelectorAll('.products, .product-grid, #products, .product-list, [class*="producto"], [class*="product"], [id*="producto"], [id*="product"]');
    
    // 2. SI NO HAY CONTENEDORES, CREAR UNO
    if (contenedores.length === 0) {
        console.log("📦 No hay contenedor de productos. Creando uno...");
        const main = document.querySelector('main') || document.querySelector('.content') || document.querySelector('body');
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
        console.log("✅ Contenedor de productos creado");
    }
    
    // 3. MOSTRAR PRODUCTOS CON SELECTOR DE CANTIDAD
    contenedores.forEach(contenedor => {
        window.contenedorProductos = contenedor;
        
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
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; padding: 20px;">
            `;
            
            window.storeData.products.forEach(p => {
                // Determinar unidad y paso mínimo
                const unidad = p.unit || 'lb';
                const paso = unidad === 'unidad' ? 1 : 0.5;
                const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
                
                html += `
                    <div style="
                        border: 1px solid #e0e0e0;
                        border-radius: 12px;
                        padding: 20px;
                        background: white;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        display: flex;
                        flex-direction: column;
                        transition: transform 0.3s, box-shadow 0.3s;
                    " 
                    onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)';">
                        
                        <!-- NOMBRE Y PRECIO -->
                        <h3 style="margin: 0 0 10px 0; color: #333; font-size: 1.3em;">${p.name || 'Producto'}</h3>
                        <p style="font-size: 28px; color: #27ae60; font-weight: bold; margin: 10px 0;">
                            $${p.basePrice?.toFixed(2) || '0.00'}
                            <span style="font-size: 14px; color: #666; font-weight: normal;">/${unidad}</span>
                        </p>
                        ${p.description ? `<p style="color: #666; margin: 10px 0; line-height: 1.4;">${p.description}</p>` : ''}
                        
                        <!-- SELECTOR DE CANTIDAD -->
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin: 15px 0;
                            padding: 10px;
                            background: #f8f9fa;
                            border-radius: 8px;
                        ">
                            <span style="color: #666; font-weight: bold;">Cantidad:</span>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <button onclick="this.parentNode.querySelector('input').stepDown(); this.parentNode.querySelector('input').dispatchEvent(new Event('change'))" style="
                                    width: 30px;
                                    height: 30px;
                                    background: #fff;
                                    border: 1px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 18px;
                                    font-weight: bold;
                                    cursor: pointer;
                                ">-</button>
                                
                                <input type="number" id="cantidad-${p.id}" value="${min}" min="${min}" step="${paso}" style="
                                    width: 70px;
                                    height: 35px;
                                    text-align: center;
                                    border: 1px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 16px;
                                " onchange="actualizarPrecioTotal('${p.id}', ${p.basePrice})">
                                
                                <button onclick="this.parentNode.querySelector('input').stepUp(); this.parentNode.querySelector('input').dispatchEvent(new Event('change'))" style="
                                    width: 30px;
                                    height: 30px;
                                    background: #fff;
                                    border: 1px solid #ddd;
                                    border-radius: 5px;
                                    font-size: 18px;
                                    font-weight: bold;
                                    cursor: pointer;
                                ">+</button>
                            </div>
                            <span id="total-${p.id}" style="color: #27ae60; font-weight: bold; font-size: 16px;">
                                $${(p.basePrice * min).toFixed(2)}
                            </span>
                        </div>
                        
                        <!-- BOTÓN AGREGAR AL CARRITO -->
                        <button onclick="agregarAlCarrito('${p.id}', '${p.name}', ${p.basePrice}, '${unidad}')" style="
                            background: #27ae60;
                            color: white;
                            border: none;
                            padding: 12px 20px;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-top: 5px;
                            transition: background 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 10px;
                        " onmouseover="this.style.background='#219a52'" onmouseout="this.style.background='#27ae60'">
                            🛒 Agregar al Carrito
                        </button>
                    </div>
                `;
            });
            
            html += `</div>`;
        }
        
        contenedor.innerHTML = html;
    });
    
    console.log(`✅ ${window.storeData.products?.length || 0} productos mostrados`);
}

// ===== ACTUALIZAR PRECIO TOTAL SEGÚN CANTIDAD =====
window.actualizarPrecioTotal = function(id, precio) {
    const input = document.getElementById(`cantidad-${id}`);
    const totalSpan = document.getElementById(`total-${id}`);
    if (input && totalSpan) {
        const cantidad = parseFloat(input.value) || 0;
        const total = precio * cantidad;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }
};

// ===== AGREGAR AL CARRITO CON CANTIDAD =====
window.agregarAlCarrito = function(id, nombre, precio, unidad) {
    // Obtener cantidad del selector
    const input = document.getElementById(`cantidad-${id}`);
    const cantidad = input ? parseFloat(input.value) : 1;
    
    // Obtener carrito actual
    let carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    
    // Buscar si el producto ya está en el carrito
    const existente = carrito.find(item => item.id === id);
    
    if (existente) {
        existente.cantidad = (existente.cantidad || 0) + cantidad;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            unidad: unidad,
            cantidad: cantidad
        });
    }
    
    // Guardar carrito
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    
    // Mostrar notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 999999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
    `;
    notificacion.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">✅</span>
            <div>
                <strong>${cantidad} ${unidad} de ${nombre}</strong><br>
                <small style="opacity: 0.9;">agregado al carrito</small>
            </div>
        </div>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
    
    console.log(`🛒 Agregado: ${cantidad} ${unidad} de ${nombre} - $${(precio * cantidad).toFixed(2)}`);
};

// ===== ACTUALIZAR CONTADOR DEL CARRITO =====
window.actualizarContadorCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    
    // Buscar o crear contador
    let contador = document.getElementById('carrito-contador');
    if (!contador) {
        contador = document.createElement('span');
        contador.id = 'carrito-contador';
        contador.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            z-index: 999998;
        `;
        document.body.appendChild(contador);
    }
    
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? 'flex' : 'none';
};

// ===== VER CARRITO =====
window.verCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    
    if (carrito.length === 0) {
        alert("🛒 Tu carrito está vacío");
        return;
    }
    
    let mensaje = "🛍️ MI CARRITO:\n\n";
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        mensaje += `${index + 1}. ${item.nombre}\n`;
        mensaje += `   ${item.cantidad} ${item.unidad || 'lb'} x $${item.precio} = $${subtotal.toFixed(2)}\n\n`;
    });
    
    mensaje += `💰 TOTAL: $${total.toFixed(2)}`;
    
    // Agregar botones de acción
    if (confirm(mensaje + "\n\n¿Vaciar carrito?")) {
        localStorage.removeItem('berkot_carrito');
        actualizarContadorCarrito();
        alert("✅ Carrito vaciado");
    }
};

// ===== BOTÓN DE CARRITO FLOTANTE =====
setTimeout(() => {
    const btnCarrito = document.createElement('button');
    btnCarrito.id = 'btn-carrito';
    btnCarrito.innerHTML = '🛒';
    btnCarrito.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 60px;
        height: 60px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        z-index: 999997;
        box-shadow: 0 4px 15px rgba(52,152,219,0.4);
        transition: transform 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    btnCarrito.onmouseover = () => btnCarrito.style.transform = 'scale(1.1)';
    btnCarrito.onmouseout = () => btnCarrito.style.transform = 'scale(1)';
    btnCarrito.onclick = window.verCarrito;
    document.body.appendChild(btnCarrito);
    
    actualizarContadorCarrito();
}, 1500);

// ===== ESCUCHAR CAMBIOS EN TIEMPO REAL =====
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
        mostrarProductosEnPagina();
        localStorage.setItem('berkot_productos_backup', JSON.stringify(window.storeData.products));
    }
}, (error) => {
    console.error("❌ Error cargando productos:", error);
    const backup = localStorage.getItem('berkot_productos_backup');
    if (backup) {
        window.storeData.products = JSON.parse(backup);
        mostrarProductosEnPagina();
        console.log("📦 Productos cargados desde respaldo local");
    }
});

// ===== FUNCIONES ADMIN =====
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

window.logoutAdmin = async function() {
    await signOut(auth);
    console.log("✅ Sesión cerrada");
};

// ===== PANEL ADMIN =====
setTimeout(() => {
    const btnExistente = document.getElementById('btn-admin-berkot');
    if (btnExistente) btnExistente.remove();
    
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
    
    // Panel admin (versión simplificada - igual que antes)
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
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2 style="color: #FFA000;">🔥 Admin</h2>
            <button id="cerrar-panel" style="background: none; border: none; font-size: 24px;">&times;</button>
        </div>
        
        <div id="login-section">
            <input type="email" id="admin-email" placeholder="Email" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <input type="password" id="admin-password" placeholder="Contraseña" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <button id="btn-login" style="width:100%; padding:12px; background:#FFA000; color:white; border:none; border-radius:8px;">Entrar</button>
        </div>
        
        <div id="admin-section" style="display:none;">
            <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h3>➕ Agregar Producto</h3>
                <button id="btn-logout" style="padding:8px 16px; background:#e74c3c; color:white; border:none; border-radius:5px;">Salir</button>
            </div>
            
            <input type="text" id="product-name" placeholder="Nombre" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <input type="number" id="product-price" placeholder="Precio" step="0.01" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <select id="product-unit" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
                <option value="lb">Libras (lb)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="unidad">Unidad</option>
            </select>
            <textarea id="product-description" placeholder="Descripción" rows="3" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;"></textarea>
            <button id="btn-save" style="width:100%; padding:12px; background:#27ae60; color:white; border:none; border-radius:8px;">Guardar Producto</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    btnAdmin.onclick = () => panel.style.display = 'block';
    document.getElementById('cerrar-panel').onclick = () => panel.style.display = 'none';
    
    document.getElementById('btn-login').onclick = async () => {
        const email = document.getElementById('admin-email').value;
        const pass = document.getElementById('admin-password').value;
        if (await window.loginAdmin(email, pass)) {
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('admin-section').style.display = 'block';
        }
    };
    
    document.getElementById('btn-logout').onclick = async () => {
        await window.logoutAdmin();
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
    };
    
    document.getElementById('btn-save').onclick = async () => {
        const producto = {
            name: document.getElementById('product-name').value || "Producto",
            basePrice: parseFloat(document.getElementById('product-price').value) || 0,
            unit: document.getElementById('product-unit').value,
            description: document.getElementById('product-description').value || "",
            minQty: 0.5
        };
        
        if (await window.guardarProducto(producto)) {
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-description').value = '';
            alert('✅ Producto guardado');
        }
    };
}, 1000);

// ===== MOVER WHATSAPP A LA IZQUIERDA =====
setTimeout(() => {
    const botonesWhatsApp = document.querySelectorAll('[class*="whats"], [id*="whats"], a[href*="wa.me"], a[href*="whatsapp"]');
    
    botonesWhatsApp.forEach(btn => {
        btn.style.right = 'auto';
        btn.style.left = '20px';
        btn.style.bottom = '20px';
        btn.style.zIndex = '999996';
        
        if (btn.style.position === 'fixed' || window.getComputedStyle(btn).position === 'fixed') {
            btn.style.left = '20px';
            btn.style.right = 'auto';
        }
    });
    
    // Buscar por texto también
    document.querySelectorAll('a, button, div').forEach(el => {
        if (el.textContent && el.textContent.toLowerCase().includes('whatsapp')) {
            el.style.right = 'auto';
            el.style.left = '20px';
        }
    });
}, 2000);

// ===== OCULTAR CONTRASEÑA =====
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
console.log("🚀 Inicializando Berkot Firebase con Carrito y Cantidades...");
console.log("✅ Berkot Firebase inicializado correctamente");
console.log("🔥 Sistema listo - Productos con selector de cantidad");
console.log("📍 Base de datos:", firebaseConfig.databaseURL);

// ===== EXPORTAR FUNCIONES =====
window.BERKOT_FIREBASE = {
    db,
    auth,
    guardarProducto: window.guardarProducto,
    eliminarProducto: window.eliminarProducto,
    loginAdmin: window.loginAdmin,
    logoutAdmin: window.logoutAdmin,
    mostrarProductos: mostrarProductosEnPagina,
    verCarrito: window.verCarrito
};
