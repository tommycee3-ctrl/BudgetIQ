import { simplefin } from "./SimpleFINService";

async function main() {
  const data = await simplefin.testConnection();

  console.log("Connected to SimpleFIN.");
  console.log("Accounts found:", data.accounts?.length ?? 0);

  for (const account of data.accounts ?? []) {
    console.log("-");
    console.log("Name:", account.name);
    console.log("Org:", account.org?.name);
    console.log("Balance:", account.balance);
    console.log("Currency:", account.currency);
  }
}

main().catch((error) => {
  console.error("SimpleFIN connection failed:");
  console.error(error);
  process.exit(1);
});
