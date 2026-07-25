const encryptedPrefix = "enc:v1:";

function toBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(value) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function getVaultKey(pin, salt) {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 180000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptSecret(pin, secret) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getVaultKey(pin, salt);
  const encoded = new TextEncoder().encode(JSON.stringify({
    login: secret.login,
    password_value: secret.password_value,
    url: secret.url,
    notes: secret.notes,
  }));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  return `${encryptedPrefix}${toBase64(new TextEncoder().encode(JSON.stringify({
    salt: toBase64(salt),
    iv: toBase64(iv),
    cipher: toBase64(cipher),
  })))}`;
}

export async function decryptSecret(pin, item) {
  if (!item.password_value?.startsWith(encryptedPrefix)) {
    return {
      login: item.login || "",
      password_value: item.password_value || "",
      url: item.url || "",
      notes: item.notes || "",
      isLegacy: true,
    };
  }

  const payload = JSON.parse(new TextDecoder().decode(fromBase64(item.password_value.slice(encryptedPrefix.length))));
  const salt = fromBase64(payload.salt);
  const iv = fromBase64(payload.iv);
  const cipher = fromBase64(payload.cipher);
  const key = await getVaultKey(pin, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return JSON.parse(new TextDecoder().decode(plain));
}
