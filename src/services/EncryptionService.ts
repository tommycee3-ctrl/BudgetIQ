import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import crypto from "crypto";

const algorithm = "aes-256-gcm";

const keyHex = process.env.MASTER_ENCRYPTION_KEY;

if (!keyHex) {
    throw new Error("MASTER_ENCRYPTION_KEY is missing from .env");
}

const key = Buffer.from(keyHex, "hex");

if (key.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY must be 32 bytes (64 hex characters).");
}

export interface EncryptedValue {
    iv: string;
    tag: string;
    content: string;
}

export class EncryptionService {

    encrypt(value: string): string {

        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(
            algorithm,
            key,
            iv
        );

        const encrypted = Buffer.concat([
            cipher.update(value, "utf8"),
            cipher.final()
        ]);

        const tag = cipher.getAuthTag();

        const payload: EncryptedValue = {
            iv: iv.toString("hex"),
            tag: tag.toString("hex"),
            content: encrypted.toString("hex")
        };

        return JSON.stringify(payload);

    }

    decrypt(payload: string): string {

        const parsed: EncryptedValue = JSON.parse(payload);

        const decipher = crypto.createDecipheriv(
            algorithm,
            key,
            Buffer.from(parsed.iv, "hex")
        );

        decipher.setAuthTag(
            Buffer.from(parsed.tag, "hex")
        );

        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(parsed.content, "hex")),
            decipher.final()
        ]);

        return decrypted.toString("utf8");

    }

}

export const encryption = new EncryptionService();