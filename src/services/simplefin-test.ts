import dotenv from "dotenv";

dotenv.config();

const accessUrl = process.env.SIMPLEFIN_ACCESS_URL;

if (!accessUrl) {
  throw new Error("SIMPLEFIN_ACCESS_URL is missing from .env");
}

console.log("SimpleFIN token found.");
console.log("Token length:", accessUrl.length);
console.log("First 6 characters:", accessUrl.slice(0, 6));
console.log("Last 6 characters:", accessUrl.slice(-6));
