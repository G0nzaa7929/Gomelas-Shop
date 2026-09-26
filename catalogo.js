// Aseguramos que el carrito exista globalmente una sola vez
if (typeof carrito === 'undefined') {
    var carrito = [];
}

// 1. ESCUCHAR CUANDO SE AGREGA UN PRODUCTO AL CARRITO (INTEGRADO CON GIRO 3D INDEPENDIENTE)
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('btn-agg')) {
        
        // Buscamos la tarjeta interna específica del producto presionado
        const tarjetaInterna = e.target.closest('.tarjeta-interna');
        const contenedor = e.target.closest('.producto-tarjeta'); 
        if (!contenedor) return;

        // Si la tarjeta tiene la estructura 3D, le agregamos la clase para que gire
        if (tarjetaInterna) {
            tarjetaInterna.classList.add('volteada');
        }

        let precioSucio = contenedor.dataset.precio || contenedor.dataset.price || "0";
        let precioLimpio = precioSucio.replace('\$', '').trim();

        const selectTalla = contenedor.querySelector('.prod-talla');
        const selectColor = contenedor.querySelector('.prod-color');

        const producto = {
            id: contenedor.dataset.id || "0",
            nombre: contenedor.dataset.nombre || "Producto",
            talla: selectTalla ? selectTalla.value : "N/A",
            color: selectColor ? selectColor.value : "N/A",
            precio: parseFloat(precioLimpio) || 0,
            cantidad: 1
        };

        carrito.push(producto);

        // Esperamos exactamente 600ms (lo que dura la vuelta del CSS) para actualizar la interfaz
        setTimeout(function() {
            actualizarTotalPagina();
        }, 600); 
    }
});

// 2. FUNCIÓN PARA EL BOTÓN "VOLVER" DE LA CARA TRASERA
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('btn-regresar')) {
        const tarjetaInterna = e.target.closest('.tarjeta-interna');
        if (tarjetaInterna) {
            // Le quitamos la clase y la tarjeta regresa a mostrar el producto original
            tarjetaInterna.classList.remove('volteada');
        }
    }
});

// 3. ACTUALIZAR PRECIO EN PANTALLA AL CAMBIAR DE TALLA (BRASIER Y ELEMENTOS CON SELECTOR-PRECIO)
document.addEventListener('change', function(e) {
    if (e.target && e.target.classList.contains('selector-precio')) {
        const tarjeta = e.target.closest('.producto-tarjeta');
        const opcionSeleccionada = e.target.options[e.target.selectedIndex];

        let nuevoPrecioSucio = opcionSeleccionada.dataset.precio || opcionSeleccionada.dataset.price;
        if (tarjeta && nuevoPrecioSucio) {
            let nuevoPrecioLimpio = nuevoPrecioSucio.replace('\$', '').trim();

            tarjeta.dataset.precio = nuevoPrecioLimpio;
            tarjeta.dataset.price = nuevoPrecioLimpio;

            // Busca tanto tu clase nueva como la anterior para evitar fallos
            const precioTxt = tarjeta.querySelector('.producto-precio-visible') || tarjeta.querySelector('.precio');
            if (precioTxt) {
                precioTxt.innerText = `$${parseFloat(nuevoPrecioLimpio).toFixed(2)}`;
            }
        }
    }
});
// 4. ACTUALIZAR LA LISTA VISIBLE Y EL TOTAL EN LA PÁGINA
function actualizarTotalPagina() {
    let total = 0;
    const listaHtml = document.getElementById('lista-carrito');
    const totalHtml = document.getElementById('total-precio');
    
    if (!listaHtml || !totalHtml) return;

    // Limpiamos la lista visual antes de redibujarla
    listaHtml.innerHTML = "";

    // Agrupamos los productos idénticos para mostrarlos ordenados en el widget
    const productosAgrupados = {};
    carrito.forEach((data) => {
        const claveUnica = `${data.nombre}-${data.talla}-${data.color}`;
        if (productosAgrupados[claveUnica]) {
            productosAgrupados[claveUnica].cantidad += 1;
        } else {
            productosAgrupados[claveUnica] = { ...data };
        }
    });

    // Renderizamos cada producto en el carrito de la página
    for (const key in productosAgrupados) {
        const item = productosAgrupados[key];
        const subtotalItem = item.precio * item.cantidad;
        total += subtotalItem;

        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${item.nombre}</strong><br>
                <small>Talla: ${item.talla} | Color: ${item.color}</small>
            </div>
            <span>${item.cantidad}x $${item.precio.toFixed(2)}</span>
        `;
        listaHtml.appendChild(li);
    }

    // Actualizamos el precio final en pantalla
    totalHtml.innerText = total.toFixed(2);
}

// 5. ENVIAR EL PEDIDO DETALLADO Y SUMADO A WHATSAPP
function enviarPedidoWhatsapp() {
    const telefonoWhatsapp = "584244292903";
    let mensaje = "¡Hola Gomelas Shop! 🛍️ Quiero realizar el siguiente pedido de lencería:\n\n";
    let totalCompra = 0;

    if (carrito.length === 0) {
        alert("⚠️ Tu carrito está vacío. Agrega algunos productos antes de pagar.");
        return;
    }

    // Agrupamos los productos idénticos para el mensaje de texto
    const productosAgrupados = {};
    carrito.forEach((data) => {
        const claveUnica = `${data.nombre}-${data.talla}-${data.color}`;
        if (productosAgrupados[claveUnica]) {
            productosAgrupados[claveUnica].cantidad += 1;
        } else {
            productosAgrupados[claveUnica] = { ...data };
        }
    });

    // Construimos el bloque de texto con formato para WhatsApp
    for (const key in productosAgrupados) {
        const item = productosAgrupados[key];
        const subtotalItem = item.precio * item.cantidad;
        totalCompra += subtotalItem;

        mensaje += `▪️ *${item.nombre}*\n`;
        mensaje += `   Talla: ${item.talla} | Color: ${item.color}\n`;
        mensaje += `   Cantidad: ${item.cantidad} x $${item.precio.toFixed(2)} = *$${subtotalItem.toFixed(2)}*\n\n`;
    }

    mensaje += `🏁 *Total Neto a Pagar: $${totalCompra.toFixed(2)}*`;

    // Codificamos el texto para que la URL lo acepte sin romperse
    const mensajeUrl = encodeURIComponent(mensaje);
    
    // Generamos el enlace universal que abre tanto en PC como en móviles
    const urlWhatsapp = `https://whatsapp.com/584244292903&text=${mensajeUrl}`;
    
    // Abrimos WhatsApp en una pestaña nueva
    window.open(urlWhatsapp, '_blank');
}
