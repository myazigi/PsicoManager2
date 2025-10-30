// Simulación de un servicio de envío de emails.

interface EmailResponse {
    success: boolean;
    message: string;
}

/**
 * Simula el envío de un correo electrónico.
 * En una aplicación real, esto haría una llamada a una API de backend (p. ej., SendGrid, Mailgun).
 * @param to - El email del destinatario.
 * @param subject - El asunto del email.
 * @param body - El cuerpo del email.
 * @returns Una promesa que se resuelve con un objeto de respuesta.
 */
export const sendEmail = (to: string, subject: string, body: string): Promise<EmailResponse> => {
    console.log('--- SIMULANDO ENVÍO DE EMAIL ---');
    console.log(`Para: ${to}`);
    console.log(`Asunto: ${subject}`);
    console.log(`Cuerpo: ${body}`);
    console.log('---------------------------------');

    return new Promise((resolve) => {
        // Simular un pequeño retraso de red
        setTimeout(() => {
            if (!to || !subject || !body) {
                resolve({ success: false, message: 'Faltan datos para el envío.' });
            } else if (!to.includes('@')) {
                 resolve({ success: false, message: 'Dirección de email inválida.' });
            } else {
                resolve({ success: true, message: `Email enviado correctamente a ${to}` });
            }
        }, 500);
    });
};
