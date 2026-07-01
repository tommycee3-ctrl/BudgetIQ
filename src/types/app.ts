export type UserKey = "tommy" | "ashley";

export type AppPage =
  | "dashboard"
  | "budget"
  | "bills"
  | "card"
  | "transactions"
  | "flex"
  | "settings";

export type AppUser = {
  key: UserKey;
  name: string;
  theme: "tommy" | "ashley";
  hasAmazonFlex: boolean;
};

export const USERS: Record<UserKey, AppUser> = {
  tommy: {
    key: "tommy",
    name: "Tommy",
    theme: "tommy",
    hasAmazonFlex: true
  },
  ashley: {
    key: "ashley",
    name: "Ashley",
    theme: "ashley",
    hasAmazonFlex: false
  }
};
