// ========== BERKOT SUPABASE - VERSIÓN COMPLETA ==========
// ========== CON TODAS LAS FUNCIONES DE FIREBASE ==========
// ========== EDITAR, ELIMINAR, DISPONIBILIDAD, CACHÉ, ETC ==========

console.log("🇨🇺 BERKOT SUPABASE - VERSIÓN COMPLETA");

// 🔴🔴🔴 TUS CREDENCIALES DE SUPABASE 🔴🔴🔴
const SUPABASE_URL = "https://azudeusygestzptfpgti.supabase.co ";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6dWRldXN5Z2VzdHpwdGZwZ3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NDkxODMsImV4cCI6MjA4NjQyNTE4M30.5pLdskeYZXw2yYdLyz8bFm7mBMJHbclszwtc7YNnJ5Y";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log("✅ Supabase conectado");

// ===== VARIABLES GLOBALES =====
window.productos = [];
let carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
let usuarioActual = null;
let clienteInfo = JSON.parse(localStorage.getItem('cliente_info')) || {};

// ===== CONSTANTES =====
const CACHE_KEY = 'berkot_productos_cache';
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 horas

// ===== 1. CACHÉ PARA CUBA =====
function guardarCache(productos) {
    const cacheData = {
        timestamp: Date.now(),
        productos: productos
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
}

function cargarCache() {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return null;
    
    try {
        const data = JSON.parse(cache);
        const expirado = Date.now() - data.timestamp > CACHE_TIME;
        if (!expirado && data.productos?.length > 0) {
            return data.productos;
        }
    } catch (e) {}
    return null;
}

// ===== 2. CARGAR PRODUCTOS (CON CACHÉ) =====
async function cargarProductos() {
    // PRIMERO: Mostrar caché inmediato
    const cache = cargarCache();
    if (cache) {
        window.productos = cache;
        mostrarProductos();
        console.log(`📦 Caché: ${cache.length} productos`);
    }
    
    // SEGUNDO: Intentar Supabase
    try {
        const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            window.productos = data;
            guardarCache(data);
            mostrarProductos();
            console.log(`✅ Supabase: ${data.length} productos`);
        }
    } catch (error) {
        console.log("ℹ️ Supabase no disponible - Usando caché");
    }
}

// ===== 3. TIEMPO REAL =====
supabase
    .channel('berkot-real-time')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'productos' },
        (payload) => {
            console.log("🔄 Cambio detectado:", payload.eventType);
            cargarProductos();
        }
    )
    .subscribe();

// ===== 4. MOSTRAR PRODUCTOS (CON BORDES VERDES/ROJOS) =====
function mostrarProductos() {
    const contenedor = document.getElementById('berkot-container') || crearContenedor();
    
    // Logo y banner Cuba
    contenedor.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding: 40px 20px; background: linear-gradient(135deg, #2c3e50, #3498db); border-radius: 20px; color: white;">
            <h1 style="font-size: 48px; margin: 0;">🛍️ BERKOT</h1>
            <p style="font-size: 18px; margin-top: 10px;">Tu tienda en Cuba - 100% funcional sin VPN</p>
        </div>
        <div style="background: #f39c12; color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-weight: bold;">
            🇨🇺 MODO CUBA: Productos guardados en tu teléfono por 24h. Siempre visibles.
        </div>
    `;
    
    if (!window.productos || window.productos.length === 0) {
        contenedor.innerHTML += `
            <div style="text-align: center; padding: 60px; background: white; border-radius: 12px;">
                <span style="font-size: 48px;">📭</span>
                <h3 style="margin: 20px 0;">No hay productos disponibles</h3>
                <p style="color: #666;">Usa el botón ⚙️ Admin para agregar productos</p>
            </div>
        `;
        return;
    }
    
    let productosHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; margin-top: 20px;">`;
    
    window.productos.forEach(p => {
        const borderColor = p.available !== false ? '#27ae60' : '#e74c3c';
        const unidad = p.unit || 'lb';
        const minQty = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        
        productosHTML += `
            <div style="border: 3px solid ${borderColor}; border-radius: 16px; padding: 20px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3 style="margin: 0 0 10px; color: #333; font-size: 1.4em;">${p.name}</h3>
                    ${p.available === false ? '<span style="background: #e74c3c; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">AGOTADO</span>' : ''}
                </div>
                
                <div style="font-size: 32px; color: #27ae60; font-weight: bold; margin: 10px 0;">
                    $${(p.basePrice || 0).toFixed(2)}
                    <span style="font-size: 16px; color: #666; margin-left: 5px;">/${unidad}</span>
                </div>
                
                ${p.description ? `<p style="color: #666; margin: 10px 0; line-height: 1.4;">${p.description}</p>` : ''}
                
                <!-- SELECTOR DE CANTIDAD -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 12px;">
                    <span style="font-weight: bold; color: #34495e;">Cantidad:</span>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button onclick="window.cambiarCantidad('${p.id}', -${unidad === 'unidad' ? 1 : 0.5}, ${minQty})" style="width: 40px; height: 40px; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 20px; cursor: pointer;">−</button>
                        <span id="cant-${p.id}" style="width: 80px; height: 40px; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 18px; font-weight: bold;">${minQty.toFixed(unidad === 'unidad' ? 0 : 1)}</span>
                        <button onclick="window.cambiarCantidad('${p.id}', ${unidad === 'unidad' ? 1 : 0.5}, ${minQty})" style="width: 40px; height: 40px; background: white; border: 1px solid #ddd; border-radius: 8px; font-size: 20px; cursor: pointer;">+</button>
                    </div>
                    <span style="font-weight: bold; color: #27ae60; font-size: 20px;" id="total-${p.id}">$${((p.basePrice || 0) * minQty).toFixed(2)}</span>
                </div>
                
                <!-- BOTÓN AGREGAR AL CARRITO -->
                <button onclick="window.comprarProducto('${p.id}')" style="width: 100%; padding: 15px; background: #27ae60; color: white; border: none; border-radius: 12px; font-size: 18px; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                    🛒 Agregar al Carrito
                </button>
                
                <!-- BOTONES ADMIN (SOLO VISIBLES SI ESTÁ LOGEADO) -->
                <div id="admin-actions-${p.id}" style="display: ${usuarioActual ? 'flex' : 'none'}; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #e0e0e0;">
                    <button onclick="window.editarProductoPrompt('${p.id}')" style="padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">✏️ Editar</button>
                    <button onclick="window.eliminarProducto('${p.id}')" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 6px; cursor: pointer;">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    productosHTML += `</div>`;
    contenedor.innerHTML += productosHTML;
}

// ===== 5. CREAR CONTENEDOR =====
function crearContenedor() {
    const old = document.getElementById('berkot-container');
    if (old) old.remove();
    
    const container = document.createElement('div');
    container.id = 'berkot-container';
    container.style.cssText = 'max-width: 1200px; margin: 0 auto; padding: 20px;';
    document.body.prepend(container);
    return container;
}

// ===== 6. FUNCIONES DE CANTIDAD =====
window.cambiarCantidad = function(id, delta, min) {
    const span = document.getElementById(`cant-${id}`);
    const totalSpan = document.getElementById(`total-${id}`);
    if (!span || !totalSpan) return;
    
    let valor = parseFloat(span.textContent) || min;
    valor = Math.max(min, valor + delta);
    valor = Math.round(valor * 10) / 10;
    span.textContent = valor.toFixed(1);
    
    const producto = window.productos.find(p => p.id == id);
    if (producto) {
        totalSpan.textContent = `$${((producto.basePrice || 0) * valor).toFixed(2)}`;
    }
};

// ===== 7. COMPRAR =====
window.comprarProducto = function(id) {
    const producto = window.productos.find(p => p.id == id);
    if (!producto) {
        alert("❌ Producto no encontrado");
        return;
    }
    
    if (producto.available === false) {
        alert("❌ Producto no disponible");
        return;
    }
    
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
            total: (producto.basePrice || 0) * cantidad
        });
    }
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion(`✅ ${cantidad.toFixed(producto.unit === 'unidad' ? 0 : 1)} ${producto.unit} de ${producto.name} agregado`, 'success');
};

// ===== 8. NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'success') {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#27ae60' : tipo === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 10px;
        z-index: 9999999;
        animation: slideInRight 0.3s;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        font-weight: bold;
        max-width: 350px;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== 9. ACTUALIZAR CONTADOR CARRITO =====
function actualizarContadorCarrito() {
    const btnCarrito = document.getElementById('btn-carrito');
    if (btnCarrito) {
        const total = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
        btnCarrito.innerHTML = `🛒 ${total > 0 ? total.toFixed(1) : ''}`.trim();
    }
}

// ===== 10. VER CARRITO =====
window.verCarrito = function() {
    if (carrito.length === 0) {
        mostrarNotificacion('🛒 Carrito vacío', 'error');
        return;
    }
    
    let mensaje = "🛍️ MI CARRITO:\n\n";
    let total = 0;
    
    carrito.forEach((item, index) => {
        mensaje += `${index + 1}. ${item.nombre}: ${item.cantidad.toFixed(item.unidad === 'unidad' ? 0 : 1)} ${item.unidad} = $${(item.total || 0).toFixed(2)}\n`;
        total += item.total || 0;
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

// ===== 11. ENVIAR WHATSAPP =====
window.enviarPedidoWhatsApp = function() {
    if (carrito.length === 0) {
        mostrarNotificacion('❌ Carrito vacío', 'error');
        return;
    }
    
    const nombre = document.getElementById('cliente-nombre')?.value || clienteInfo.nombre || 'Cliente';
    const telefono = document.getElementById('cliente-telefono')?.value || clienteInfo.telefono || 'No especificado';
    const direccion = document.getElementById('cliente-direccion')?.value || clienteInfo.direccion || 'No especificada';
    const notas = document.getElementById('cliente-notas')?.value || clienteInfo.notas || '';
    
    if (!nombre || !telefono || !direccion) {
        mostrarNotificacion('❌ Completa tus datos en el formulario', 'error');
        document.querySelector('.customer-form')?.scrollIntoView({ behavior: 'smooth' });
        return;
    }
    
    let mensaje = "🛍️ *NUEVO PEDIDO - BERKOT*\n\n";
    mensaje += `👤 *Cliente:* ${nombre.trim()}\n`;
    mensaje += `📞 *Teléfono:* ${telefono.trim()}\n`;
    mensaje += `📍 *Dirección:* ${direccion.trim()}\n\n`;
    mensaje += "*🛒 PRODUCTOS:*\n";
    
    let totalGeneral = 0;
    carrito.forEach((item, index) => {
        const cantidad = item.cantidad || 0;
        const precio = item.precio || 0;
        const total = item.total || (precio * cantidad);
        mensaje += `${index + 1}. ${item.nombre}: ${cantidad.toFixed(item.unidad === 'unidad' ? 0 : 1)} ${item.unidad} x $${precio.toFixed(2)} = *$${total.toFixed(2)}*\n`;
        totalGeneral += total;
    });
    
    mensaje += `\n💰 *TOTAL: $${totalGeneral.toFixed(2)}*`;
    if (notas.trim()) mensaje += `\n\n📝 *Notas:* ${notas.trim()}`;
    
    const ahora = new Date();
    mensaje += `\n\n⏰ *Fecha:* ${ahora.toLocaleDateString('es-ES')} - ${ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    
    window.open(`https://wa.me/5356603249?text=${encodeURIComponent(mensaje)}`, '_blank');
    mostrarNotificacion('✅ Pedido enviado por WhatsApp', 'success');
    
    setTimeout(() => {
        if (confirm("✅ Pedido enviado. ¿Vaciar carrito?")) {
            carrito = [];
            localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            mostrarNotificacion('✅ Carrito vaciado', 'success');
        }
    }, 1500);
};

// ===== 12. GUARDAR INFORMACIÓN CLIENTE =====
window.guardarInformacionCliente = function() {
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

// ===== 13. CARGAR INFORMACIÓN CLIENTE =====
function cargarInfoCliente() {
    const saved = localStorage.getItem('cliente_info');
    if (saved) {
        try {
            clienteInfo = JSON.parse(saved);
            
            const nombreInput = document.getElementById('cliente-nombre');
            const telefonoInput = document.getElementById('cliente-telefono');
            const direccionInput = document.getElementById('cliente-direccion');
            const notasInput = document.getElementById('cliente-notas');
            
            if (nombreInput) nombreInput.value = clienteInfo.nombre || '';
            if (telefonoInput) telefonoInput.value = clienteInfo.telefono || '';
            if (direccionInput) direccionInput.value = clienteInfo.direccion || '';
            if (notasInput) notasInput.value = clienteInfo.notas || '';
        } catch (e) {}
    }
}

// ===== 14. BOTONES FLOTANTES =====
function crearBotones() {
    // Botón Carrito
    if (!document.getElementById('btn-carrito')) {
        const btnCarrito = document.createElement('button');
        btnCarrito.id = 'btn-carrito';
        btnCarrito.innerHTML = '🛒';
        btnCarrito.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999998;
            box-shadow: 0 4px 15px rgba(52,152,219,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        `;
        btnCarrito.onmouseover = () => btnCarrito.style.transform = 'scale(1.1)';
        btnCarrito.onmouseout = () => btnCarrito.style.transform = 'scale(1)';
        btnCarrito.onclick = window.verCarrito;
        document.body.appendChild(btnCarrito);
    }
    
    // Botón Admin
    if (!document.getElementById('btn-admin')) {
        const btnAdmin = document.createElement('button');
        btnAdmin.id = 'btn-admin';
        btnAdmin.innerHTML = '⚙️';
        btnAdmin.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 60px;
            height: 60px;
            background: #FFA000;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999999;
            box-shadow: 0 4px 15px rgba(255,160,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        `;
        btnAdmin.onmouseover = () => btnAdmin.style.transform = 'scale(1.1)';
        btnAdmin.onmouseout = () => btnAdmin.style.transform = 'scale(1)';
        btnAdmin.onclick = mostrarLogin;
        document.body.appendChild(btnAdmin);
    }
    
    // Botón WhatsApp
    if (!document.getElementById('btn-whatsapp')) {
        const btnWA = document.createElement('button');
        btnWA.id = 'btn-whatsapp';
        btnWA.innerHTML = '📱';
        btnWA.style.cssText = `
            position: fixed;
            bottom: 180px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #25D366;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 28px;
            cursor: pointer;
            z-index: 9999999;
            box-shadow: 0 6px 20px rgba(37,211,102,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
        `;
        btnWA.onmouseover = () => btnWA.style.transform = 'scale(1.1)';
        btnWA.onmouseout = () => btnWA.style.transform = 'scale(1)';
        btnWA.onclick = window.enviarPedidoWhatsApp;
        document.body.appendChild(btnWA);
    }
    
    // Botón Refresh para Cuba (solo visible para admin)
    if (!document.getElementById('btn-refresh') && usuarioActual) {
        const btnRefresh = document.createElement('button');
        btnRefresh.id = 'btn-refresh';
        btnRefresh.innerHTML = '🔄';
        btnRefresh.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 100px;
            width: 50px;
            height: 50px;
            background: #9b59b6;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 9999997;
            box-shadow: 0 4px 15px rgba(155,89,182,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        btnRefresh.onclick = () => {
            localStorage.removeItem(CACHE_KEY);
            cargarProductos();
            mostrarNotificacion('🔄 Caché actualizado', 'info');
        };
        document.body.appendChild(btnRefresh);
    }
    
    actualizarContadorCarrito();
}

// ===== 15. LOGIN =====
window.mostrarLogin = function() {
    const password = prompt("🔑 Contraseña de administrador:");
    if (password === "Berkot2026Admin") {
        usuarioActual = "admin";
        mostrarNotificacion('✅ Sesión iniciada', 'success');
        
        const btnAdmin = document.getElementById('btn-admin');
        if (btnAdmin) {
            btnAdmin.innerHTML = '👤';
            btnAdmin.onclick = mostrarPanelAdmin;
        }
        
        // Mostrar botones de admin
        window.productos.forEach(p => {
            const actions = document.getElementById(`admin-actions-${p.id}`);
            if (actions) actions.style.display = 'flex';
        });
        
        // Crear botón refresh
        crearBotones();
    } else {
        mostrarNotificacion('❌ Contraseña incorrecta', 'error');
    }
};

// ===== 16. LOGOUT =====
window.logout = function() {
    usuarioActual = null;
    mostrarNotificacion('✅ Sesión cerrada', 'success');
    
    const btnAdmin = document.getElementById('btn-admin');
    if (btnAdmin) {
        btnAdmin.innerHTML = '⚙️';
        btnAdmin.onclick = mostrarLogin;
    }
    
    // Ocultar botones de admin
    window.productos.forEach(p => {
        const actions = document.getElementById(`admin-actions-${p.id}`);
        if (actions) actions.style.display = 'none';
    });
    
    // Eliminar botón refresh
    const btnRefresh = document.getElementById('btn-refresh');
    if (btnRefresh) btnRefresh.remove();
};

// ===== 17. PANEL ADMIN =====
window.mostrarPanelAdmin = function() {
    const opcion = prompt(
        "👤 PANEL DE ADMINISTRACIÓN\n\n" +
        "1. ➕ Agregar producto\n" +
        "2. 🔒 Cerrar sesión\n\n" +
        "Selecciona 1 o 2:"
    );
    
    if (opcion === '1') {
        agregarProducto();
    } else if (opcion === '2') {
        window.logout();
    }
};

// ===== 18. AGREGAR PRODUCTO =====
window.agregarProducto = async function() {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    const nombre = prompt("📦 Nombre del producto:");
    if (!nombre || nombre.trim() === "") {
        mostrarNotificacion('❌ El nombre es obligatorio', 'error');
        return;
    }
    
    const precio = parseFloat(prompt("💰 Precio:"));
    if (!precio || precio <= 0) {
        mostrarNotificacion('❌ Precio inválido', 'error');
        return;
    }
    
    const unidad = prompt("⚖️ Unidad de medida (lb/kg/l/unidad):", "lb");
    if (!unidad || !['lb', 'kg', 'l', 'unidad'].includes(unidad)) {
        mostrarNotificacion('❌ Unidad inválida', 'error');
        return;
    }
    
    const descripcion = prompt("📝 Descripción (opcional):") || "";
    const disponible = confirm("🟢 ¿Producto disponible? (Aceptar = Sí, Cancelar = No)");
    
    try {
        const { error } = await supabase
            .from('productos')
            .insert([{
                name: nombre.trim(),
                basePrice: precio,
                unit: unidad,
                description: descripcion.trim(),
                minQty: unidad === 'unidad' ? 1 : 0.5,
                available: disponible,
                icon: 'fa-box'
            }]);
        
        if (error) throw error;
        mostrarNotificacion('✅ Producto agregado correctamente', 'success');
    } catch (error) {
        console.error(error);
        mostrarNotificacion('❌ Error al agregar: ' + error.message, 'error');
    }
};

// ===== 19. EDITAR PRODUCTO (COMPLETO) =====
window.editarProductoPrompt = async function(id) {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    const producto = window.productos.find(p => p.id == id);
    if (!producto) return;
    
    const opcion = prompt(
        `✏️ EDITAR PRODUCTO: ${producto.name}\n\n` +
        `1. 📝 Cambiar nombre\n` +
        `2. 💰 Cambiar precio\n` +
        `3. ⚖️ Cambiar unidad\n` +
        `4. 📋 Cambiar descripción\n` +
        `5. 🟢 Cambiar disponibilidad (${producto.available ? 'Disponible' : 'Agotado'})\n` +
        `6. ❌ Cancelar\n\n` +
        `Selecciona una opción (1-6):`
    );
    
    try {
        switch(opcion) {
            case '1':
                const nuevoNombre = prompt("Nuevo nombre:", producto.name);
                if (nuevoNombre && nuevoNombre.trim()) {
                    const { error } = await supabase
                        .from('productos')
                        .update({ name: nuevoNombre.trim() })
                        .eq('id', id);
                    if (error) throw error;
                    mostrarNotificacion('✅ Nombre actualizado', 'success');
                }
                break;
                
            case '2':
                const nuevoPrecio = parseFloat(prompt("Nuevo precio:", producto.basePrice));
                if (nuevoPrecio > 0) {
                    const { error } = await supabase
                        .from('productos')
                        .update({ basePrice: nuevoPrecio })
                        .eq('id', id);
                    if (error) throw error;
                    mostrarNotificacion('✅ Precio actualizado', 'success');
                }
                break;
                
            case '3':
                const nuevaUnidad = prompt("Nueva unidad (lb/kg/l/unidad):", producto.unit);
                if (nuevaUnidad && ['lb', 'kg', 'l', 'unidad'].includes(nuevaUnidad)) {
                    const { error } = await supabase
                        .from('productos')
                        .update({ 
                            unit: nuevaUnidad,
                            minQty: nuevaUnidad === 'unidad' ? 1 : 0.5
                        })
                        .eq('id', id);
                    if (error) throw error;
                    mostrarNotificacion('✅ Unidad actualizada', 'success');
                }
                break;
                
            case '4':
                const nuevaDesc = prompt("Nueva descripción:", producto.description || '');
                const { error: errorDesc } = await supabase
                    .from('productos')
                    .update({ description: nuevaDesc || '' })
                    .eq('id', id);
                if (errorDesc) throw errorDesc;
                mostrarNotificacion('✅ Descripción actualizada', 'success');
                break;
                
            case '5':
                const nuevoEstado = !producto.available;
                const { error: errorEstado } = await supabase
                    .from('productos')
                    .update({ available: nuevoEstado })
                    .eq('id', id);
                if (errorEstado) throw errorEstado;
                mostrarNotificacion(`✅ Producto ${nuevoEstado ? 'disponible' : 'agotado'}`, 'success');
                break;
                
            case '6':
                mostrarNotificacion('❌ Edición cancelada', 'info');
                break;
                
            default:
                mostrarNotificacion('❌ Opción no válida', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion('❌ Error al editar: ' + error.message, 'error');
    }
};

// ===== 20. ELIMINAR PRODUCTO =====
window.eliminarProducto = async function(id) {
    if (!usuarioActual) {
        mostrarNotificacion('❌ Debes iniciar sesión', 'error');
        return;
    }
    
    if (!confirm("⚠️ ¿Estás seguro de eliminar este producto permanentemente?")) return;
    
    try {
        const { error } = await supabase
            .from('productos')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        mostrarNotificacion('✅ Producto eliminado', 'success');
    } catch (error) {
        console.error(error);
        mostrarNotificacion('❌ Error al eliminar: ' + error.message, 'error');
    }
};

// ===== 21. ESTILOS GLOBALES =====
function agregarEstilos() {
    if (document.getElementById('berkot-styles')) return;
    
    const estilos = document.createElement('style');
    estilos.id = 'berkot-styles';
    estilos.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        body { 
            margin: 0; 
            padding: 0; 
            background: #f5f5f5;
            font-family: 'Arial', sans-serif;
        }
        .customer-form {
            max-width: 800px;
            margin: 40px auto;
            padding: 30px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #34495e;
        }
        .form-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: border 0.3s;
        }
        .form-input:focus {
            border-color: #3498db;
            outline: none;
            box-shadow: 0 0 0 3px rgba(52,152,219,0.1);
        }
    `;
    document.head.appendChild(estilos);
}

// ===== 22. INICIALIZAR =====
async function inicializar() {
    console.log("🚀 Iniciando Berkot Supabase - Versión Completa");
    
    agregarEstilos();
    crearBotones();
    cargarInfoCliente();
    await cargarProductos();
    
    console.log("✅✅ BERKOT SUPABASE LISTO - CON TODAS LAS FUNCIONES");
    console.log("📞 Número: 5356603249");
}

// ===== EJECUTAR =====
inicializar();

// ===== EXPORTAR FUNCIONES =====
window.cambiarCantidad = cambiarCantidad;
window.comprarProducto = comprarProducto;
window.verCarrito = verCarrito;
window.editarProductoPrompt = editarProductoPrompt;
window.eliminarProducto = eliminarProducto;
window.agregarProducto = agregarProducto;
window.logout = logout;
window.guardarInformacionCliente = guardarInformacionCliente;
window.enviarPedidoWhatsApp = enviarPedidoWhatsApp;
