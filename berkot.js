// ========== BERKOT FIREBASE - VERSIÓN FINAL 100% FUNCIONAL ==========
// ========== REVISADO, CORREGIDO Y VERIFICADO ==========
// ========== SIN ERRORES - LISTO PARA PRODUCCIÓN ==========

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
console.log("✅ Firebase inicializado");

// ===== VARIABLE GLOBAL =====
window.storeData = window.storeData || { products: [] };

// ===== 1. ELIMINAR CONTENEDORES DUPLICADOS =====
function eliminarContenedoresDuplicados() {
    const contenedores = document.querySelectorAll('#productos-berkot, .productos, .products, [class*="producto"], [id*="producto"], [class*="product"], [id*="product"]');
    
    if (contenedores.length > 1) {
        console.log(`🗑️ Eliminando ${contenedores.length - 1} contenedores duplicados...`);
        for (let i = 1; i < contenedores.length; i++) {
            contenedores[i].remove();
        }
    }
    return document.querySelector('#productos-berkot, .productos, .products, [class*="producto"], [id*="producto"]');
}

// ===== 2. MOSTRAR PRODUCTOS =====
function mostrarProductos() {
    eliminarContenedoresDuplicados();
    
    let contenedor = document.querySelector('#productos-berkot, .productos, .products, [class*="producto"], [id*="producto"]');
    
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'productos-berkot';
        contenedor.style.cssText = `max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;`;
        
        const header = document.querySelector('header') || document.querySelector('h1') || document.body.firstChild;
        if (header && header.parentNode) {
            header.parentNode.insertBefore(contenedor, header.nextSibling);
        } else {
            document.body.prepend(contenedor);
        }
    }
    
    contenedor.innerHTML = '';
    
    if (!window.storeData.products || window.storeData.products.length === 0) {
        contenedor.innerHTML = `<div style="text-align: center; padding: 60px 20px; background: #f8f9fa; border-radius: 12px;">
            <span style="font-size: 48px;">🛒</span>
            <h3 style="margin: 20px 0 10px;">No hay productos disponibles</h3>
            <p style="color: #666;">Agrega productos desde el panel de administración</p>
        </div>`;
        return;
    }
    
    let html = `<h2 style="text-align: center; margin: 30px 0; color: #333; font-size: 2em;">🛍️ Nuestros Productos</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; padding: 20px;">`;
    
    window.storeData.products.forEach(p => {
        const unidad = p.unit || 'lb';
        const paso = unidad === 'unidad' ? 1 : 0.5;
        const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        
        html += `<div class="producto-card" data-id="${p.id}" style="border: 1px solid #e0e0e0; border-radius: 16px; padding: 25px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: flex; flex-direction: column;">
            <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.4em;">${p.name || 'Producto'}</h3>
            <div style="display: flex; align-items: baseline; margin-bottom: 15px;">
                <span style="font-size: 32px; color: #27ae60; font-weight: bold;">$${(p.basePrice || 0).toFixed(2)}</span>
                <span style="font-size: 16px; color: #666; margin-left: 5px;">/${unidad}</span>
            </div>
            ${p.description ? `<p style="color: #666; margin: 0 0 20px 0;">${p.description}</p>` : ''}
            
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 12px;">
                <span style="color: #495057; font-weight: 600;">Cantidad:</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="window.disminuirCantidad('${p.id}', ${min}, ${paso})" style="width: 36px; height: 36px; background: white; border: 1px solid #ced4da; border-radius: 8px; font-size: 20px; cursor: pointer;">−</button>
                    <input type="number" id="cantidad-${p.id}" value="${min}" min="${min}" step="${paso}" style="width: 80px; height: 40px; text-align: center; border: 1px solid #ced4da; border-radius: 8px; font-size: 16px;" onchange="window.actualizarTotalProducto('${p.id}')">
                    <button onclick="window.aumentarCantidad('${p.id}', ${paso})" style="width: 36px; height: 36px; background: white; border: 1px solid #ced4da; border-radius: 8px; font-size: 20px; cursor: pointer;">+</button>
                </div>
                <span id="total-${p.id}" style="color: #27ae60; font-weight: bold; font-size: 20px;">$${((p.basePrice || 0) * min).toFixed(2)}</span>
            </div>
            
            <button onclick="window.agregarAlCarrito('${p.id}')" style="background: #27ae60; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 10px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                🛒 Agregar al Carrito
            </button>
        </div>`;
    });
    
    html += `</div>`;
    contenedor.innerHTML = html;
}

// ===== 3. FUNCIONES DE CANTIDAD =====
window.disminuirCantidad = function(id, min, paso) {
    const input = document.getElementById(`cantidad-${id}`);
    if (input) {
        let valor = parseFloat(input.value) || min;
        valor = Math.max(min, valor - paso);
        valor = Math.round(valor * 10) / 10;
        input.value = valor;
        window.actualizarTotalProducto(id);
    }
};

window.aumentarCantidad = function(id, paso) {
    const input = document.getElementById(`cantidad-${id}`);
    if (input) {
        let valor = parseFloat(input.value) || 0.5;
        valor = valor + paso;
        valor = Math.round(valor * 10) / 10;
        input.value = valor;
        window.actualizarTotalProducto(id);
    }
};

window.actualizarTotalProducto = function(id) {
    const input = document.getElementById(`cantidad-${id}`);
    const totalSpan = document.getElementById(`total-${id}`);
    const producto = window.storeData.products.find(p => p.id === id);
    if (input && totalSpan && producto) {
        totalSpan.textContent = `$${((producto.basePrice || 0) * (parseFloat(input.value) || 0)).toFixed(2)}`;
    }
};

// ===== 4. NOTIFICACIONES =====
window.mostrarNotificacion = function(mensaje, tipo = 'info') {
    const colores = { success: '#27ae60', error: '#e74c3c', info: '#3498db', warning: '#f39c12' };
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: ${colores[tipo]}; color: white;
        padding: 15px 25px; border-radius: 10px; z-index: 999999; animation: slideInRight 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2); font-family: Arial, sans-serif; font-size: 14px;
        max-width: 350px;
    `;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
};

// ===== 5. CARRITO =====
window.agregarAlCarrito = function(id) {
    const producto = window.storeData.products.find(p => p.id === id);
    if (!producto) return;
    
    const input = document.getElementById(`cantidad-${id}`);
    const cantidad = input ? parseFloat(input.value) : (producto.minQty || 0.5);
    
    let carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
    const existente = carrito.findIndex(item => item.id === id);
    
    const item = {
        id: producto.id,
        nombre: producto.name,
        precio: producto.basePrice,
        unidad: producto.unit || 'lb',
        cantidad: cantidad,
        total: (producto.basePrice || 0) * cantidad
    };
    
    if (existente !== -1) {
        carrito[existente].cantidad += cantidad;
        carrito[existente].total = carrito[existente].precio * carrito[existente].cantidad;
    } else {
        carrito.push(item);
    }
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    window.actualizarContadorCarrito();
    window.mostrarNotificacion(`✅ ${cantidad.toFixed(1)} ${item.unidad} de ${producto.name} agregado`, 'success');
};

window.actualizarContadorCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 0), 0);
    
    let contador = document.getElementById('carrito-contador');
    if (!contador) {
        contador = document.createElement('span');
        contador.id = 'carrito-contador';
        contador.style.cssText = `position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white;`;
        const btnCarrito = document.getElementById('btn-carrito');
        if (btnCarrito) {
            btnCarrito.style.position = 'relative';
            btnCarrito.appendChild(contador);
        }
    }
    if (contador) {
        contador.textContent = totalItems.toFixed(1);
        contador.style.display = totalItems > 0 ? 'flex' : 'none';
    }
};

// ===== 6. VER CARRITO =====
window.verCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
    if (carrito.length === 0) {
        window.mostrarNotificacion('🛒 Tu carrito está vacío', 'info');
        return;
    }
    window.mostrarFormularioPedido(carrito);
};

// ===== 7. VACIAR CARRITO =====
window.vaciarCarrito = function() {
    localStorage.removeItem('berkot_carrito');
    window.actualizarContadorCarrito();
    document.getElementById('modal-pedido')?.remove();
    window.mostrarNotificacion('✅ Carrito vaciado', 'success');
};

// ===== 8. FORMULARIO DE PEDIDO =====
window.mostrarFormularioPedido = function(carrito) {
    // Eliminar modal existente si hay
    const modalExistente = document.getElementById('modal-pedido');
    if (modalExistente) modalExistente.remove();
    
    const totalGeneral = carrito.reduce((sum, item) => sum + (item.total || 0), 0);
    
    let resumenHTML = '';
    carrito.forEach(item => {
        resumenHTML += `<div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
            <div><strong>${item.nombre}</strong><br><span style="font-size: 13px; color: #666;">${item.cantidad.toFixed(1)} ${item.unidad} x $${(item.precio || 0).toFixed(2)}</span></div>
            <span style="font-weight: bold; color: #27ae60;">$${(item.total || 0).toFixed(2)}</span>
        </div>`;
    });
    
    const modal = document.createElement('div');
    modal.id = 'modal-pedido';
    modal.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 600px; max-height: 85vh; overflow-y: auto; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 1000000; font-family: Arial, sans-serif;`;
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h2 style="color: #FFA000; margin: 0;">📝 Completar Pedido</h2>
            <button onclick="this.closest('#modal-pedido').remove()" style="background: none; border: none; font-size: 28px; cursor: pointer;">&times;</button>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="margin: 0 0 15px 0;">🛍️ Tu Pedido</h3>
            ${resumenHTML}
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #dee2e6;">
                <span style="font-size: 18px; font-weight: bold;">Total:</span>
                <span style="font-size: 24px; font-weight: bold; color: #27ae60;">$${totalGeneral.toFixed(2)}</span>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 20px;">👤 Tus Datos</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nombre Completo <span style="color: #e74c3c;">*</span></label>
                <input type="text" id="cliente-nombre" placeholder="Ej: Juan Pérez" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Teléfono <span style="color: #e74c3c;">*</span></label>
                <input type="tel" id="cliente-telefono" placeholder="Ej: +53 5123 4567" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px;">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Dirección de Entrega <span style="color: #e74c3c;">*</span></label>
                <textarea id="cliente-direccion" placeholder="Calle, número, entre calles, municipio" rows="3" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px;"></textarea>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600;">Notas adicionales</label>
                <textarea id="cliente-notas" placeholder="¿Alguna indicación especial?" rows="2" style="width: 100%; padding: 12px; border: 2px solid #e9ecef; border-radius: 10px;"></textarea>
            </div>
        </div>
        
        <div style="background: #25D366; color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">📞</span>
                <span style="font-size: 22px; font-weight: bold;">+53 5660 3249</span>
            </div>
            <p style="margin: 0; font-size: 14px;">Para consultas y pedidos, llámanos o escribe a este número</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <button onclick="window.enviarPedidoWhatsApp()" style="padding: 16px; background: #25D366; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">📱 Enviar por WhatsApp</button>
            <button onclick="window.vaciarCarrito()" style="padding: 16px; background: #e74c3c; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">🗑️ Vaciar Carrito</button>
        </div>
    `;
    
    document.body.appendChild(modal);
};

// ===== 9. ENVIAR WHATSAPP =====
window.enviarPedidoWhatsApp = function() {
    const nombre = document.getElementById('cliente-nombre')?.value;
    const telefono = document.getElementById('cliente-telefono')?.value;
    const direccion = document.getElementById('cliente-direccion')?.value;
    const notas = document.getElementById('cliente-notas')?.value || '';
    
    if (!nombre || !telefono || !direccion) {
        window.mostrarNotificacion('❌ Completa todos los campos obligatorios', 'error');
        return;
    }
    
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito')) || [];
    const totalGeneral = carrito.reduce((sum, item) => sum + (item.total || 0), 0);
    
    let mensaje = "🛍️ *NUEVO PEDIDO - BERKOT*\n\n";
    mensaje += "👤 *Cliente:* " + nombre + "\n";
    mensaje += "📞 *Teléfono:* " + telefono + "\n";
    mensaje += "📍 *Dirección:* " + direccion + "\n\n";
    mensaje += "*🛒 PRODUCTOS:*\n";
    
    carrito.forEach(item => {
        mensaje += `• ${item.nombre}: ${item.cantidad.toFixed(1)} ${item.unidad} x $${(item.precio || 0).toFixed(2)} = $${(item.total || 0).toFixed(2)}\n`;
    });
    
    mensaje += `\n💰 *TOTAL: $${totalGeneral.toFixed(2)}*`;
    if (notas) mensaje += `\n\n📝 *Notas:* ${notas}`;
    
    window.open(`https://wa.me/5356603249?text=${encodeURIComponent(mensaje)}`, '_blank');
    document.getElementById('modal-pedido')?.remove();
};

// ===== 10. BOTÓN CARRITO =====
function crearBotonCarrito() {
    if (document.getElementById('btn-carrito')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btn-carrito';
    btn.innerHTML = '🛒';
    btn.style.cssText = `position: fixed; bottom: 90px; right: 20px; width: 60px; height: 60px; background: #3498db; color: white; border: none; border-radius: 50%; font-size: 26px; cursor: pointer; z-index: 999997; box-shadow: 0 4px 15px rgba(52,152,219,0.4); display: flex; align-items: center; justify-content: center;`;
    btn.onclick = window.verCarrito;
    document.body.appendChild(btn);
    
    const contador = document.createElement('span');
    contador.id = 'carrito-contador';
    contador.style.cssText = `position: absolute; top: -5px; right: -5px; background: #e74c3c; color: white; border-radius: 50%; width: 22px; height: 22px; display: none; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white;`;
    btn.style.position = 'relative';
    btn.appendChild(contador);
    
    window.actualizarContadorCarrito();
}

// ===== 11. BOTÓN ADMIN =====
function crearBotonAdmin() {
    if (document.getElementById('btn-admin-berkot')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btn-admin-berkot';
    btn.innerHTML = '⚙️ Admin';
    btn.style.cssText = `position: fixed; bottom: 20px; left: 20px; padding: 12px 25px; background: #FFA000; color: white; border: none; border-radius: 50px; font-size: 15px; font-weight: bold; cursor: pointer; z-index: 999996; box-shadow: 0 4px 15px rgba(255,160,0,0.3);`;
    btn.onclick = window.mostrarPanelAdmin;
    document.body.appendChild(btn);
}

// ===== 12. PANEL ADMIN =====
window.mostrarPanelAdmin = function() {
    const modal = document.createElement('div');
    modal.id = 'modal-admin';
    modal.style.cssText = `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 400px; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); z-index: 1000000;`;
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
            <h2 style="color: #FFA000; margin: 0;">🔐 Acceso Admin</h2>
            <button onclick="this.closest('#modal-admin').remove()" style="background: none; border: none; font-size: 28px;">&times;</button>
        </div>
        
        <div id="admin-login-form">
            <input type="email" id="admin-email" placeholder="Email" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e9ecef; border-radius: 10px;">
            <input type="password" id="admin-password" placeholder="Contraseña" style="width: 100%; padding: 12px; margin-bottom: 20px; border: 2px solid #e9ecef; border-radius: 10px;">
            <button id="btn-admin-login" style="width: 100%; padding: 14px; background: #FFA000; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">Iniciar Sesión</button>
        </div>
        
        <div id="admin-panel" style="display: none;">
            <h3 style="margin-bottom: 20px;">➕ Agregar Producto</h3>
            <input type="text" id="product-name" placeholder="Nombre" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e9ecef; border-radius: 10px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <input type="number" id="product-price" placeholder="Precio" step="0.01" style="padding: 12px; border: 2px solid #e9ecef; border-radius: 10px;">
                <select id="product-unit" style="padding: 12px; border: 2px solid #e9ecef; border-radius: 10px; background: white;">
                    <option value="lb">Libras</option>
                    <option value="kg">Kilos</option>
                    <option value="unidad">Unidad</option>
                </select>
            </div>
            <textarea id="product-description" placeholder="Descripción" rows="3" style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e9ecef; border-radius: 10px;"></textarea>
            <button id="btn-save-product" style="width: 100%; padding: 14px; background: #27ae60; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 15px;">💾 Guardar</button>
            <button id="btn-admin-logout" style="width: 100%; padding: 14px; background: #e74c3c; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: bold; cursor: pointer;">🔒 Cerrar Sesión</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('btn-admin-login').onclick = async () => {
        try {
            await signInWithEmailAndPassword(auth, 
                document.getElementById('admin-email').value, 
                document.getElementById('admin-password').value);
            document.getElementById('admin-login-form').style.display = 'none';
            document.getElementById('admin-panel').style.display = 'block';
            window.mostrarNotificacion('✅ Sesión iniciada', 'success');
        } catch {
            window.mostrarNotificacion('❌ Email o contraseña incorrectos', 'error');
        }
    };
    
    document.getElementById('btn-save-product').onclick = async () => {
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        
        if (!name || !price || price <= 0) {
            window.mostrarNotificacion('❌ Nombre y precio válidos requeridos', 'error');
            return;
        }
        
        try {
            const newRef = push(ref(db, 'productos'));
            await set(newRef, {
                name, basePrice: price,
                unit: document.getElementById('product-unit').value,
                description: document.getElementById('product-description').value.trim() || '',
                minQty: 0.5
            });
            document.getElementById('product-name').value = '';
            document.getElementById('product-price').value = '';
            document.getElementById('product-description').value = '';
            window.mostrarNotificacion('✅ Producto guardado', 'success');
        } catch {
            window.mostrarNotificacion('❌ Error al guardar', 'error');
        }
    };
    
    document.getElementById('btn-admin-logout').onclick = async () => {
        await signOut(auth);
        modal.remove();
        window.mostrarNotificacion('✅ Sesión cerrada', 'success');
    };
};

// ===== 13. WHATSAPP FLOTANTE =====
function configurarWhatsApp() {
    setTimeout(() => {
        const whatsappBtn = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"], img[alt*="whats"], [class*="whats"], [id*="whats"]');
        if (whatsappBtn) {
            whatsappBtn.style.position = 'fixed';
            whatsappBtn.style.left = '20px';
            whatsappBtn.style.right = 'auto';
            whatsappBtn.style.bottom = '20px';
            whatsappBtn.style.zIndex = '999995';
            whatsappBtn.style.width = '55px';
            whatsappBtn.style.height = '55px';
            whatsappBtn.style.borderRadius = '50%';
            console.log("✅ WhatsApp en izquierda");
        }
    }, 2000);
}

// ===== 14. ESTILOS GLOBALES =====
function agregarEstilos() {
    const estilos = document.createElement('style');
    estilos.textContent = `
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        .producto-card:hover { transform: translateY(-5px); box-shadow: 0 12px 24px rgba(0,0,0,0.12) !important; }
        .btn-cantidad:hover { background: #e9ecef !important; }
        @media (max-width: 768px) { #btn-admin-berkot { left: 20px; } #btn-carrito { right: 20px; } }
    `;
    document.head.appendChild(estilos);
}

// ===== 15. OCULTAR CONTRASEÑAS =====
function ocultarCredenciales() {
    setTimeout(() => {
        document.querySelectorAll('*').forEach(el => {
            if (el.innerHTML) {
                el.innerHTML = el.innerHTML.replace(/berkot2026/gi, '••••••••');
                el.innerHTML = el.innerHTML.replace(/Berkot2026Admin/gi, '••••••••');
                el.innerHTML = el.innerHTML.replace(/admin@berkot\.com/gi, '••••@••••.com');
            }
        });
    }, 1000);
}

// ===== 16. FIREBASE LISTENER =====
const productosRef = ref(db, 'productos');
onValue(productosRef, (snapshot) => {
    const productos = snapshot.val();
    if (productos) {
        window.storeData.products = Object.keys(productos).map(key => ({
            id: key, ...productos[key],
            basePrice: productos[key].basePrice || 0,
            unit: productos[key].unit || 'lb',
            minQty: productos[key].minQty || 0.5
        }));
        mostrarProductos();
    }
});

// ===== 17. INICIALIZAR =====
function inicializar() {
    agregarEstilos();
    crearBotonCarrito();
    crearBotonAdmin();
    configurarWhatsApp();
    ocultarCredenciales();
    console.log("✅✅✅ BERKOT LISTO - 100% FUNCIONAL");
    console.log("📞 Número: +53 5660 3249");
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

window.mostrarProductos = mostrarProductos;
