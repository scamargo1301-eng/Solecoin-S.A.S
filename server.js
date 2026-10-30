
require("dotenv").config();

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

app.post("/api/contact", async (req, res) => {
    try {
        const { nombre, empresa, email, mensaje } = req.body;

        if (!nombre || !email || !mensaje) {
            return res.status(400).json({
                success: false,
                message: "Completa los campos obligatorios."
            });
        }

        const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!correoValido) {
            return res.status(400).json({
                success: false,
                message: "El correo electrónico no es válido."
            });
        }

        const nombreSeguro = escapeHtml(nombre);
        const empresaSegura = escapeHtml(empresa || "No especificada");
        const emailSeguro = escapeHtml(email);
        const mensajeSeguro = escapeHtml(mensaje).replace(/\n/g, "<br>");

        const resultado = await transporter.sendMail({
    from: `"${nombre} - SOLECOIN Web" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO,
    replyTo: {
        name: nombre,
        address: email
    },
    subject: "Nueva solicitud de contacto desde SOLECOIN",
    text: `Nueva solicitud de contacto desde SOLECOIN
Nombre: ${nombre}
Empresa: ${empresa || "No especificada"}
Correo: ${email}

Mensaje:
${mensaje}`,
            html: `
                <h2>Nueva solicitud de contacto</h2>
                <p><strong>Nombre:</strong> ${nombreSeguro}</p>
                <p><strong>Empresa:</strong> ${empresaSegura}</p>
                <p><strong>Correo:</strong> ${emailSeguro}</p>
                <p><strong>Mensaje:</strong><br>${mensajeSeguro}</p>
                <hr>
                <p>Solicitud recibida desde el sitio web de SOLECOIN S.A.S.</p>
            `
        });

        console.log("Correo aceptado por Gmail:", resultado.messageId);

        return res.status(200).json({
            success: true,
            message: "¡Tu solicitud fue enviada correctamente!"
        });

    } catch (error) {
        console.error("Error al enviar correo:", error);

        return res.status(500).json({
            success: false,
            message: "No pudimos enviar tu solicitud. Inténtalo nuevamente."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor SOLECOIN funcionando en http://localhost:${PORT}`);
});
