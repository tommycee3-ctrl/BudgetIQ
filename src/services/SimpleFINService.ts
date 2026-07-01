import dotenv from "dotenv";

dotenv.config();

export type SimpleFINAccount = {
    id: string;
    name: string;
    org?: {
        name?: string;
        domain?: string;
    };
    balance?: string;
    currency?: string;
    available_balance?: string;
    transactions?: SimpleFINTransaction[];
};

export type SimpleFINTransaction = {
    id: string;
    posted?: number;
    amount: string;
    description: string;
    payee?: string;
    pending?: boolean;
};

export class SimpleFINService {

    decodeSetupToken(setupToken: string): string {
        return Buffer.from(setupToken, "base64").toString("utf8");
    }

    async claimSetupToken(setupToken: string): Promise<string> {
        const claimUrl = this.decodeSetupToken(setupToken);

        const response = await fetch(claimUrl, {
            method: "POST",
            headers: {
                "Content-Length": "0"
            }
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`SimpleFIN claim failed: ${response.status} ${text}`);
        }

        const accessUrl = (await response.text()).trim();

        if (!accessUrl.startsWith("http")) {
            throw new Error("SimpleFIN did not return a valid access URL.");
        }

        return accessUrl;
    }

    async fetchAccounts(accessUrl: string): Promise<SimpleFINAccount[]> {
        const url = this.buildAccountsUrl(accessUrl);

        const response = await fetch(url);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`SimpleFIN accounts failed: ${response.status} ${text}`);
        }

        const data = await response.json() as { accounts?: SimpleFINAccount[] };

        return data.accounts ?? [];
    }

    async fetchTransactions(
        accessUrl: string,
        startDateUnix?: number
    ): Promise<SimpleFINAccount[]> {
        let url = this.buildAccountsUrl(accessUrl);

        if (startDateUnix) {
            url += `?start-date=${startDateUnix}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`SimpleFIN transactions failed: ${response.status} ${text}`);
        }

        const data = await response.json() as { accounts?: SimpleFINAccount[] };

        return data.accounts ?? [];
    }

    private buildAccountsUrl(accessUrl: string): string {
        const clean = accessUrl.replace(/\/$/, "");

        if (clean.endsWith("/accounts")) {
            return clean;
        }

        return `${clean}/accounts`;
    }

}

export const simplefin = new SimpleFINService();