// ========== BERKOT FIREBASE - VERSIÓN CORREGIDA ==========
// ========== SOLO WHATSAPP Y BOTÓN GUARDAR ARREGLADOS ==========

console.log("🔥 BERKOT - INICIANDO SISTEMA DEFINITIVO");

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

// ===== 1. LIMPIEZA TOTAL DE LA PÁGINA =====
function limpiezaTotal() {
    console.log("🧹 Limpieza total de la página...");
    
    const elementosEliminar = [
        '#productos-berkot', '#berkot-container', '.productos-berkot',
        '[id*="producto"]', '[class*="producto"]',
        '.products', '.product-grid', '#products'
    ];
    
    elementosEliminar.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el.id !== 'btn-carrito' && el.id !== 'btn-admin' && !el.id?.includes('whats')) {
                el.remove();
            }
        });
    });
}

// ===== 2. CREAR CONTENEDOR PRINCIPAL CON LOGO =====
function crearContenedor() {
    limpiezaTotal();
    
    const contenedor = document.createElement('div');
    contenedor.id = 'berkot-container-principal';
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
            padding: 40px 20px;
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            border-radius: 20px;
            color: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        ">
            <h1 style="
                font-size: 52px;
                margin: 0;
                font-weight: 900;
                text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
                letter-spacing: 2px;
            ">🛍️ BERKOT</h1>
            <p style="
                font-size: 20px;
                margin: 15px 0 0;
                opacity: 0.95;
                font-weight: 300;
            ">Selecciona la cantidad exacta y unidad de medida que necesitas</p>
        </div>
    `;
    
    contenedor.innerHTML = logoHTML;
}

// ===== 4. MOSTRAR PRODUCTOS =====
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
        const borderColor = p.available !== false ? '#27ae60' : '#e74c3c';
        
        productosHTML += `
            <div id="producto-${id}" style="
                border: 3px solid ${borderColor};
                border-radius: 16px;
                padding: 20px;
                background: white;
                box-shadow: 0 6px 18px rgba(0,0,0,0.1);
                transition: all 0.3s ease;
                position: relative;
            ">
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
                        Precio por ${unidad === 'l' ? 'litro' : unidad === 'unidad' ? 'unidad' : unidad}: $${precio.toFixed(2)}
                    </div>
                </div>
                
                ${p.description ? `<p style="color: #666; margin: 15px 0; font-style: italic;">📝 ${p.description}</p>` : ''}
                
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
                        ">−</button>
                        
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
                        ">+</button>
                    </div>
                    <span style="font-weight: bold; color: #27ae60; font-size: 20px;">
                        $${(precio * min).toFixed(2)}
                    </span>
                </div>
                
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
                ">
                    🛒 Agregar al Carrito
                </button>
                
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
                        cursor: pointer;
                    ">✏️ Editar</button>
                    <button onclick="window.eliminarProducto('${id}')" style="
                        padding: 10px 20px;
                        background: #e74c3c;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 14px;
                        cursor: pointer;
                    ">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    productosHTML += `</div>`;
    contenedor.innerHTML += productosHTML;
    console.log(`✅ ${window.productos.length} productos de Firebase mostrados`);
}

// ===== 5. FUNCIONES DE CANTIDAD =====
window.cambiarCantidad = function(id, delta, min) {
    const span = document.getElementById(`cant-${id}`);
    if (span) {
        let valor = parseFloat(span.textContent) || min;
        valor = Math.max(min, valor + delta);
        
        const producto = window.productos.find(p => p.id === id);
        if (producto?.unit === 'unidad') {
            valor = Math.round(valor);
            span.textContent = valor;
        } else {
            valor = Math.round(valor * 10) / 10;
            span.textContent = valor.toFixed(1);
        }
        
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
        z-index: 9999999;
        animation: slideInRight 0.3s;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-weight: bold;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
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
    const btnExistente = document.getElementById('btn-carrito');
    if (btnExistente) btnExistente.remove();
    
    const btn = document.createElement('button');
    btn.id = 'btn-carrito';
    btn.innerHTML = '🛒 Carrito';
    btn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        padding: 15px 30px !important;
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 50px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 9999998 !important;
        box-shadow: 0 4px 15px rgba(52,152,219,0.4) !important;
    `;
    btn.onclick = window.verCarrito;
    document.body.appendChild(btn);
    actualizarContadorCarrito();
    console.log("✅ Botón Carrito creado en DERECHA");
}

// ===== 11. BOTÓN ADMIN =====
function crearBotonAdmin() {
    const btnExistente = document.getElementById('btn-admin');
    if (btnExistente) btnExistente.remove();
    
    const btn = document.createElement('button');
    btn.id = 'btn-admin';
    btn.innerHTML = '⚙️ Admin';
    btn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        padding: 15px 30px !important;
        background: linear-gradient(135deg, #FFA000 0%, #FF8F00 100%) !important;
        color: white !important;
        border: none !important;
        border-radius: 50px !important;
        font-size: 16px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 9999999 !important;
        box-shadow: 0 4px 15px rgba(255,160,0,0.4) !important;
    `;
    btn.onclick = mostrarLogin;
    document.body.appendChild(btn);
    console.log("✅ Botón Admin creado en IZQUIERDA");
}

// ===== 12. WHATSAPP CORREGIDO - 100% FUNCIONAL =====
function crearBotonWhatsApp() {
    // Eliminar cualquier WhatsApp existente
    document.querySelectorAll('.whatsapp-btn-fijo, a[href*="wa.me"], a[href*="whatsapp"]').forEach(el => el.remove());
    
    // Crear botón NUEVO con TODO funcionando
    const waBtn = document.createElement('a');
    waBtn.className = 'whatsapp-btn-fijo';
    waBtn.href = 'https://wa.me/5356603249';
    waBtn.target = '_blank';
    waBtn.rel = 'noopener noreferrer';
    waBtn.innerHTML = '📱';
    waBtn.title = 'Contactar por WhatsApp';
    
    // ESTILOS DIRECTOS - POSICIÓN CORRECTA
    waBtn.style.cssText = `
        position: fixed !important;
        left: 20px !important;
        bottom: 100px !important;
        width: 60px !important;
        height: 60px !important;
        background: #25D366 !important;
        color: white !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 32px !important;
        text-decoration: none !important;
        box-shadow: 0 6px 20px rgba(37,211,102,0.4) !important;
        z-index: 999999999 !important;
        transition: all 0.3s ease !important;
    `;
    
    // HOVER EFECTO
    waBtn.onmouseover = function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 8px 25px rgba(37,211,102,0.6)';
    };
    waBtn.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 6px 20px rgba(37,211,102,0.4)';
    };
    
    document.body.appendChild(waBtn);
    console.log('✅✅ WHATSAPP CREADO: izquierda 100px - Número: 5356603249');
}

// ===== 13. BOTÓN GUARDAR/ENVIAR WHATSAPP CORREGIDO =====
window.enviarPedidoWhatsApp = function() {
    console.log("📤 Enviando pedido por WhatsApp...");
    
    const nombre = document.getElementById('cliente-nombre');
    const telefono = document.getElementById('cliente-telefono');
    const direccion = document.getElementById('cliente-direccion');
    const notas = document.getElementById('cliente-notas');
    
    if (!nombre || !telefono || !direccion) {
        mostrarNotificacion('❌ Error con el formulario', 'error');
        return;
    }
    
    const nombreVal = nombre.value.trim();
    const telefonoVal = telefono.value.trim();
    const direccionVal = direccion.value.trim();
    const notasVal = notas ? notas.value.trim() : '';
    
    if (!nombreVal || !telefonoVal || !direccionVal) {
        mostrarNotificacion('❌ Completa todos los campos obligatorios', 'error');
        return;
    }
    
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
    
    if (carrito.length === 0) {
        mostrarNotificacion('❌ Carrito vacío', 'error');
        return;
    }
    
    let totalGeneral = 0;
    let mensaje = "🛍️ *NUEVO PEDIDO - BERKOT*\n\n";
    mensaje += "👤 *Cliente:* " + nombreVal + "\n";
    mensaje += "📞 *Teléfono:* " + telefonoVal + "\n";
    mensaje += "📍 *Dirección:* " + direccionVal + "\n\n";
    mensaje += "*🛒 PRODUCTOS:*\n";
    
    carrito.forEach(item => {
        const cant = item.cantidad || 0;
        const precio = item.precio || 0;
        const total = item.total || 0;
        mensaje += `• ${item.nombre}: ${cant.toFixed(item.unidad === 'unidad' ? 0 : 1)} ${item.unidad} x $${precio.toFixed(2)} = $${total.toFixed(2)}\n`;
        totalGeneral += total;
    });
    
    mensaje += `\n💰 *TOTAL: $${totalGeneral.toFixed(2)}*`;
    
    if (notasVal) {
        mensaje += `\n\n📝 *Notas:* ${notasVal}`;
    }
    
    const url = `https://wa.me/5356603249?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    
    mostrarNotificacion('✅ Pedido enviado por WhatsApp', 'success');
    
    const modal = document.getElementById('modal-pedido');
    if (modal) modal.remove();
    
    setTimeout(() => {
        if (confirm("✅ Pedido enviado. ¿Vaciar carrito?")) {
            localStorage.removeItem('berkot_carrito');
            carrito.length = 0;
            actualizarContadorCarrito();
            mostrarNotificacion('✅ Carrito vaciado', 'success');
        }
    }, 500);
};

// ===== 14. LOGIN =====
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
            btnAdmin.onclick = mostrarPanelAdmin;
        }
        
        mostrarProductos();
    } catch (error) {
        mostrarNotificacion('❌ Email o contraseña incorrectos', 'error');
    }
};

// ===== 15. LOGOUT =====
window.logout = async function() {
    await signOut(auth);
    usuarioActual = null;
    mostrarNotificacion('✅ Sesión cerrada', 'success');
    
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin) {
        btnAdmin.innerHTML = '⚙️ Admin';
        btnAdmin.onclick = mostrarLogin;
    }
    
    mostrarProductos();
};

// ===== 16. PANEL ADMIN =====
window.mostrarPanelAdmin = function() {
    const action = prompt(
        "👤 PANEL ADMIN\n\n1. ➕ Agregar producto\n2. 🔒 Cerrar sesión\n\nSelecciona 1 o 2:"
    );
    
    if (action === '1') {
        agregarProducto();
    } else if (action === '2') {
        window.logout();
    }
};

// ===== 17. AGREGAR PRODUCTO =====
window.agregarProducto = async function() {
    const nombre = prompt("📦 Nombre del producto:");
    if (!nombre) return;
    
    const precio = parseFloat(prompt("💰 Precio:"));
    if (!precio || precio <= 0) return;
    
    const unidad = prompt("⚖️ Unidad (lb/kg/l/unidad):", "lb");
    if (!unidad || !['lb', 'kg', 'l', 'unidad'].includes(unidad)) return;
    
    const descripcion = prompt("📝 Descripción (opcional):") || "";
    const minQty = unidad === 'unidad' ? 1 : 0.5;
    
    try {
        const newRef = push(ref(db, 'productos'));
        await set(newRef, {
            name: nombre,
            basePrice: precio,
            unit: unidad,
            description: descripcion,
            minQty: minQty,
            available: true
        });
        mostrarNotificacion('✅ Producto agregado', 'success');
    } catch (error) {
        mostrarNotificacion('❌ Error al agregar', 'error');
    }
};

// ===== 18. EDITAR PRODUCTO =====
window.editarProducto = async function(id) {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;
    
    const opcion = prompt(
        `✏️ EDITAR ${producto.name}\n\n1. Nombre\n2. Precio\n3. Unidad\n4. Descripción\n5. Disponibilidad\n6. Cancelar`,
        '6'
    );
    
    try {
        switch(opcion) {
            case '1':
                const nuevoNombre = prompt("Nuevo nombre:", producto.name);
                if (nuevoNombre) await update(ref(db, `productos/${id}`), { name: nuevoNombre });
                break;
            case '2':
                const nuevoPrecio = parseFloat(prompt("Nuevo precio:", producto.basePrice));
                if (nuevoPrecio > 0) await update(ref(db, `productos/${id}`), { basePrice: nuevoPrecio });
                break;
            case '3':
                const nuevaUnidad = prompt("Nueva unidad (lb/kg/l/unidad):", producto.unit);
                if (nuevaUnidad) await update(ref(db, `productos/${id}`), { 
                    unit: nuevaUnidad,
                    minQty: nuevaUnidad === 'unidad' ? 1 : 0.5
                });
                break;
            case '4':
                const nuevaDesc = prompt("Nueva descripción:", producto.description || '');
                await update(ref(db, `productos/${id}`), { description: nuevaDesc });
                break;
            case '5':
                await update(ref(db, `productos/${id}`), { available: !producto.available });
                break;
        }
        mostrarNotificacion('✅ Producto actualizado', 'success');
    } catch (error) {
        mostrarNotificacion('❌ Error al editar', 'error');
    }
};

// ===== 19. ELIMINAR PRODUCTO =====
window.eliminarProducto = async function(id) {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    if (confirm("⚠️ ¿Eliminar este producto?")) {
        await remove(ref(db, `productos/${id}`));
        mostrarNotificacion('✅ Producto eliminado', 'success');
    }
};

// ===== 20. ESTILOS GLOBALES =====
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
        body { margin: 0; padding: 0; background: #f5f5f5; }
    `;
    document.head.appendChild(estilos);
}

// ===== 21. FIREBASE LISTENER =====
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
        
        console.log(`✅ ${window.productos.length} productos de Firebase`);
        mostrarProductos();
    }
});

// ===== 22. INICIALIZAR =====
function inicializar() {
    console.log("🚀 Inicializando sistema...");
    
    agregarEstilos();
    crearBotonCarrito();
    crearBotonAdmin();
    crearBotonWhatsApp(); // ✅ WHATSAPP CORREGIDO
    
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
window.enviarPedidoWhatsApp = enviarPedidoWhatsApp; // ✅ EXPORTADO
