// ========== BERKOT FIREBASE - VERSIÓN CORREGIDA Y OPTIMIZADA ==========
// ========== CON CARRITO ACUMULATIVO Y SIN DUPLICADOS ==========

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
import { getDatabase, ref, onValue, push, set, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ===== INICIALIZAR FIREBASE =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("✅ Firebase conectado");

// ===== VARIABLES GLOBALES =====
window.productos = [];
let carrito = [];

// ===== CARGAR CARRITO DESDE LOCALSTORAGE =====
function cargarCarrito() {
    const carritoGuardado = localStorage.getItem('berkot_carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        console.log(`🛒 Carrito cargado: ${carrito.length} productos`);
    } else {
        carrito = [];
    }
    actualizarContadorCarrito();
    actualizarVistaCarrito();
}

// ===== GUARDAR CARRITO EN LOCALSTORAGE =====
function guardarCarrito() {
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
    actualizarVistaCarrito();
}

// ===== ACTUALIZAR CONTADOR =====
function actualizarContadorCarrito() {
    const contador = document.getElementById('contador-carrito');
    if (contador) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        contador.textContent = totalItems.toFixed(1);
    }
}

// ===== ACTUALIZAR VISTA DEL CARRITO =====
function actualizarVistaCarrito() {
    const totalElement = document.querySelector('.cart-total, [class*="total"], #total-carrito');
    if (totalElement) {
        const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        totalElement.textContent = `$${total.toFixed(2)}`;
    }
}

// ===== ELIMINAR CONTENEDORES DUPLICADOS =====
function eliminarContenedoresDuplicados() {
    // Buscar TODOS los contenedores de productos
    const contenedores = document.querySelectorAll(
        '#productos-berkot, .productos, .products, ' +
        '[class*="producto"], [id*="producto"], ' +
        '[class*="product"], [id*="product"], ' +
        '#contenedor-productos-berkot'
    );
    
    // Si hay MÁS DE UNO, eliminar todos excepto el PRIMERO
    if (contenedores.length > 1) {
        console.log(`🗑️ Eliminando ${contenedores.length - 1} contenedores duplicados...`);
        for (let i = 1; i < contenedores.length; i++) {
            contenedores[i].remove();
        }
    }
    
    // Devolver el primer contenedor o null
    return contenedores[0] || null;
}

// ===== CREAR CONTENEDOR DE PRODUCTOS =====
function crearContenedorProductos() {
    // Primero eliminar duplicados
    let contenedor = eliminarContenedoresDuplicados();
    
    // Si no hay contenedor, crear uno nuevo
    if (!contenedor) {
        console.log("📦 Creando nuevo contenedor de productos...");
        contenedor = document.createElement('div');
        contenedor.id = 'productos-berkot';
        contenedor.style.cssText = `
            max-width: 1200px;
            margin: 20px auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        `;
        
        // Insertar al principio del body
        const body = document.body;
        if (body.firstChild) {
            body.insertBefore(contenedor, body.firstChild);
        } else {
            body.appendChild(contenedor);
        }
        console.log("✅ Contenedor creado");
    }
    
    return contenedor;
}

// ===== MOSTRAR PRODUCTOS =====
function mostrarProductos() {
    const contenedor = crearContenedorProductos();
    if (!contenedor) return;
    
    // LIMPIAR completamente el contenedor
    contenedor.innerHTML = '';
    
    if (!window.productos || window.productos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 12px;">
                <span style="font-size: 48px;">🛒</span>
                <h3 style="margin: 20px 0 10px;">No hay productos disponibles</h3>
                <p style="color: #666;">Agrega productos desde el panel de administración</p>
            </div>
        `;
        return;
    }
    
    // GENERAR HTML
    let html = `
        <h2 style="text-align: center; margin: 20px 0 30px; color: #333; font-size: 2em;">
            🛍️ Nuestros Productos
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px;">
    `;
    
    window.productos.forEach(p => {
        const unidad = p.unit || 'lb';
        const paso = unidad === 'unidad' ? 1 : 0.5;
        const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        
        html += `
            <div class="producto-${p.id}" style="
                border: 1px solid #e0e0e0;
                border-radius: 16px;
                padding: 20px;
                background: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            ">
                <h3 style="margin: 0 0 10px; color: #333; font-size: 1.3em;">${p.name || 'Producto'}</h3>
                <div style="font-size: 28px; color: #27ae60; font-weight: bold; margin: 10px 0;">
                    $${(p.basePrice || 0).toFixed(2)}
                    <span style="font-size: 14px; color: #666;">/${unidad}</span>
                </div>
                ${p.description ? `<p style="color: #666; margin: 10px 0;">${p.description}</p>` : ''}
                
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 15px 0;
                    padding: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                ">
                    <span style="font-weight: bold;">Cantidad:</span>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button onclick="disminuirCantidad('${p.id}', ${min}, ${paso})" style="
                            width: 32px; height: 32px;
                            background: white;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 18px;
                            cursor: pointer;
                        ">−</button>
                        <input type="number" id="cant-${p.id}" value="${min}" min="${min}" step="${paso}" style="
                            width: 70px; height: 36px;
                            text-align: center;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 16px;
                        " onchange="actualizarTotal('${p.id}', ${p.basePrice})">
                        <button onclick="aumentarCantidad('${p.id}', ${paso})" style="
                            width: 32px; height: 32px;
                            background: white;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            font-size: 18px;
                            cursor: pointer;
                        ">+</button>
                    </div>
                    <span id="total-${p.id}" style="color: #27ae60; font-weight: bold;">
                        $${((p.basePrice || 0) * min).toFixed(2)}
                    </span>
                </div>
                
                <button onclick="agregarAlCarrito('${p.id}')" style="
                    width: 100%;
                    padding: 12px;
                    background: #27ae60;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.3s;
                ">🛒 Agregar al Carrito</button>
            </div>
        `;
    });
    
    html += `</div>`;
    contenedor.innerHTML = html;
    console.log(`✅ ${window.productos.length} productos mostrados`);
}

// ===== FUNCIONES DE CANTIDAD =====
window.disminuirCantidad = function(id, min, paso) {
    const input = document.getElementById(`cant-${id}`);
    if (input) {
        let valor = parseFloat(input.value) || min;
        valor = Math.max(min, valor - paso);
        valor = Math.round(valor * 10) / 10;
        input.value = valor;
        actualizarTotal(id);
    }
};

window.aumentarCantidad = function(id, paso) {
    const input = document.getElementById(`cant-${id}`);
    if (input) {
        let valor = parseFloat(input.value) || 0.5;
        valor = valor + paso;
        valor = Math.round(valor * 10) / 10;
        input.value = valor;
        actualizarTotal(id);
    }
};

window.actualizarTotal = function(id) {
    const input = document.getElementById(`cant-${id}`);
    const totalSpan = document.getElementById(`total-${id}`);
    const producto = window.productos.find(p => p.id === id);
    
    if (input && totalSpan && producto) {
        const cantidad = parseFloat(input.value) || 0;
        const total = (producto.basePrice || 0) * cantidad;
        totalSpan.textContent = `$${total.toFixed(2)}`;
    }
};

// ===== AGREGAR AL CARRITO (ACUMULATIVO) =====
window.agregarAlCarrito = function(id) {
    const producto = window.productos.find(p => p.id === id);
    if (!producto) return;
    
    const input = document.getElementById(`cant-${id}`);
    const cantidad = input ? parseFloat(input.value) : (producto.minQty || 0.5);
    
    // Buscar si el producto ya existe en el carrito
    const existente = carrito.findIndex(item => item.id === id);
    
    if (existente !== -1) {
        // SI EXISTE: SUMAR la cantidad
        carrito[existente].cantidad += cantidad;
        carrito[existente].total = carrito[existente].precio * carrito[existente].cantidad;
        console.log(`➕ Sumado: +${cantidad} ${producto.unit} a ${producto.name}`);
    } else {
        // SI NO EXISTE: Agregar nuevo
        carrito.push({
            id: producto.id,
            nombre: producto.name,
            precio: producto.basePrice,
            unidad: producto.unit || 'lb',
            cantidad: cantidad,
            total: producto.basePrice * cantidad
        });
        console.log(`🆕 Nuevo: ${cantidad} ${producto.unit} de ${producto.name}`);
    }
    
    // Guardar y actualizar
    guardarCarrito();
    
    // Notificación
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
                <strong>${cantidad.toFixed(1)} ${producto.unit || 'lb'} de ${producto.name}</strong>
                <br><small>Agregado al carrito</small>
            </div>
        </div>
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
};

// ===== VER CARRITO =====
window.verCarrito = function() {
    if (carrito.length === 0) {
        alert("🛒 Tu carrito está vacío");
        return;
    }
    
    let mensaje = "🛍️ MI CARRITO:\n\n";
    let total = 0;
    
    carrito.forEach((item, i) => {
        mensaje += `${i+1}. ${item.nombre}\n`;
        mensaje += `   ${item.cantidad.toFixed(1)} ${item.unidad} x $${item.precio.toFixed(2)} = $${item.total.toFixed(2)}\n\n`;
        total += item.total;
    });
    
    mensaje += `💰 TOTAL: $${total.toFixed(2)}\n\n`;
    mensaje += "¿Vaciar carrito?";
    
    if (confirm(mensaje)) {
        carrito = [];
        guardarCarrito();
        alert("✅ Carrito vaciado");
    }
};

// ===== BOTÓN CARRITO =====
function crearBotonCarrito() {
    if (document.getElementById('btn-carrito-berkot')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btn-carrito-berkot';
    btn.innerHTML = '🛒 <span id="contador-carrito" style="margin-left: 5px;">0</span>';
    btn.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        padding: 12px 25px;
        background: #3498db;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 15px rgba(52,152,219,0.3);
        transition: transform 0.3s;
    `;
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = window.verCarrito;
    
    document.body.appendChild(btn);
    actualizarContadorCarrito();
}

// ===== BOTÓN ADMIN =====
function crearBotonAdmin() {
    if (document.getElementById('btn-admin-berkot')) return;
    
    const btn = document.createElement('button');
    btn.id = 'btn-admin-berkot';
    btn.innerHTML = '⚙️ Admin';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 12px 25px;
        background: #FFA000;
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 15px rgba(255,160,0,0.3);
        transition: transform 0.3s;
    `;
    btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
    btn.onmouseout = () => btn.style.transform = 'scale(1)';
    btn.onclick = mostrarPanelAdmin;
    
    document.body.appendChild(btn);
}

// ===== PANEL ADMIN =====
window.mostrarPanelAdmin = function() {
    const pass = prompt("🔐 Contraseña de administrador:");
    if (pass !== "Berkot2026Admin") {
        alert("❌ Contraseña incorrecta");
        return;
    }
    
    const nombre = prompt("📦 Nombre del producto:");
    if (!nombre) return;
    
    const precio = parseFloat(prompt("💰 Precio:"));
    if (!precio || precio <= 0) return;
    
    const unidad = prompt("⚖️ Unidad (lb/kg/unidad):") || "lb";
    const minQty = unidad === 'unidad' ? 1 : 0.5;
    
    const newRef = push(ref(db, 'productos'));
    set(newRef, {
        name: nombre,
        basePrice: precio,
        unit: unidad,
        minQty: minQty,
        description: ""
    }).then(() => {
        alert("✅ Producto agregado correctamente");
    }).catch(error => {
        alert("❌ Error: " + error.message);
    });
};

// ===== WHATSAPP =====
function configurarWhatsApp() {
    setTimeout(() => {
        const whatsapp = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
        if (whatsapp) {
            whatsapp.style.position = 'fixed';
            whatsapp.style.left = '20px';
            whatsapp.style.right = 'auto';
            whatsapp.style.bottom = '90px';
            whatsapp.style.zIndex = '999990';
            whatsapp.style.width = '50px';
            whatsapp.style.height = '50px';
            console.log("✅ WhatsApp configurado en izquierda");
        }
    }, 2000);
}

// ===== ESTILOS GLOBALES =====
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
        #productos-berkot {
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(estilos);
}

// ===== FIREBASE LISTENER =====
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
            minQty: data[key].minQty || (data[key].unit === 'unidad' ? 1 : 0.5)
        }));
        
        console.log(`✅ ${window.productos.length} productos cargados de Firebase`);
        mostrarProductos();
    }
});

// ===== INICIALIZACIÓN =====
function inicializar() {
    console.log("🚀 Inicializando sistema...");
    
    // Cargar carrito primero
    cargarCarrito();
    
    // Crear elementos
    agregarEstilos();
    crearBotonCarrito();
    crearBotonAdmin();
    configurarWhatsApp();
    
    console.log("✅ Sistema inicializado correctamente");
}

// ===== EJECUTAR =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializar);
} else {
    inicializar();
}

// ===== EXPORTAR FUNCIONES =====
window.disminuirCantidad = disminuirCantidad;
window.aumentarCantidad = aumentarCantidad;
window.actualizarTotal = actualizarTotal;
window.agregarAlCarrito = agregarAlCarrito;
window.verCarrito = verCarrito;
window.mostrarPanelAdmin = mostrarPanelAdmin;
