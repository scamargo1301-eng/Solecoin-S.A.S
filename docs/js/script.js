
document.addEventListener("DOMContentLoaded", () => {

    const formulario = document.querySelector(".contact-form");

    if (!formulario) return;

    const boton = formulario.querySelector('button[type="submit"]');

    // Crear espacio para mostrar el resultado
    const estado = document.createElement("p");
    estado.setAttribute("role", "status");
    estado.setAttribute("aria-live", "polite");
    estado.className = "form-status";

    formulario.appendChild(estado);

    formulario.addEventListener("submit", async (event) => {

        event.preventDefault();

        const datos = {
            nombre: formulario.elements.nombre.value.trim(),
            empresa: formulario.elements.empresa.value.trim(),
            email: formulario.elements.email.value.trim(),
            mensaje: formulario.elements.mensaje.value.trim()
        };

        boton.disabled = true;
        boton.textContent = "Enviando...";
        estado.textContent = "";

        try {

            const respuesta = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();

            if (!respuesta.ok) {
                throw new Error(resultado.message);
            }

            estado.textContent = resultado.message;
            estado.style.color = "green";

            formulario.reset();

        } catch (error) {

            console.error("Error:", error);

            estado.textContent =
                error.message || "No fue posible enviar tu solicitud.";

            estado.style.color = "red";

        } finally {

            boton.disabled = false;
            boton.textContent = "Enviar solicitud";

        }

    });

});
