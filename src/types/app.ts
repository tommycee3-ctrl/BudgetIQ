export type UserKey = "tommy" | "ashley";

export type AppPage =
  | "dashboard"
  | "budget"
  | "bills"
  | "card"
  | "transactions"
  | "flex"
  | "bank"
  | "settings";

export interface UserProfile {
  id: number;
  key: UserKey;
  name: string;
  theme: UserKey;
  hasAmazonFlex: boolean;
}

export interface NavItem {
  id: AppPage;
  label: string;
  tommyOnly?: boolean;
}

export interface MetricCard {
  title: string;
  value: string;
  subtitle: string;
}
