const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://fathiciaociao_db_user:abHcUzI0N3Hf1bVT@ac-sszuc9r-shard-00-00.bwuuap9.mongodb.net:27017,ac-sszuc9r-shard-00-01.bwuuap9.mongodb.net:27017,ac-sszuc9r-shard-00-02.bwuuap9.mongodb.net:27017/ciao_loyalty?ssl=true&replicaSet=atlas-tkvknp-shard-0&authSource=admin&retryWrites=true&w=majority';

// Mongoose Schemas
const TenantConfigSchema = new mongoose.Schema({
  _id: { type: String, default: "config_ciao_default" },
  storeName: { type: String, required: true },
  tagline: { type: String, default: "" },
  logoUrl: { type: String, default: "/logo.png" },
  primaryColor: { type: String, default: "#FAFBFA" },
  accentColor: { type: String, default: "#426E49" },
  terracottaColor: { type: String, default: "#426E49" },
  currency: { type: String, default: "JOD" },
  pointsPerUnit: { type: Number, default: 10 },
  discountPer100Pts: { type: Number, default: 1.0 },
  welcomeBonusPts: { type: Number, default: 50 },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  role: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String },
  pin: { type: String },
  qrSecret: { type: String },
  pointsBalance: { type: Number, default: 0 },
  lifetimePoints: { type: Number, default: 0 },
  tier: { type: String, default: "Member" },
  username: { type: String },
  branchName: { type: String },
  staffPin: { type: String },
  passwordHash: { type: String },
  isActive: { type: Boolean, default: true },
  email: { type: String },
  googleId: { type: String },
  avatarUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

async function runSeed() {
  console.log("Connecting to MongoDB Atlas for ciao ciao...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected successfully to Atlas!");

  const TenantConfig = mongoose.models.TenantConfig || mongoose.model('TenantConfig', TenantConfigSchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  // 1. Clean old test accounts if any
  await User.deleteMany({ username: { $in: ["cove", "sajji", "ahmad", "xian-admin", "salah"] } });

  // 2. Upsert TenantConfig
  const configData = {
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
    updatedAt: new Date(),
  };
  await TenantConfig.deleteMany({});
  await TenantConfig.create(configData);
  console.log("Seeded TenantConfig:", configData.storeName);

  // 3. Upsert Super Admin (fathi / ciao@2026)
  const adminHash = bcrypt.hashSync("ciao@2026", 10);
  await User.deleteMany({ _id: { $in: ["admin_01", "admin_fathi"] } });
  await User.deleteMany({ username: "fathi", role: "super_admin" });
  const adminUser = await User.create({
    _id: "admin_fathi",
    role: "super_admin",
    name: "fathi",
    username: "fathi",
    email: "admin@ciaociaorestaurant.com",
    passwordHash: adminHash,
    pointsBalance: 0,
    lifetimePoints: 0,
    tier: "Gold",
    isActive: true,
  });
  console.log("Seeded Super Admin: username=fathi, password=ciao@2026");

  // 4. Upsert Cashier (fathi / PIN 2026)
  await User.deleteMany({ _id: { $in: ["cashier_salah", "cashier_fathi"] } });
  await User.deleteMany({ username: "fathi", role: "cashier" });
  const cashierUser = await User.create({
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
  });
  console.log("Seeded Cashier: username=fathi, PIN=2026, Branch=Main Branch");

  // 5. Verification queries
  const allUsers = await User.find({}).lean();
  console.log("Current Database Users count:", allUsers.length);
  for (const u of allUsers) {
    console.log(` - Role: ${u.role}, Username: ${u.username || 'N/A'}, Name: ${u.name}, StaffPin: ${u.staffPin || 'N/A'}`);
  }

  console.log("ALL CIAO CIAO SEEDING COMPLETED SUCCESSFULLY!");
  process.exit(0);
}

runSeed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
