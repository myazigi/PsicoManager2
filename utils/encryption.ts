
// --- Funciones de Utilidad para Criptografía ---

// --- Configuración de Criptografía ---
const SALT_KEY = 'psiqueManager_salt';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-256';
const KEY_DERIVATION_ITERATIONS = 100000; // Estándar recomendado para PBKDF2
const IV_LENGTH = 12; // Longitud en bytes para el IV de AES-GCM (96 bits es lo recomendado)

// --- Funciones Auxiliares para Conversión de Buffers ---

/**
 * Convierte un ArrayBuffer a una cadena Base64.
 * @param buffer El ArrayBuffer a convertir.
 * @returns La cadena en formato Base64.
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Convierte una cadena Base64 a un ArrayBuffer.
 * @param base64 La cadena Base64 a convertir.
 * @returns El ArrayBuffer resultante.
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// --- Lógica Principal de Criptografía ---

/**
 * Obtiene o crea un "salt" (valor aleatorio) para la derivación de la clave.
 * El salt se almacena en localStorage para ser reutilizado. No necesita ser secreto.
 * @returns El salt como un Uint8Array.
 */
function getSalt(): Uint8Array {
  let salt = localStorage.getItem(SALT_KEY);
  if (salt) {
    return new Uint8Array(base64ToBuffer(salt));
  } else {
    const newSalt = window.crypto.getRandomValues(new Uint8Array(16));
    localStorage.setItem(SALT_KEY, bufferToBase64(newSalt));
    return newSalt;
  }
}

/**
 * Deriva una clave de encriptación segura a partir de la contraseña del usuario.
 * Utiliza PBKDF2 para hacer que la derivación sea computacionalmente costosa,
 * protegiendo contra ataques de fuerza bruta.
 * @param password La contraseña del usuario.
 * @returns Una promesa que se resuelve con la CryptoKey derivada.
 */
export async function getEncryptionKey(password: string): Promise<CryptoKey> {
  const salt = getSalt();
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // 1. Importar la contraseña como una clave base (no es una clave de cifrado aún)
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: KEY_DERIVATION_ALGORITHM },
    false,
    ['deriveKey']
  );

  // 2. Derivar la clave de cifrado final usando PBKDF2
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: salt,
      iterations: KEY_DERIVATION_ITERATIONS,
      hash: HASH_ALGORITHM,
    },
    baseKey,
    { name: ENCRYPTION_ALGORITHM, length: 256 }, // Clave AES de 256 bits
    true, // La clave debe ser extraíble para ser usada por otras funciones
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Encripta datos de texto plano usando una CryptoKey.
 * @param plaintext El texto a encriptar.
 * @param key La CryptoKey para el cifrado.
 * @returns Una promesa que se resuelve con los datos encriptados en formato Base64.
 *          El formato de salida es `IV_base64.ciphertext_base64`.
 */
export async function encryptData(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const dataToEncrypt = encoder.encode(plaintext);

  // Generar un Vector de Inicialización (IV) aleatorio para cada operación de cifrado.
  // Es crucial para la seguridad de AES-GCM.
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    dataToEncrypt
  );

  // Concatenar el IV con el texto cifrado para almacenarlos juntos.
  // El IV no es secreto, pero es necesario para el descifrado.
  const combinedBuffer = new Uint8Array(iv.length + encryptedData.byteLength);
  combinedBuffer.set(iv, 0);
  combinedBuffer.set(new Uint8Array(encryptedData), iv.length);

  return bufferToBase64(combinedBuffer.buffer);
}

/**
 * Desencripta datos que fueron cifrados con `encryptData`.
 * @param encryptedBase64 Los datos encriptados en formato Base64.
 * @param key La CryptoKey para el descifrado (debe ser la misma que la de cifrado).
 * @returns Una promesa que se resuelve con el texto plano original.
 */
export async function decryptData(encryptedBase64: string, key: CryptoKey): Promise<string> {
  const combinedBuffer = base64ToBuffer(encryptedBase64);

  // Extraer el IV y el texto cifrado del buffer combinado.
  const iv = combinedBuffer.slice(0, IV_LENGTH);
  const encryptedData = combinedBuffer.slice(IV_LENGTH);

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: ENCRYPTION_ALGORITHM,
      iv: iv,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}
