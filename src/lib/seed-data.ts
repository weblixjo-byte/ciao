import bcrypt from "bcryptjs";
import { ITenantConfig, IUser, ITransaction, IReward, INotification } from "./types";

export function seedInitialData() {
  const adminPasswordHash = bcrypt.hashSync("ciao2026@", 10);

  const config: ITenantConfig = {
    _id: "config_ciao_default",
    storeName: "ciao ciao",
    tagline: "Italian Restaurant - Pizza & Pasta",
    logoUrl: "/logo.png",
    primaryColor: "#36543D",
    accentColor: "#D4E2D4",
    terracottaColor: "#36543D",
    currency: "JOD",
    pointsPerUnit: 10,
    discountPer100Pts: 1.0,
    welcomeBonusPts: 50,
    updatedAt: new Date().toISOString(),
  };

  const users: IUser[] = [
    // Super Admin: username ciao / password ciao2026@
    {
      _id: "admin_ciao",
      role: "super_admin",
      name: "ciao",
      username: "ciao",
      email: "admin@CIAOCIAOJO.com",
      passwordHash: adminPasswordHash,
      pointsBalance: 0,
      lifetimePoints: 0,
      tier: "Gold",
      createdAt: new Date().toISOString(),
    },
    // Cashier: username fathi / PIN 2026
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
