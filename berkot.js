// ========== BERKOT FIREBASE - VERSIÓN FINAL CON EDICIÓN Y LITROS ==========
// ========== CON LOGO, PRODUCTOS CON BORDES, Y SIN DUPLICADOS ==========

console.log("🔥 BERKOT FIREBASE - Iniciando sistema...");

// ===== CONFIGURACIÓN FIREBASE =====
const firebaseConfig = {
    apiKey: "AIzaSyBLNbTI1YrKVb1iA7YxTSSYRVCh3DiJHEY",
    authDomain: "berkot-nn-9938d.firebaseapp.com",
    databaseURL: "https://berkot-nn-9938d-default-rtdb.firebaseio.com",
    projectId: "berkot-nn-9938d",
    storageBucket: "berkot-nn-9938d.firebasestorage.app",
    messagingSenderId: "528237886603",
    appId: "1:528237886603:web:8dd8a703f101ed0a7d288e"
};

// ===== IMPORTAR FIREBASE =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ===== INICIALIZAR FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
console.log("✅ Firebase conectado");

// ===== VARIABLES GLOBALES =====
window.productos = [];
let carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
let usuarioActual = null;

// ===== 1. ELIMINAR TODO Y EMPEZAR DE CERO =====
function resetTotal() {
    console.log("🧹 Limpiando página para productos nuevos...");
    
    // Eliminar TODOS los contenedores viejos
    document.querySelectorAll('#berkot-container, #productos-berkot, .productos-berkot, [id*="producto"], [class*="producto"]').forEach(el => {
        if (el.id !== 'btn-carrito' && el.id !== 'btn-admin' && el.id !== 'whatsapp-btn') {
            el.remove();
        }
    });
}

// ===== 2. CREAR CONTENEDOR PRINCIPAL CON LOGO =====
function crearContenedor() {
    resetTotal();
    
    const contenedor = document.createElement('div');
    contenedor.id = 'berkot-container';
    contenedor.style.cssText = `
        display: block !important;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: 'Arial', sans-serif;
        position: relative;
        z-index: 1000;
    `;
    
    // Insertar AL PRINCIPIO del body
    if (document.body.firstChild) {
        document.body.insertBefore(contenedor, document.body.firstChild);
    } else {
        document.body.appendChild(contenedor);
    }
    
    return contenedor;
}

// ===== 3. MOSTRAR LOGO DE BERKOT =====
function mostrarLogo(contenedor) {
    const logoHTML = `
        <div style="
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 20px;
            color: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        ">
            <h1 style="
                font-size: 48px;
                margin: 0;
                font-weight: bold;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            ">🛍️ BERKOT</h1>
            <p style="
                font-size: 18px;
                margin: 10px 0 0;
                opacity: 0.95;
            ">Selecciona la cantidad exacta y unidad de medida que necesitas</p>
        </div>
    `;
    
    contenedor.innerHTML = logoHTML;
}

// ===== 4. MOSTRAR PRODUCTOS CON BORDES VERDES/ROJOS =====
function mostrarProductos() {
    const contenedor = crearContenedor();
    mostrarLogo(contenedor);
    
    if (!window.productos || window.productos.length === 0) {
        contenedor.innerHTML += `
            <div style="text-align: center; padding: 60px; background: #f8f9fa; border-radius: 12px;">
                <span style="font-size: 48px;">📭</span>
                <h3 style="margin: 20px 0;">No hay productos disponibles</h3>
                <p style="color: #666;">Usa el botón ⚙️ Admin para agregar productos</p>
            </div>
        `;
        return;
    }
    
    let productosHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; margin-top: 20px;">
    `;
    
    window.productos.forEach(p => {
        const precio = p.basePrice || 0;
        const unidad = p.unit || 'lb';
        const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        const id = p.id;
        
        // Determinar color del borde (verde/rojo) según disponibilidad
        const borderColor = p.available !== false ? '#27ae60' : '#e74c3c';
        
        productosHTML += `
            <div id="producto-${id}" style="
                border: 3px solid ${borderColor};
                border-radius: 16px;
                padding: 20px;
                background: white;
                box-shadow: 0 6px 18px rgba(0,0,0,0.1);
                transition: transform 0.3s;
                position: relative;
            " onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                
                <h3 style="margin: 0 0 15px; color: #333; font-size: 1.5em; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
                    ${p.name || 'Producto'}
                </h3>
                
                <div style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 12px;
                    margin-bottom: 15px;
                ">
                    <div style="font-size: 32px; color: #2c3e50; font-weight: bold; margin-bottom: 5px;">
                        $${precio.toFixed(2)}
                    </div>
                    <div style="font-size: 14px; color: #7f8c8d;">
                        Precio por ${unidad === 'l' ? 'litro' : unidad}: $${(precio).toFixed(2)}
                    </div>
                </div>
                
                ${p.description ? `<p style="color: #666; margin: 15px 0; font-style: italic;">📝 ${p.description}</p>` : ''}
                
                <!-- SELECTOR DE CANTIDAD MEJORADO -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 20px 0;
                    padding: 15px;
                    background: #fff;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                ">
                    <span style="font-weight: bold; color: #34495e;">Cantidad:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button onclick="window.cambiarCantidad('${id}', -${unidad === 'unidad' ? 1 : 0.5}, ${min})" style="
                            width: 40px; height: 40px;
                            background: #f1f3f4;
                            border: none;
                            border-radius: 10px;
                            font-size: 20px;
                            font-weight: bold;
                            color: #2c3e50;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f1f3f4'">−</button>
                        
                        <span id="cant-${id}" style="
                            width: 80px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                            border: 2px solid #e0e0e0;
                            border-radius: 10px;
                            font-size: 18px;
                            font-weight: bold;
                            color: #2c3e50;
                        ">${min.toFixed(unidad === 'unidad' ? 0 : 1)}</span>
                        
                        <button onclick="window.cambiarCantidad('${id}', ${unidad === 'unidad' ? 1 : 0.5}, ${min})" style="
                            width: 40px; height: 40px;
                            background: #f1f3f4;
                            border: none;
                            border-radius: 10px;
                            font-size: 20px;
                            font-weight: bold;
                            color: #2c3e50;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#e0e0e0'" onmouseout="this.style.background='#f1f3f4'">+</button>
                    </div>
                    <span style="font-weight: bold; color: #27ae60; font-size: 20px;">
                        $${(precio * min).toFixed(2)}
                    </span>
                </div>
                
                <!-- BOTÓN AGREGAR AL CARRITO -->
                <button onclick="window.comprarProducto('${id}', ${precio}, '${unidad}', '${p.name}')" style="
                    width: 100%;
                    padding: 15px;
                    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 18px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                " onmouseover="this.style.background='linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'; this.style.transform='scale(1.02)'" 
                   onmouseout="this.style.background='linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)'; this.style.transform='scale(1)'">
                    🛒 Agregar al Carrito
                </button>
                
                <!-- BOTONES ADMIN (SOLO VISIBLES SI ESTÁ LOGEADO) -->
                <div id="admin-actions-${id}" style="
                    display: ${usuarioActual ? 'flex' : 'none'};
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 2px dashed #e0e0e0;
                ">
                    <button onclick="window.editarProducto('${id}')" style="
                        padding: 10px 20px;
                        background: #3498db;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#2980b9'" onmouseout="this.style.background='#3498db'">
                        ✏️ Editar Producto
                    </button>
                    <button onclick="window.eliminarProducto('${id}')" style="
                        padding: 10px 20px;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    productosHTML += `</div>`;
    contenedor.innerHTML += productosHTML;
    console.log(`✅ ${window.productos.length} productos mostrados con bordes ${usuarioActual ? 'y botones admin' : ''}`);
}

// ===== 5. FUNCIONES DE CANTIDAD =====
window.cambiarCantidad = function(id, delta, min) {
    const span = document.getElementById(`cant-${id}`);
    if (span) {
        let valor = parseFloat(span.textContent) || min;
        valor = Math.max(min, valor + delta);
        
        // Redondear según unidad
        const producto = window.productos.find(p => p.id === id);
        if (producto?.unit === 'unidad') {
            valor = Math.round(valor);
            span.textContent = valor;
        } else {
            valor = Math.round(valor * 10) / 10;
            span.textContent = valor.toFixed(1);
        }
        
        // Actualizar total
        const totalSpan = span.parentElement.parentElement.querySelector('span:last-child');
        if (totalSpan && producto) {
            totalSpan.textContent = `$${(producto.basePrice * valor).toFixed(2)}`;
        }
    }
};

// ===== 6. COMPRAR =====
window.comprarProducto = function(id, precio, unidad, nombre) {
    const span = document.getElementById(`cant-${id}`);
    const cantidad = span ? parseFloat(span.textContent) : 0.5;
    
    const existente = carrito.findIndex(item => item.id === id);
    
    if (existente !== -1) {
        carrito[existente].cantidad += cantidad;
        carrito[existente].total = carrito[existente].precio * carrito[existente].cantidad;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            unidad: unidad,
            cantidad: cantidad,
            total: precio * cantidad
        });
    }
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion(`✅ ${cantidad.toFixed(unidad === 'unidad' ? 0 : 1)} ${unidad} de ${nombre} agregado`, 'success');
};

// ===== 7. NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        border-radius: 10px;
        z-index: 999999;
        animation: slideInRight 0.3s;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: bold;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== 8. CONTADOR CARRITO =====
function actualizarContadorCarrito() {
    const btnCarrito = document.getElementById('btn-carrito');
    if (btnCarrito) {
        const total = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        btnCarrito.innerHTML = `🛒 Carrito ${total > 0 ? `(${total.toFixed(1)})` : ''}`;
    }
}

// ===== 9. VER CARRITO =====
window.verCarrito = function() {
    if (carrito.length === 0) {
        mostrarNotificacion('🛒 Tu carrito está vacío', 'info');
        return;
    }
    
    let mensaje = "🛍️ MI CARRITO:\n\n";
    let total = 0;
    carrito.forEach((item, i) => {
        mensaje += `${i+1}. ${item.nombre}\n`;
        mensaje += `   ${item.cantidad.toFixed(item.unidad === 'unidad' ? 0 : 1)} ${item.unidad} x $${item.precio.toFixed(2)} = $${item.total.toFixed(2)}\n\n`;
        total += item.total;
    });
    mensaje += `💰 TOTAL: $${total.toFixed(2)}\n\n`;
    mensaje += "¿Vaciar carrito?";
    
    if (confirm(mensaje)) {
        carrito = [];
        localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
        actualizarContadorCarrito();
        mostrarNotificacion('✅ Carrito vaciado', 'success');
    }
};

// ===== 10. BOTÓN CARRITO =====
function crearBotonCarrito() {
    if (document.getElementById('btn-carrito')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btn-carrito';
    btn.innerHTML = '🛒 Carrito';
    btn.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        padding: 12px 25px;
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999998;
        box-shadow: 0 4px 15px rgba(52,152,219,0.4);
        transition: transform 0.3s;
    `;
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = window.verCarrito;
    document.body.appendChild(btn);
    actualizarContadorCarrito();
}

// ===== 11. BOTÓN ADMIN =====
function crearBotonAdmin() {
    if (document.getElementById('btn-admin')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btn-admin';
    btn.innerHTML = '⚙️ Admin';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 12px 25px;
        background: linear-gradient(135deg, #FFA000 0%, #FF8F00 100%);
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 15px rgba(255,160,0,0.4);
        transition: transform 0.3s;
    `;
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = mostrarLogin;
    document.body.appendChild(btn);
}

// ===== 12. LOGIN =====
window.mostrarLogin = async function() {
    const email = prompt("📧 Email:");
    if (!email) return;
    const password = prompt("🔑 Contraseña:");
    if (!password) return;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        usuarioActual = email;
        mostrarNotificacion('✅ Sesión iniciada', 'success');
        
        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) {
            btnAdmin.innerHTML = '👤 Admin Panel';
            btnAdmin.style.background = 'linear-gradient(135deg, #27ae60 0%, #219a52 100%)';
            btnAdmin.onclick = mostrarPanelAdmin;
        }
        
        mostrarProductos(); // Recargar para mostrar botones de edición
    } catch (error) {
        mostrarNotificacion('❌ Email o contraseña incorrectos', 'error');
    }
};

// ===== 13. LOGOUT =====
window.logout = async function() {
    await signOut(auth);
    usuarioActual = null;
    mostrarNotificacion('✅ Sesión cerrada', 'success');
    
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin) {
        btnAdmin.innerHTML = '⚙️ Admin';
        btnAdmin.style.background = 'linear-gradient(135deg, #FFA000 0%, #FF8F00 100%)';
        btnAdmin.onclick = mostrarLogin;
    }
    
    mostrarProductos(); // Recargar para ocultar botones de edición
};

// ===== 14. PANEL ADMIN =====
window.mostrarPanelAdmin = function() {
    const action = prompt(
        "👤 PANEL DE ADMINISTRACIÓN\n\n" +
        "1. ➕ Agregar nuevo producto\n" +
        "2. 🔒 Cerrar sesión\n\n" +
        "Selecciona una opción (1 o 2):"
    );
    
    if (action === '1') {
        agregarProducto();
    } else if (action === '2') {
        window.logout();
    }
};

// ===== 15. AGREGAR PRODUCTO (CON LITROS INCLUIDO) =====
window.agregarProducto = async function() {
    const nombre = prompt("📦 Nombre del producto:");
    if (!nombre) return;
    
    const precio = parseFloat(prompt("💰 Precio:"));
    if (!precio || precio <= 0) return;
    
    const unidad = prompt("⚖️ Unidad de medida:\n- lb (libras)\n- kg (kilos)\n- l (litros)\n- unidad", "lb");
    if (!unidad || !['lb', 'kg', 'l', 'unidad'].includes(unidad)) {
        mostrarNotificacion('❌ Unidad no válida', 'error');
        return;
    }
    
    const descripcion = prompt("📝 Descripción del producto (opcional):") || "";
    
    const minQty = unidad === 'unidad' ? 1 : 0.5;
    
    try {
        const newRef = push(ref(db, 'productos'));
        await set(newRef, {
            name: nombre,
            basePrice: precio,
            unit: unidad,
            description: descripcion,
            minQty: minQty,
            available: true,
            createdAt: new Date().toISOString()
        });
        
        mostrarNotificacion('✅ Producto agregado correctamente', 'success');
    } catch (error) {
        mostrarNotificacion('❌ Error al agregar producto', 'error');
        console.error(error);
    }
};

// ===== 16. EDITAR PRODUCTO (NUEVA FUNCIÓN) =====
window.editarProducto = async function(id) {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;
    
    const accion = prompt(
        `✏️ EDITAR PRODUCTO: ${producto.name}\n\n` +
        `1. 📝 Cambiar nombre\n` +
        `2. 💰 Cambiar precio\n` +
        `3. ⚖️ Cambiar unidad\n` +
        `4. 📋 Cambiar descripción\n` +
        `5. 🟢 Cambiar disponibilidad\n` +
        `6. ❌ Cancelar\n\n` +
        `Selecciona una opción (1-6):`
    );
    
    try {
        switch(accion) {
            case '1':
                const nuevoNombre = prompt("Nuevo nombre:", producto.name);
                if (nuevoNombre && nuevoNombre.trim()) {
                    await update(ref(db, `productos/${id}`), { name: nuevoNombre.trim() });
                    mostrarNotificacion('✅ Nombre actualizado', 'success');
                }
                break;
                
            case '2':
                const nuevoPrecio = parseFloat(prompt("Nuevo precio:", producto.basePrice));
                if (nuevoPrecio && nuevoPrecio > 0) {
                    await update(ref(db, `productos/${id}`), { basePrice: nuevoPrecio });
                    mostrarNotificacion('✅ Precio actualizado', 'success');
                }
                break;
                
            case '3':
                const nuevaUnidad = prompt("Nueva unidad (lb/kg/l/unidad):", producto.unit);
                if (nuevaUnidad && ['lb', 'kg', 'l', 'unidad'].includes(nuevaUnidad)) {
                    const nuevoMin = nuevaUnidad === 'unidad' ? 1 : 0.5;
                    await update(ref(db, `productos/${id}`), { 
                        unit: nuevaUnidad,
                        minQty: nuevoMin
                    });
                    mostrarNotificacion('✅ Unidad actualizada', 'success');
                }
                break;
                
            case '4':
                const nuevaDesc = prompt("Nueva descripción:", producto.description || '');
                await update(ref(db, `productos/${id}`), { description: nuevaDesc || '' });
                mostrarNotificacion('✅ Descripción actualizada', 'success');
                break;
                
            case '5':
                const nuevoEstado = !producto.available;
                await update(ref(db, `productos/${id}`), { available: nuevoEstado });
                mostrarNotificacion(`✅ Producto ${nuevoEstado ? 'disponible' : 'no disponible'}`, 'success');
                break;
                
            case '6':
                mostrarNotificacion('❌ Edición cancelada', 'info');
                break;
                
            default:
                mostrarNotificacion('❌ Opción no válida', 'error');
        }
    } catch (error) {
        mostrarNotificacion('❌ Error al editar', 'error');
        console.error(error);
    }
};

// ===== 17. ELIMINAR PRODUCTO =====
window.eliminarProducto = async function(id) {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    if (confirm("⚠️ ¿Estás seguro de eliminar este producto?")) {
        try {
            await remove(ref(db, `productos/${id}`));
            mostrarNotificacion('✅ Producto eliminado', 'success');
        } catch (error) {
            mostrarNotificacion('❌ Error al eliminar', 'error');
        }
    }
};

// ===== 18. WHATSAPP =====
function configurarWhatsApp() {
    setTimeout(() => {
        const wa = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"], [class*="whats"], [id*="whats"]');
        if (wa) {
            wa.style.position = 'fixed';
            wa.style.left = '20px';
            wa.style.bottom = '90px';
            wa.style.zIndex = '999990';
            wa.style.width = '55px';
            wa.style.height = '55px';
            wa.style.borderRadius = '50%';
            wa.style.boxShadow = '0 4px 15px rgba(37,211,102,0.4)';
            wa.style.transition = 'transform 0.3s';
            wa.onmouseover = () => wa.style.transform = 'scale(1.1)';
            wa.onmouseout = () => wa.style.transform = 'scale(1)';
            console.log("✅ WhatsApp configurado");
        }
    }, 2000);
}

// ===== 19. ESTILOS GLOBALES =====
function agregarEstilos() {
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
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
            background: #f5f5f5;
        }
    `;
    document.head.appendChild(estilos);
}

// ===== 20. FIREBASE LISTENER =====
const productosRef = ref(db, 'productos');
onValue(productosRef, (snapshot) => {
    const data = snapshot.val();
    
    if (data) {
        window.productos = Object.keys(data).map(key => ({
            id: key,
            name: data[key].name || 'Producto',
            basePrice: data[key].basePrice || 0,
            description: data[key].description || '',
            unit: data[key].unit || 'lb',
            minQty: data[key].minQty || (data[key].unit === 'unidad' ? 1 : 0.5),
            available: data[key].available !== false
        }));
        
        console.log(`✅ ${window.productos.length} productos cargados de Firebase`);
        console.log('📋 Productos:', window.productos.map(p => p.name).join(', '));
        
        mostrarProductos();
    } else {
        console.log('📭 No hay productos en Firebase');
        mostrarProductos();
    }
}, (error) => {
    console.error('❌ Error de Firebase:', error);
    mostrarNotificacion('❌ Error de conexión con Firebase', 'error');
});

// ===== 21. INICIALIZAR =====
function inicializar() {
    console.log("🚀 Inicializando sistema Berkot...");
    
    agregarEstilos();
    crearBotonCarrito();
    crearBotonAdmin();
    configurarWhatsApp();
    
    console.log("✅✅✅ SISTEMA BERKOT LISTO");
    console.log("📞 Número: +53 5660 3249");
}

// ===== EJECUTAR =====
inicializar();

// ===== EXPORTAR FUNCIONES =====
window.cambiarCantidad = cambiarCantidad;
window.comprarProducto = comprarProducto;
window.verCarrito = verCarrito;
window.editarProducto = editarProducto;
window.eliminarProducto = eliminarProducto;
window.agregarProducto = agregarProducto;
window.logout = logout;
