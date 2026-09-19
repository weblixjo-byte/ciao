import mongoose, { Schema, Document } from "mongoose";
import { ITenantConfig } from "@/lib/types";

export interface TenantConfigDocument extends Omit<ITenantConfig, "_id">, Document {}

const TenantConfigSchema = new Schema<TenantConfigDocument>(
  {
    storeName: { type: String, required: true, default: "ciao ciao" },
    tagline: { type: String, default: "Italian Restaurant - Pizza & Pasta" },
    logoUrl: { type: String, default: "/logo.png" },
    primaryColor: { type: String, default: "#36543D" },
    accentColor: { type: String, default: "#D4E2D4" },
    terracottaColor: { type: String, default: "#36543D" },
    currency: { type: String, default: "JOD" },
    pointsPerUnit: { type: Number, default: 10 },
    discountPer100Pts: { type: Number, default: 1.00 },
    welcomeBonusPts: { type: Number, default: 50 },
  },
  { timestamps: true }
);

export default mongoose.models.TenantConfig ||
  mongoose.model<TenantConfigDocument>("TenantConfig", TenantConfigSchema);
