import bcrypt from "bcryptjs";
import { ITenantConfig, IUser, ITransaction, IReward, INotification } from "./types";

export function seedInitialData() {
  const adminPasswordHash = bcrypt.hashSync("ciao@2026", 10);

  const config: ITenantConfig = {
    _id: "config_ciao_default",
    storeName: "ciao ciao",
    tagline: "Italian Pasta & Pizza",
    logoUrl: "/logo.png",
    primaryColor: "#FAFBFA",
    accentColor: "#426E49",
    terracottaColor: "#426E49",
    currency: "JOD",
    pointsPerUnit: 10,
    discountPer100Pts: 1.0,
    welcomeBonusPts: 50,
    updatedAt: new Date().toISOString(),
  };

  const users: IUser[] = [
    // Super Admin
    {
      _id: "admin_fathi",
      role: "super_admin",
      name: "fathi",
      username: "fathi",
      email: "admin@ciaociaorestaurant.com",
      passwordHash: adminPasswordHash,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: "Gold",
      createdAt: new Date().toISOString(),
    },
    // Cashier: fathi
    {
      _id: "cashier_fathi",
      role: "cashier",
      name: "fathi",
      username: "fathi",
      staffPin: "2026",
      branchName: "Main Branch",
      isActive: true,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: "Member",
      createdAt: new Date().toISOString(),
    },
  ];

  const transactions: ITransaction[] = [];

  const rewards: IReward[] = [];

  const notifications: INotification[] = [];

  return { config, users, transactions, rewards, notifications };
}
