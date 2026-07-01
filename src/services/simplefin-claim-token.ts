import dotenv from "dotenv";

dotenv.config();

const setupToken = process.env.SIMPLEFIN_ACCESS_URL!;

async function main() {

    const claimUrl = Buffer.from(setupToken, "base64").toString("utf8");

    console.log("Claim URL:");
    console.log(claimUrl);

    const response = await fetch(claimUrl,{
        method:"POST",
        headers:{
            "Content-Length":"0"
        }
    });

    console.log("");
    console.log("Status:",response.status);
    console.log("");

    const body = await response.text();

    console.log("===== RESPONSE =====");
    console.log(body);
    console.log("====================");
}

main().catch(console.error);
