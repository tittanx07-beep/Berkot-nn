// ========== BERKOT FIREBASE - VERSIÓN FINAL CON TODOS LOS ERRORES CORREGIDOS ==========
// ========== SIN DUPLICADOS, WHATSAPP EN IZQUIERDA, FORMULARIO DE PEDIDO ==========

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

// ===== 1. ELIMINAR TODOS LOS CONTENEDORES DUPLICADOS =====
function limpiarContenedoresDuplicados() {
    const contenedores = document.querySelectorAll(
        '.products, .product-grid, #products, .product-list, ' +
        '[class*="producto"], [class*="product"], ' +
        '[id*="producto"], [id*="product"], ' +
        '#seccion-productos-berkot, #productos-berkot'
    );
    
    if (contenedores.length > 1) {
        console.log(`🗑️ Eliminando ${contenedores.length - 1} contenedores duplicados...`);
        for (let i = 1; i < contenedores.length; i++) {
            contenedores[i].remove();
        }
    }
    
    return contenedores[0] || null;
}

// ===== 2. CREAR CONTENEDOR DE PRODUCTOS SI NO EXISTE =====
function crearContenedorProductos() {
    let contenedor = limpiarContenedoresDuplicados();
    
    if (!contenedor) {
        console.log("📦 Creando nuevo contenedor de productos...");
        const main = document.querySelector('main') || document.querySelector('.content') || document.querySelector('body');
        contenedor = document.createElement('div');
        contenedor.id = 'seccion-productos-berkot';
        contenedor.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;
        main.appendChild(contenedor);
        console.log("✅ Contenedor creado");
    }
    
    return contenedor;
}

// ===== 3. MOSTRAR PRODUCTOS - VERSIÓN DEFINITIVA SIN DUPLICADOS =====
function mostrarProductosEnPagina() {
    console.log("🔄 Mostrando productos...");
    
    const contenedor = crearContenedorProductos();
    if (!contenedor) return;
    
    contenedor.innerHTML = '';
    
    if (!window.storeData.products || window.storeData.products.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #666; background: #f9f9f9; border-radius: 12px; margin: 20px;">
                <span style="font-size: 48px;">🛒</span>
                <h3 style="margin: 20px 0 10px;">No hay productos disponibles</h3>
                <p style="color: #999;">Agrega productos desde el panel de administración</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <h2 style="text-align: center; margin: 30px 0; color: #333; font-size: 2em;">🛍️ Nuestros Productos</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; padding: 20px;">
    `;
    
    window.storeData.products.forEach(p => {
        const unidad = p.unit || 'lb';
        const paso = unidad === 'unidad' ? 1 : 0.5;
        const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        
        html += `
            <div class="producto-${p.id}" style="
                border: 1px solid #e0e0e0;
                border-radius: 16px;
                padding: 25px;
                background: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                display: flex;
                flex-direction: column;
            ">
                <h3 style="margin: 0 0 15px 0; color: #333; font-size: 1.4em;">${p.name || 'Producto'}</h3>
                
                <div style="display: flex; align-items: baseline; margin-bottom: 15px;">
                    <span style="font-size: 32px; color: #27ae60; font-weight: bold;">$${p.basePrice?.toFixed(2) || '0.00'}</span>
                    <span style="font-size: 16px; color: #666; margin-left: 5px;">/${unidad}</span>
                </div>
                
                ${p.description ? `<p style="color: #666; margin: 0 0 20px 0;">${p.description}</p>` : ''}
                
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 15px 0;
                    padding: 15px;
                    background: #f8f9fa;
                    border-radius: 12px;
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
                            cursor: pointer;
                        ">−</button>
                        
                        <input type="number" id="cantidad-${p.id}" value="${min}" min="${min}" step="${paso}" style="
                            width: 80px;
                            height: 40px;
                            text-align: center;
                            border: 1px solid #ced4da;
                            border-radius: 8px;
                            font-size: 16px;
                            font-weight: 600;
                        " onchange="actualizarTotalProducto('${p.id}', ${p.basePrice})">
                        
                        <button onclick="aumentarCantidad('${p.id}', ${paso})" style="
                            width: 36px;
                            height: 36px;
                            background: white;
                            border: 1px solid #ced4da;
                            border-radius: 8px;
                            font-size: 20px;
                            cursor: pointer;
                        ">+</button>
                    </div>
                    <span id="total-${p.id}" style="color: #27ae60; font-weight: bold; font-size: 20px;">
                        $${(p.basePrice * min).toFixed(2)}
                    </span>
                </div>
                
                <button onclick="comprarProducto('${p.id}')" style="
                    background: #27ae60;
                    color: white;
                    border: none;
                    padding: 16px 20px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 10px;
                    transition: background 0.3s;
                " onmouseover="this.style.background='#219a52'" onmouseout="this.style.background='#27ae60'">
                    🛒 Agregar al Carrito
                </button>
            </div>
        `;
    });
    
    html += `</div>`;
    contenedor.innerHTML = html;
    console.log(`✅ ${window.storeData.products.length} productos mostrados`);
}

// ===== FUNCIONES DE CANTIDAD =====
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

// ===== FUNCIÓN DE COMPRA =====
window.comprarProducto = function(id) {
    const producto = window.storeData.products.find(p => p.id === id);
    if (!producto) return;
    
    const input = document.getElementById(`cantidad-${id}`);
    const cantidad = input ? parseFloat(input.value) : (producto.minQty || 0.5);
    
    const item = {
        id: producto.id,
        nombre: producto.name,
        precio: producto.basePrice,
        unidad: producto.unit || 'lb',
        cantidad: cantidad,
        total: producto.basePrice * cantidad
    };
    
    let carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    const existente = carrito.findIndex(p => p.id === id);
    
    if (existente !== -1) {
        carrito[existente].cantidad += cantidad;
        carrito[existente].total = carrito[existente].precio * carrito[existente].cantidad;
    } else {
        carrito.push(item);
    }
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    
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
    `;
    notificacion.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 20px;">✅</span>
            <div>
                <strong>${cantidad.toFixed(1)} ${item.unidad} de ${producto.name}</strong><br>
                <small>$${item.total.toFixed(2)}</small>
            </div>
        </div>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
    
    actualizarContadorCarrito();
};

// ===== CONTADOR DEL CARRITO =====
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
        `;
        document.body.appendChild(contador);
    }
    
    contador.textContent = totalItems.toFixed(1);
    contador.style.display = totalItems > 0 ? 'flex' : 'none';
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
            background: #3498db;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 26px;
            cursor: pointer;
            z-index: 999997;
            box-shadow: 0 4px 15px rgba(52,152,219,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        btnCarrito.onclick = window.verCarrito;
        document.body.appendChild(btnCarrito);
        actualizarContadorCarrito();
    }
}, 1500);

// ===== VER CARRITO =====
window.verCarrito = function() {
    const carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
    
    if (carrito.length === 0) {
        alert("🛒 Tu carrito está vacío");
        return;
    }
    
    mostrarFormularioPedido(carrito);
};

// ===== FORMULARIO DE PEDIDO - CON NÚMERO CORREGIDO =====
function mostrarFormularioPedido(carrito) {
    const totalGeneral = carrito.reduce((sum, item) => sum + item.total, 0);
    
    const modal = document.createElement('div');
    modal.id = 'modal-pedido';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 550px;
        max-height: 85vh;
        overflow-y: auto;
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 1000001;
        font-family: Arial, sans-serif;
    `;
    
    let resumenCarrito = '';
    carrito.forEach((item, index) => {
        resumenCarrito += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <span style="font-size: 14px; color: #666;">${item.cantidad.toFixed(1)} ${item.unidad} x $${item.precio.toFixed(2)}</span>
                </div>
                <span style="font-weight: bold; color: #27ae60;">$${item.total.toFixed(2)}</span>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
            <h2 style="color: #FFA000; margin:0; font-size: 24px;">📝 Información para tu Pedido</h2>
            <button onclick="this.parentElement.parentElement.remove()" style="background:none; border:none; font-size: 28px; cursor:pointer;">&times;</button>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
            <h3 style="margin:0 0 15px 0; color: #333;">🛍️ Tu Pedido</h3>
            ${resumenCarrito}
            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd;">
                <span style="font-size: 18px; font-weight: bold;">Total:</span>
                <span style="font-size: 24px; font-weight: bold; color: #27ae60;">$${totalGeneral.toFixed(2)}</span>
            </div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 20px;">👤 Tus Datos</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #495057;">
                    Nombre Completo <span style="color: #e74c3c;">*</span>
                </label>
                <input type="text" id="cliente-nombre" placeholder="Ej: Juan Pérez" style="
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    font-size: 15px;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #495057;">
                    Número de Teléfono <span style="color: #e74c3c;">*</span>
                </label>
                <input type="tel" id="cliente-telefono" placeholder="Ej: +5351234567" style="
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    font-size: 15px;
                ">
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #495057;">
                    Dirección de Entrega <span style="color: #e74c3c;">*</span>
                </label>
                <textarea id="cliente-direccion" placeholder="Calle, número, entre calles, municipio" rows="3" style="
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    font-size: 15px;
                    resize: vertical;
                "></textarea>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold; color: #495057;">
                    Notas adicionales
                </label>
                <textarea id="cliente-notas" placeholder="¿Alguna indicación especial?" rows="2" style="
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ced4da;
                    border-radius: 8px;
                    font-size: 15px;
                    resize: vertical;
                "></textarea>
            </div>
        </div>
        
        <!-- NÚMERO CORREGIDO: +53 5660 3249 -->
        <div style="
            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
            text-align: center;
        ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-size: 24px;">📞</span>
                <span style="font-size: 20px; font-weight: bold;">+53 5660 3249</span>
            </div>
            <p style="margin:0; font-size: 14px; opacity: 0.9;">
                Para consultas y pedidos, llámanos o escribe a este número
            </p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 25px;">
            <button onclick="enviarPedidoWhatsApp()" style="
                padding: 16px;
                background: #25D366;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: background 0.3s;
            " onmouseover="this.style.background='#128C7E'" onmouseout="this.style.background='#25D366'">
                📱 Enviar por WhatsApp
            </button>
            <button onclick="vaciarCarritoYCerrar()" style="
                padding: 16px;
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 12px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.3s;
            " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='#e74c3c'">
                🗑️ Vaciar Carrito
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    window.enviarPedidoWhatsApp = function() {
        const nombre = document.getElementById('cliente-nombre')?.value;
        const telefono = document.getElementById('cliente-telefono')?.value;
        const direccion = document.getElementById('cliente-direccion')?.value;
        const notas = document.getElementById('cliente-notas')?.value || '';
        
        if (!nombre || !telefono || !direccion) {
            alert("❌ Por favor completa todos los campos obligatorios");
            return;
        }
        
        const carrito = JSON.parse(localStorage.getItem('berkot_carrito') || '[]');
        const totalGeneral = carrito.reduce((sum, item) => sum + item.total, 0);
        
        let mensaje = "🛍️ *NUEVO PEDIDO - BERKOT*\n\n";
        mensaje += "👤 *Cliente:* " + nombre + "\n";
        mensaje += "📞 *Teléfono:* " + telefono + "\n";
        mensaje += "📍 *Dirección:* " + direccion + "\n\n";
        mensaje += "*🛒 PRODUCTOS:*\n";
        
        carrito.forEach(item => {
            mensaje += `• ${item.nombre}: ${item.cantidad.toFixed(1)} ${item.unidad} x $${item.precio.toFixed(2)} = $${item.total.toFixed(2)}\n`;
        });
        
        mensaje += `\n💰 *TOTAL: $${totalGeneral.toFixed(2)}*`;
        
        if (notas) {
            mensaje += `\n\n📝 *Notas:* ${notas}`;
        }
        
        // NÚMERO CORREGIDO: 5356603249
        const numeroNegocio = "5356603249";
        const url = `https://wa.me/${numeroNegocio}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
        
        document.getElementById('modal-pedido')?.remove();
    };
    
    window.vaciarCarritoYCerrar = function() {
        localStorage.removeItem('berkot_carrito');
        actualizarContadorCarrito();
        document.getElementById('modal-pedido')?.remove();
        alert("✅ Carrito vaciado");
    };
}

// ===== ESCUCHAR FIREBASE =====
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
        
        console.log(`✅ ${window.storeData.products.length} productos sincronizados`);
        mostrarProductosEnPagina();
    }
});

// ===== FUNCIONES ADMIN =====
window.guardarProducto = async function(producto) {
    try {
        const newRef = push(productosRef);
        await set(newRef, {
            name: producto.name,
            basePrice: producto.basePrice,
            unit: producto.unit || 'lb',
            description: producto.description || '',
            minQty: 0.5
        });
        alert("✅ Producto guardado");
        return true;
    } catch (error) {
        alert("❌ Error: " + error.message);
        return false;
    }
};

window.eliminarProducto = async function(id) {
    if (confirm("¿Eliminar producto?")) {
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
    const btnExistente = document.getElementById('btn-admin-berkot');
    if (btnExistente) btnExistente.remove();
    
    const btnAdmin = document.createElement('button');
    btnAdmin.id = 'btn-admin-berkot';
    btnAdmin.innerHTML = '⚙️ Admin';
    btnAdmin.style.cssText = `
        position: fixed;
        bottom: 20px;
        LEFT: 20px;
        padding: 12px 25px;
        background: #FFA000;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 15px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999996;
        box-shadow: 0 4px 15px rgba(255,160,0,0.4);
    `;
    document.body.appendChild(btnAdmin);
    
    const panel = document.createElement('div');
    panel.id = 'panel-admin-berkot';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 450px;
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        z-index: 1000000;
        display: none;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h2 style="color: #FFA000; margin:0;">🔥 Admin</h2>
            <button id="cerrar-panel" style="background:none; border:none; font-size:24px;">&times;</button>
        </div>
        
        <div id="login-section">
            <input type="email" id="admin-email" placeholder="Email" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <input type="password" id="admin-password" placeholder="Contraseña" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <button id="btn-login" style="width:100%; padding:12px; background:#FFA000; color:white; border:none; border-radius:8px;">Entrar</button>
        </div>
        
        <div id="admin-section" style="display:none;">
            <input type="text" id="product-name" placeholder="Nombre" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <input type="number" id="product-price" placeholder="Precio" step="0.01" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
            <select id="product-unit" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;">
                <option value="lb">Libras (lb)</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="unidad">Unidad</option>
            </select>
            <textarea id="product-description" placeholder="Descripción" rows="3" style="width:100%; padding:12px; margin-bottom:10px; border:1px solid #ddd; border-radius:8px;"></textarea>
            <button id="btn-save" style="width:100%; padding:12px; background:#27ae60; color:white; border:none; border-radius:8px;">Guardar</button>
            <button id="btn-logout" style="width:100%; padding:12px; background:#e74c3c; color:white; border:none; border-radius:8px; margin-top:10px;">Salir</button>
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
        await signOut(auth);
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'none';
    };
    
    document.getElementById('btn-save').onclick = async () => {
        const producto = {
            name: document.getElementById('product-name').value,
            basePrice: parseFloat(document.getElementById('product-price').value),
            unit: document.getElementById('product-unit').value,
            description: document.getElementById('product-description').value
        };
        await window.guardarProducto(producto);
        document.getElementById('product-name').value = '';
        document.getElementById('product-price').value = '';
        document.getElementById('product-description').value = '';
    };
}, 1000);

// ===== WHATSAPP FLOTANTE - AHORA EN IZQUIERDA =====
setTimeout(() => {
    const whatsappFlotante = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
    
    if (whatsappFlotante) {
        whatsappFlotante.style.position = 'fixed';
        whatsappFlotante.style.left = '20px';
        whatsappFlotante.style.right = 'auto';
        whatsappFlotante.style.bottom = '80px';
        whatsappFlotante.style.zIndex = '999995';
        whatsappFlotante.style.width = '50px';
        whatsappFlotante.style.height = '50px';
        whatsappFlotante.style.borderRadius = '50%';
        whatsappFlotante.style.boxShadow = '0 4px 15px rgba(37,211,102,0.3)';
        console.log("✅ WhatsApp movido a IZQUIERDA");
    }
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
}, 1000);

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

// ===== INICIALIZAR =====
console.log("✅✅✅ SISTEMA BERKOT - VERSIÓN FINAL CORREGIDA ✅✅✅");
console.log("🔥 Características:");
console.log("   • Sin productos duplicados");
console.log("   • WhatsApp en IZQUIERDA");
console.log("   • Formulario de pedido completo");
console.log("   • Número de teléfono visible: +53 5660 3249"); // CORREGIDO
console.log("   • Admin Panel en IZQUIERDA");
console.log("📍 Base de datos:", firebaseConfig.databaseURL);
