// ========== BERKOT FIREBASE - VERSIÓN DE EMERGENCIA ==========
// ========== LOS PRODUCTOS APARECERÁN SÍ O SÍ ==========

console.log("🔥 BERKOT - MODO EMERGENCIA");

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
import { getDatabase, ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// ===== INICIALIZAR =====
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
console.log("✅ Firebase OK");

// ===== VARIABLES =====
window.productos = [];
let carrito = [];

// ===== 1. ELIMINAR TODO Y EMPEZAR DE CERO =====
function resetTotal() {
    console.log("🧹 Reset total...");
    
    // 1. Eliminar TODOS los contenedores de productos
    document.querySelectorAll('div').forEach(el => {
        if (el.id?.includes('producto') || el.className?.includes('producto') || 
            el.id?.includes('Producto') || el.className?.includes('Producto') ||
            el.id === 'productos-berkot' || el.id === 'contenedor-productos') {
            el.remove();
        }
    });
    
    // 2. Eliminar botones flotantes
    document.querySelectorAll('#btn-carrito, #btn-admin, .carrito-flotante, .admin-flotante').forEach(el => el.remove());
}

// ===== 2. CREAR CONTENEDOR EN EL BODY DIRECTAMENTE =====
function crearContenedor() {
    const contenedor = document.createElement('div');
    contenedor.id = 'productos-berkot';
    contenedor.style.cssText = `
        max-width: 1200px;
        margin: 20px auto;
        padding: 20px;
        font-family: Arial, sans-serif;
        border: 2px solid red;
        background: white;
        position: relative;
        z-index: 1;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    `;
    
    // Agregar AL PRINCIPIO del body
    document.body.insertBefore(contenedor, document.body.firstChild);
    console.log("✅ Contenedor creado con borde rojo (visible)");
    return contenedor;
}

// ===== 3. MOSTRAR PRODUCTOS - FUERZA BRUTA =====
function mostrarProductos() {
    console.log("🔄 Mostrando productos...");
    
    // Crear contenedor NUEVO cada vez
    const contenedor = crearContenedor();
    contenedor.innerHTML = '<h3 style="text-align: center;">Cargando productos...</h3>';
    
    if (!window.productos || window.productos.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #fff3cd; border-radius: 8px;">
                <h2 style="color: #856404;">📭 No hay productos</h2>
                <p style="font-size: 16px;">Usa el botón ⚙️ Admin abajo a la izquierda para agregar productos</p>
                <p style="color: #666; margin-top: 20px;">Firebase conectado: ✅</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <h2 style="text-align: center; color: #333; margin-bottom: 30px;">
            🛍️ Nuestros Productos (${window.productos.length})
        </h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 25px;">
    `;
    
    window.productos.forEach((p, index) => {
        const precio = p.basePrice || 0;
        const unidad = p.unit || 'lb';
        const min = p.minQty || (unidad === 'unidad' ? 1 : 0.5);
        
        html += `
            <div style="
                border: 2px solid #27ae60;
                border-radius: 12px;
                padding: 20px;
                background: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            ">
                <h3 style="margin: 0 0 10px; color: #333;">${p.name || 'Producto'}</h3>
                <p style="font-size: 28px; color: #27ae60; font-weight: bold; margin: 10px 0;">
                    $${precio.toFixed(2)} <span style="font-size: 16px; color: #666;">/${unidad}</span>
                </p>
                
                <div style="margin: 15px 0;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cantidad:</label>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <button onclick="window.cambiarCantidad('${p.id}', -0.5, ${min})" style="
                            width: 40px; height: 40px;
                            background: #f0f0f0;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            font-size: 20px;
                            font-weight: bold;
                            cursor: pointer;
                        ">−</button>
                        
                        <span id="cant-${p.id}" style="
                            width: 80px;
                            height: 40px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: white;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            font-size: 18px;
                            font-weight: bold;
                        ">${min.toFixed(1)}</span>
                        
                        <button onclick="window.cambiarCantidad('${p.id}', 0.5, ${min})" style="
                            width: 40px; height: 40px;
                            background: #f0f0f0;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            font-size: 20px;
                            font-weight: bold;
                            cursor: pointer;
                        ">+</button>
                    </div>
                </div>
                
                <button onclick="window.comprarProducto('${p.id}', ${precio}, '${unidad}')" style="
                    width: 100%;
                    padding: 14px;
                    background: #27ae60;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 10px;
                ">
                    🛒 Agregar al Carrito
                </button>
            </div>
        `;
    });
    
    html += `</div>`;
    contenedor.innerHTML = html;
    console.log(`✅ ${window.productos.length} productos mostrados en contenedor con borde rojo`);
}

// ===== 4. FUNCIONES DE CANTIDAD =====
window.cambiarCantidad = function(id, delta, min) {
    const span = document.getElementById(`cant-${id}`);
    if (span) {
        let valor = parseFloat(span.textContent) || min;
        valor = Math.max(min, valor + delta);
        valor = Math.round(valor * 10) / 10;
        span.textContent = valor.toFixed(1);
    }
};

// ===== 5. COMPRAR =====
window.comprarProducto = function(id, precio, unidad) {
    const span = document.getElementById(`cant-${id}`);
    const cantidad = span ? parseFloat(span.textContent) : 0.5;
    const producto = window.productos.find(p => p.id === id);
    
    if (!producto) return;
    
    carrito.push({
        id: id,
        nombre: producto.name,
        precio: precio,
        unidad: unidad,
        cantidad: cantidad,
        total: precio * cantidad
    });
    
    localStorage.setItem('berkot_carrito', JSON.stringify(carrito));
    alert(`✅ ${cantidad} ${unidad} agregado al carrito`);
    console.log("Carrito:", carrito);
};

// ===== 6. BOTÓN ADMIN SIMPLE =====
function crearBotonAdmin() {
    const btn = document.createElement('button');
    btn.id = 'btn-admin';
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
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    btn.onclick = () => {
        const pass = prompt("Contraseña admin:");
        if (pass !== "Berkot2026Admin") {
            alert("❌ Incorrecta");
            return;
        }
        
        const nombre = prompt("Nombre del producto:");
        if (!nombre) return;
        
        const precio = parseFloat(prompt("Precio:"));
        if (!precio || precio <= 0) return;
        
        const unidad = prompt("Unidad (lb/kg/unidad):") || "lb";
        
        const newRef = push(ref(db, 'productos'));
        set(newRef, {
            name: nombre,
            basePrice: precio,
            unit: unidad,
            minQty: unidad === 'unidad' ? 1 : 0.5,
            description: ""
        }).then(() => {
            alert("✅ Producto agregado");
        });
    };
    
    document.body.appendChild(btn);
}

// ===== 7. BOTÓN CARRITO SIMPLE =====
function crearBotonCarrito() {
    const btn = document.createElement('button');
    btn.id = 'btn-carrito';
    btn.innerHTML = '🛒 Ver Carrito';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
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
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    btn.onclick = () => {
        if (carrito.length === 0) {
            alert("🛒 Carrito vacío");
            return;
        }
        
        let msg = "🛍️ MI CARRITO:\n\n";
        let total = 0;
        carrito.forEach((item, i) => {
            msg += `${i+1}. ${item.nombre}: ${item.cantidad.toFixed(1)} ${item.unidad} = $${item.total.toFixed(2)}\n`;
            total += item.total;
        });
        msg += `\n💰 TOTAL: $${total.toFixed(2)}`;
        alert(msg);
    };
    
    document.body.appendChild(btn);
}

// ===== 8. WHATSAPP =====
function arreglarWhatsApp() {
    setTimeout(() => {
        const wa = document.querySelector('a[href*="wa.me"], a[href*="whatsapp"]');
        if (wa) {
            wa.style.position = 'fixed';
            wa.style.left = '20px';
            wa.style.bottom = '90px';
            wa.style.zIndex = '999990';
        }
    }, 1000);
}

// ===== 9. FIREBASE LISTENER - VERSIÓN SIMPLE =====
const productosRef = ref(db, 'productos');
onValue(productosRef, (snapshot) => {
    const data = snapshot.val();
    console.log("📦 Datos de Firebase:", data);
    
    if (data) {
        window.productos = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        console.log(`✅ ${window.productos.length} productos cargados`);
        console.log("📋 Productos:", window.productos.map(p => p.name).join(', '));
        
        // FORZAR visualización
        resetTotal();
        mostrarProductos();
    } else {
        console.log("⚠️ No hay productos en Firebase");
        resetTotal();
        const contenedor = crearContenedor();
        contenedor.innerHTML = `
            <div style="text-align: center; padding: 40px; background: #ffe6e6; border-radius: 8px;">
                <h2>📭 No hay productos en Firebase</h2>
                <p>Usa el botón Admin ⚙️ para agregar productos</p>
            </div>
        `;
    }
});

// ===== 10. INICIAR =====
function iniciar() {
    console.log("🚀 Iniciando sistema de emergencia...");
    
    // Eliminar todo y empezar de cero
    resetTotal();
    
    // Crear botones
    crearBotonAdmin();
    crearBotonCarrito();
    arreglarWhatsApp();
    
    console.log("✅ Sistema listo - Esperando productos...");
}

// ===== EJECUTAR =====
iniciar();

// ===== EXPORTAR =====
window.comprarProducto = comprarProducto;
window.cambiarCantidad = cambiarCantidad;
