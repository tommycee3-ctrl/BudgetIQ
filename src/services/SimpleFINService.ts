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
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return (await response.text()).trim();

    }

    async fetchAccounts(accessUrl: string): Promise<SimpleFINAccount[]> {

        const response = await this.authorizedFetch(
            this.buildAccountsUrl(accessUrl)
        );

        const data = await response.json() as {
            accounts?: SimpleFINAccount[];
        };

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

        const response = await this.authorizedFetch(url);

        const data = await response.json() as {
            accounts?: SimpleFINAccount[];
        };

        return data.accounts ?? [];

    }

    private async authorizedFetch(rawUrl: string): Promise<Response> {

        const url = new URL(rawUrl);

        const username = decodeURIComponent(url.username);
        const password = decodeURIComponent(url.password);

        url.username = "";
        url.password = "";

        const auth = Buffer
            .from(`${username}:${password}`)
            .toString("base64");

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Basic ${auth}`
            }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        return response;

    }

    private buildAccountsUrl(accessUrl: string): string {

        const clean = accessUrl.replace(/\/$/, "");

        return clean.endsWith("/accounts")
            ? clean
            : `${clean}/accounts`;

    }

}

export const simplefin = new SimpleFINService();