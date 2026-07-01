import { encryption } from "./EncryptionService";

const original = "Hello CasellaIQ";

const encrypted = encryption.encrypt(original);

const decrypted = encryption.decrypt(encrypted);

console.log("Original :", original);
console.log("Encrypted:", encrypted);
console.log("Decrypted:", decrypted);
console.log("Success:", original === decrypted);