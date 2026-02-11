// ========== BERKOT FIREBASE - VERSIÓN PROFESIONAL FINAL ==========
// ========== WHATSAPP + GUARDAR INFORMACIÓN 100% FUNCIONAL ==========

console.log("🔥 BERKOT - SISTEMA PROFESIONAL INICIADO");

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
let clienteInfo = JSON.parse(localStorage.getItem('cliente_info')) || {};

// ===== 1. LIMPIEZA TOTAL =====
function limpiezaTotal() {
    console.log("🧹 Limpieza de contenedores...");
    const elementosEliminar = [
        '#productos-berkot', '#berkot-container', '.productos-berkot',
        '[id*="producto"]', '[class*="producto"]', '.products', '.product-grid'
    ];
    elementosEliminar.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            if (el.id !== 'btn-carrito' && el.id !== 'btn-admin' && !el.id?.includes('whats')) {
                el.remove();
            }
        });
    });
}

// ===== 2. CONTENEDOR PRINCIPAL =====
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
    `;
    if (document.body.firstChild) {
        document.body.insertBefore(contenedor, document.body.firstChild);
    } else {
        document.body.appendChild(contenedor);
    }
    return contenedor;
}

// ===== 3. LOGO BERKOT =====
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
            <h1 style="font-size: 52px; margin: 0; font-weight: 900;">🛍️ BERKOT</h1>
            <p style="font-size: 20px; margin: 15px 0 0; opacity: 0.95;">
                Selecciona la cantidad exacta y unidad de medida que necesitas
            </p>
        </div>
    `;
    contenedor.innerHTML = logoHTML;
}

// ===== 4. MOSTRAR PRODUCTOS =====
function mostrarProductos() {
    const contenedor = crearContenedor();
    mostrarLogo(contenedor);
    
    if (!window.productos || window.productos.length === 0) {
        contenedor.innerHTML += `<div style="text-align: center; padding: 60px;">📭 No hay productos disponibles</div>`;
        return;
    }
    
    let productosHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; margin-top: 20px;">`;
    
    window.productos.forEach(p => {
        const precio = p.basePrice || 0;
        const unidad = p.unit || 'lb';
        const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        const id = p.id;
        const borderColor = p.available !== false ? '#27ae60' : '#e74c3c';
        
        productosHTML += `
            <div style="border: 3px solid ${borderColor}; border-radius: 16px; padding: 20px; background: white;">
                <h3 style="margin: 0 0 15px;">${p.name}</h3>
                <div style="font-size: 32px; color: #27ae60; font-weight: bold;">$${precio.toFixed(2)} <span style="font-size: 16px; color: #666;">/${unidad}</span></div>
                ${p.description ? `<p style="color: #666;">${p.description}</p>` : ''}
                
                <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 12px;">
                    <span>Cantidad:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button onclick="window.cambiarCantidad('${id}', -${unidad === 'unidad' ? 1 : 0.5}, ${min})" style="width: 40px; height: 40px; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 20px; cursor: pointer;">−</button>
                        <span id="cant-${id}" style="width: 80px; height: 40px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 18px; font-weight: bold;">${min.toFixed(unidad === 'unidad' ? 0 : 1)}</span>
                        <button onclick="window.cambiarCantidad('${id}', ${unidad === 'unidad' ? 1 : 0.5}, ${min})" style="width: 40px; height: 40px; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 20px; cursor: pointer;">+</button>
                    </div>
                    <span style="font-weight: bold; color: #27ae60; font-size: 20px;" id="total-${id}">$${(precio * min).toFixed(2)}</span>
                </div>
                
                <button onclick="window.comprarProducto('${id}')" style="width: 100%; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer;">🛒 Agregar al Carrito</button>
                
                <div id="admin-actions-${id}" style="display: ${usuarioActual ? 'flex' : 'none'}; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                    <button onclick="window.editarProducto('${id}')" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px;">✏️ Editar</button>
                    <button onclick="window.eliminarProducto('${id}')" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 6px;">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    productosHTML += `</div>`;
    contenedor.innerHTML += productosHTML;
}

// ===== 5. FUNCIONES DE CANTIDAD =====
window.cambiarCantidad = function(id, delta, min) {
    const span = document.getElementById(`cant-${id}`);
    const totalSpan = document.getElementById(`total-${id}`);
    if (span && totalSpan) {
        let valor = parseFloat(span.textContent) || min;
        valor = Math.max(min, valor + delta);
        valor = Math.round(valor * 10) / 10;
        span.textContent = valor.toFixed(1);
        
        const producto = window.productos.find(p => p.id === id);
        if (producto) {
            totalSpan.textContent = `$${(producto.basePrice * valor).toFixed(2)}`;
        }
    }
};

// ===== 6. COMPRAR =====
window.comprarProducto = function(id) {
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;
    
    const span = document.getElementById(`cant-${id}`);
    const cantidad = span ? parseFloat(span.textContent) : (producto.minQty || 0.5);
    
    const existente = carrito.findIndex(item => item.id === id);
    
    if (existente !== -1) {
        carrito[existente].cantidad += cantidad;
        carrito[existente].total = carrito[existente].precio * carrito[existente].cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.name,
            precio: producto.basePrice,
            unidad: producto.unit || 'lb',
            cantidad: cantidad,
            total: producto.basePrice * cantidad
        });
    }
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion(`✅ ${cantidad.toFixed(1)} ${producto.unit} de ${producto.name} agregado`, 'success');
};

// ===== 7. NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
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
        btnCarrito.innerHTML = `🛒 ${total > 0 ? total.toFixed(1) : ''}`.trim();
    }
}

// ===== 🔴🔴🔴 SOLUCIÓN 1: BOTÓN GUARDAR INFORMACIÓN 🔴🔴🔴 =====
window.guardarInformacionCliente = function() {
    console.log("💾 Guardando información del cliente...");
    
    const nombre = document.getElementById('cliente-nombre')?.value;
    const telefono = document.getElementById('cliente-telefono')?.value;
    const direccion = document.getElementById('cliente-direccion')?.value;
    const notas = document.getElementById('cliente-notas')?.value || '';
    
    if (!nombre || !telefono || !direccion) {
        mostrarNotificacion('❌ Completa todos los campos obligatorios', 'error');
        return false;
    }
    
    clienteInfo = {
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        notas: notas.trim()
    };
    
    localStorage.setItem('cliente_info', JSON.stringify(clienteInfo));
    mostrarNotificacion('✅ Información guardada correctamente', 'success');
    
    // Actualizar resumen si existe
    const summaryDiv = document.getElementById('customer-info-summary');
    const detailsDiv = document.getElementById('customer-details');
    
    if (summaryDiv && detailsDiv) {
        summaryDiv.style.display = 'block';
        detailsDiv.innerHTML = `
            <p><strong>Nombre:</strong> ${clienteInfo.nombre}</p>
            <p><strong>Teléfono:</strong> ${clienteInfo.telefono}</p>
            <p><strong>Dirección:</strong> ${clienteInfo.direccion}</p>
            ${clienteInfo.notas ? `<p><strong>Notas:</strong> ${clienteInfo.notas}</p>` : ''}
        `;
    }
    
    return true;
};

// ===== 🔴🔴🔴 SOLUCIÓN 2: CARGAR INFORMACIÓN GUARDADA 🔴🔴🔴 =====
function cargarInformacionCliente() {
    const savedInfo = localStorage.getItem('cliente_info');
    if (savedInfo) {
        try {
            clienteInfo = JSON.parse(savedInfo);
            
            const nombreInput = document.getElementById('cliente-nombre');
            const telefonoInput = document.getElementById('cliente-telefono');
            const direccionInput = document.getElementById('cliente-direccion');
            const notasInput = document.getElementById('cliente-notas');
            
            if (nombreInput) nombreInput.value = clienteInfo.nombre || '';
            if (telefonoInput) telefonoInput.value = clienteInfo.telefono || '';
            if (direccionInput) direccionInput.value = clienteInfo.direccion || '';
            if (notasInput) notasInput.value = clienteInfo.notas || '';
            
            console.log("✅ Información de cliente cargada");
        } catch (e) {
            console.error("Error cargando información:", e);
        }
    }
}

// ===== 🔴🔴🔴 SOLUCIÓN 3: ENVIAR PEDIDO POR WHATSAPP (100% FUNCIONAL) 🔴🔴🔴 =====
window.enviarPedidoWhatsApp = function() {
    console.log("📤 ENVIANDO PEDIDO POR WHATSAPP...");
    
    // 1. VERIFICAR CARRITO
    if (carrito.length === 0) {
        mostrarNotificacion('❌ Agrega productos al carrito primero', 'error');
        return;
    }
    
    // 2. VERIFICAR/OBTENER DATOS DEL CLIENTE
    let nombre = document.getElementById('cliente-nombre')?.value;
    let telefono = document.getElementById('cliente-telefono')?.value;
    let direccion = document.getElementById('cliente-direccion')?.value;
    let notas = document.getElementById('cliente-notas')?.value || '';
    
    // Si no hay datos en el formulario, intentar cargar de localStorage
    if (!nombre || !telefono || !direccion) {
        const savedInfo = localStorage.getItem('cliente_info');
        if (savedInfo) {
            const info = JSON.parse(savedInfo);
            nombre = info.nombre || '';
            telefono = info.telefono || '';
            direccion = info.direccion || '';
            notas = info.notas || '';
            
            // Rellenar formulario
            if (document.getElementById('cliente-nombre')) document.getElementById('cliente-nombre').value = nombre;
            if (document.getElementById('cliente-telefono')) document.getElementById('cliente-telefono').value = telefono;
            if (document.getElementById('cliente-direccion')) document.getElementById('cliente-direccion').value = direccion;
            if (document.getElementById('cliente-notas')) document.getElementById('cliente-notas').value = notas;
        }
    }
    
    // 3. VALIDACIÓN FINAL
    if (!nombre || !telefono || !direccion) {
        mostrarNotificacion('❌ Completa tus datos en el formulario', 'error');
        document.querySelector('.customer-form')?.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    // 4. CONSTRUIR MENSAJE DEL PEDIDO
    let totalGeneral = 0;
    let mensaje = "🛍️ *NUEVO PEDIDO - BERKOT*\n\n";
    mensaje += "👤 *CLIENTE:* " + nombre.trim() + "\n";
    mensaje += "📞 *TELÉFONO:* " + telefono.trim() + "\n";
    mensaje += "📍 *DIRECCIÓN:* " + direccion.trim() + "\n\n";
    mensaje += "*🛒 PRODUCTOS SOLICITADOS:*\n";
    mensaje += "══════════════════════\n";
    
    carrito.forEach((item, index) => {
        const cantidad = item.cantidad || 0;
        const precio = item.precio || 0;
        const total = item.total || (precio * cantidad);
        totalGeneral += total;
        
        let cantFormateada = cantidad.toFixed(1);
        if (item.unidad === 'unidad') cantFormateada = Math.round(cantidad).toString();
        
        mensaje += `${index + 1}. *${item.nombre}*\n`;
        mensaje += `   ${cantFormateada} ${item.unidad} x $${precio.toFixed(2)} = *$${total.toFixed(2)}*\n`;
    });
    
    mensaje += "══════════════════════\n";
    mensaje += `💰 *TOTAL A PAGAR: $${totalGeneral.toFixed(2)}*\n\n`;
    
    if (notas.trim()) {
        mensaje += `📝 *NOTAS:* ${notas.trim()}\n\n`;
    }
    
    const ahora = new Date();
    const fecha = ahora.toLocaleDateString('es-ES');
    const hora = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    mensaje += `⏰ *FECHA Y HORA:* ${fecha} - ${hora}\n\n`;
    mensaje += `✅ *Por favor, confirme la disponibilidad del pedido.*`;
    
    // 5. ENVIAR A WHATSAPP (NÚMERO DEL PADRE)
    const numeroNegocio = "5356603249";
    const url = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp
    window.open(url, '_blank');
    
    // 6. NOTIFICACIÓN DE ÉXITO
    mostrarNotificacion('✅ Pedido enviado por WhatsApp', 'success');
    
    // 7. PREGUNTAR SI VACIAR CARRITO
    setTimeout(() => {
        if (confirm("✅ Pedido enviado correctamente.\n\n¿Vaciar carrito?")) {
            carrito = [];
            localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            
            // Limpiar vista del carrito
            const cartItems = document.getElementById('cart-items');
            const totalAmount = document.getElementById('total-amount');
            if (cartItems) cartItems.innerHTML = '<p>Tu carrito está vacío</p>';
            if (totalAmount) totalAmount.textContent = '0.00';
            
            mostrarNotificacion('✅ Carrito vaciado', 'success');
        }
    }, 1500);
};

// ===== 9. VER CARRITO =====
window.verCarrito = function() {
    if (carrito.length === 0) {
        mostrarNotificacion('🛒 Carrito vacío', 'error');
        return;
    }
    
    let mensaje = "🛍️ MI CARRITO:\n\n";
    let total = 0;
    carrito.forEach((item, i) => {
        mensaje += `${i+1}. ${item.nombre}: ${item.cantidad.toFixed(1)} ${item.unidad} = $${item.total.toFixed(2)}\n`;
        total += item.total;
    });
    mensaje += `\n💰 TOTAL: $${total.toFixed(2)}\n\n`;
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
    btn.innerHTML = '🛒';
    btn.style.cssText = `
        position: fixed !important;
        bottom: 100px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: #3498db !important;
        color: white !important;
        border: none !important;
        border-radius: 50% !important;
        font-size: 24px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 9999998 !important;
        box-shadow: 0 4px 15px rgba(52,152,219,0.4) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    btn.onclick = window.verCarrito;
    document.body.appendChild(btn);
    actualizarContadorCarrito();
}

// ===== 11. BOTÓN ADMIN =====
function crearBotonAdmin() {
    const btnExistente = document.getElementById('btn-admin');
    if (btnExistente) btnExistente.remove();
    
    const btn = document.createElement('button');
    btn.id = 'btn-admin';
    btn.innerHTML = '⚙️';
    btn.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        left: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: #FFA000 !important;
        color: white !important;
        border: none !important;
        border-radius: 50% !important;
        font-size: 24px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 9999999 !important;
        box-shadow: 0 4px 15px rgba(255,160,0,0.4) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    btn.onclick = mostrarLogin;
    document.body.appendChild(btn);
}

// ===== 12. WHATSAPP - BOTÓN PRINCIPAL (ENVÍA PEDIDO) =====
function crearBotonWhatsApp() {
    // Eliminar cualquier botón WhatsApp existente
    document.querySelectorAll('#btn-whatsapp-pedido, .whatsapp-btn, a[href*="wa.me"]').forEach(el => el.remove());
    
    const btn = document.createElement('button');
    btn.id = 'btn-whatsapp-pedido';
    btn.innerHTML = '📱';
    btn.title = 'Enviar pedido por WhatsApp';
    
    btn.style.cssText = `
        position: fixed !important;
        bottom: 180px !important;
        right: 20px !important;
        width: 60px !important;
        height: 60px !important;
        background: #25D366 !important;
        color: white !important;
        border: none !important;
        border-radius: 50% !important;
        font-size: 28px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        z-index: 9999999 !important;
        box-shadow: 0 6px 20px rgba(37,211,102,0.4) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transition: all 0.3s ease !important;
    `;
    
    // Evento click - ENVÍA EL PEDIDO
    btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log("📱 Botón WhatsApp clickeado");
        window.enviarPedidoWhatsApp();
    };
    
    // Hover effect
    btn.onmouseover = function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 8px 25px rgba(37,211,102,0.6)';
    };
    btn.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 6px 20px rgba(37,211,102,0.4)';
    };
    
    document.body.appendChild(btn);
    console.log("✅✅ BOTÓN WHATSAPP CREADO - ENVÍA PEDIDO COMPLETO");
}

// ===== 13. LOGIN =====
window.mostrarLogin = async function() {
    const email = prompt("📧 Email:");
    if (!email) return;
    const password = prompt("🔑 Contraseña:");
    if (!password) return;
    
    try {
        await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        usuarioActual = email.trim();
        mostrarNotificacion('✅ Sesión iniciada', 'success');
        
        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) {
            btnAdmin.innerHTML = '👤';
            btnAdmin.onclick = mostrarPanelAdmin;
        }
        
        mostrarProductos();
    } catch (error) {
        mostrarNotificacion('❌ Email o contraseña incorrectos', 'error');
    }
};

// ===== 14. LOGOUT =====
window.logout = async function() {
    await signOut(auth);
    usuarioActual = null;
    mostrarNotificacion('✅ Sesión cerrada', 'success');
    
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin) {
        btnAdmin.innerHTML = '⚙️';
        btnAdmin.onclick = mostrarLogin;
    }
    
    mostrarProductos();
};

// ===== 15. PANEL ADMIN =====
window.mostrarPanelAdmin = function() {
    const action = prompt(
        "👤 PANEL ADMIN\n\n1. ➕ Agregar producto\n2. 🔒 Cerrar sesión"
    );
    
    if (action === '1') {
        agregarProducto();
    } else if (action === '2') {
        window.logout();
    }
};

// ===== 16. AGREGAR PRODUCTO =====
window.agregarProducto = async function() {
    const nombre = prompt("📦 Nombre:");
    if (!nombre) return;
    const precio = parseFloat(prompt("💰 Precio:"));
    if (!precio) return;
    const unidad = prompt("⚖️ Unidad (lb/kg/l/unidad):", "lb");
    const descripcion = prompt("📝 Descripción:", "") || "";
    
    try {
        await push(ref(db, 'productos'), {
            name: nombre,
            basePrice: precio,
            unit: unidad,
            description: descripcion,
            minQty: unidad === 'unidad' ? 1 : 0.5,
            available: true
        });
        mostrarNotificacion('✅ Producto agregado', 'success');
    } catch (error) {
        mostrarNotificacion('❌ Error al agregar', 'error');
    }
};

// ===== 17. EDITAR PRODUCTO =====
window.editarProducto = async function(id) {
    if (!usuarioActual) return mostrarNotificacion('❌ Inicia sesión', 'error');
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;
    
    const nuevoPrecio = parseFloat(prompt("Nuevo precio:", producto.basePrice));
    if (nuevoPrecio > 0) {
        await update(ref(db, `productos/${id}`), { basePrice: nuevoPrecio });
        mostrarNotificacion('✅ Precio actualizado', 'success');
    }
};

// ===== 18. ELIMINAR PRODUCTO =====
window.eliminarProducto = async function(id) {
    if (!usuarioActual) return mostrarNotificacion('❌ Inicia sesión', 'error');
    if (confirm("¿Eliminar producto?")) {
        await remove(ref(db, `productos/${id}`));
        mostrarNotificacion('✅ Producto eliminado', 'success');
    }
};

// ===== 19. ESTILOS GLOBALES =====
function agregarEstilos() {
    const estilos = document.createElement('style');
    estilos.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        body { margin: 0; padding: 0; background: #f5f5f5; }
        .customer-form { max-width: 800px; margin: 40px auto; padding: 30px; background: white; border-radius: 20px; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; font-weight: 600; }
        .form-input { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; }
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
        mostrarProductos();
    }
});

// ===== 21. INICIALIZACIÓN =====
function inicializar() {
    console.log("🚀 Inicializando sistema profesional...");
    
    agregarEstilos();
    crearBotonCarrito();
    crearBotonAdmin();
    crearBotonWhatsApp();
    cargarInformacionCliente();
    
    // Conectar botón guardar información
    setTimeout(() => {
        const btnGuardar = document.querySelector('button[onclick*="saveCustomerInfo"], #guardar-info-btn');
        if (btnGuardar) {
            btnGuardar.onclick = function(e) {
                e.preventDefault();
                window.guardarInformacionCliente();
            };
            console.log("✅ Botón Guardar Información conectado");
        }
        
        // También buscar por texto
        document.querySelectorAll('button').forEach(btn => {
            if (btn.textContent.includes('Guardar Información')) {
                btn.onclick = function(e) {
                    e.preventDefault();
                    window.guardarInformacionCliente();
                };
                console.log("✅ Botón Guardar encontrado por texto");
            }
        });
    }, 1000);
    
    console.log("✅✅ SISTEMA BERKOT LISTO - WHATSAPP FUNCIONAL");
    console.log("📞 Número del negocio: 5356603249");
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
window.guardarInformacionCliente = guardarInformacionCliente;
window.enviarPedidoWhatsApp = enviarPedidoWhatsApp;
