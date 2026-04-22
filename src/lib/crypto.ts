/**
 * Cryptographic utility for securing local EMR data and physical backups.
 * Utilizes the Web Crypto API for zero-dependency AES-GCM encryption.
 */

// Generate a random 256-bit AES master key
export async function generateMasterKey(): Promise<string> {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
}

// Retrieve or generate the device's master key
export async function getOrGenerateMasterKey(): Promise<string> {
  let key = localStorage.getItem('emr_master_key');
  if (!key) {
    key = await generateMasterKey();
    localStorage.setItem('emr_master_key', key);
    console.warn("Generated new EMR Master Key. Do not lose this if encrypting backups.");
  }
  return key;
}

// Encrypt a string payload with the AES-GCM master key
export async function encryptData(plaintext: string, base64Key: string): Promise<string> {
  const keyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  const key = await window.crypto.subtle.importKey(
    'raw', keyBuffer, { name: 'AES-GCM' }, false, ['encrypt']
  );
  
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, 
    key, 
    encoded
  );

  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

// Decrypt a base64 payload payload with the AES-GCM master key
export async function decryptData(ciphertextBase64: string, base64Key: string): Promise<string> {
   const keyBuffer = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
   const key = await window.crypto.subtle.importKey(
     'raw', keyBuffer, { name: 'AES-GCM' }, false, ['decrypt']
   );
   
   const combined = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));
   const iv = combined.slice(0, 12);
   const data = combined.slice(12);
   
   const decrypted = await window.crypto.subtle.decrypt(
     { name: 'AES-GCM', iv }, 
     key, 
     data
   );
   
   return new TextDecoder().decode(decrypted);
}
