import dotenv from "dotenv";

dotenv.config();

export class SimpleFINService {
  private readonly accessUrl: string;

  constructor() {
    const token = process.env.SIMPLEFIN_ACCESS_URL;

    if (!token) {
      throw new Error("Missing SIMPLEFIN_ACCESS_URL");
    }

    this.accessUrl = Buffer.from(token, "base64").toString("utf8");
  }

  public async testConnection() {
    const response = await fetch(this.accessUrl);

    if (!response.ok) {
      throw new Error(`SimpleFIN returned ${response.status}`);
    }

    return await response.json();
  }
}

export const simplefin = new SimpleFINService();
