const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://fathiciaociao_db_user:abHcUzI0N3Hf1bVT@ac-sszuc9r-shard-00-00.bwuuap9.mongodb.net:27017,ac-sszuc9r-shard-00-01.bwuuap9.mongodb.net:27017,ac-sszuc9r-shard-00-02.bwuuap9.mongodb.net:27017/ciao_loyalty?ssl=true&replicaSet=atlas-tkvknp-shard-0&authSource=admin&retryWrites=true&w=majority';

// Mongoose Schemas
const TenantConfigSchema = new mongoose.Schema({
  _id: { type: String, default: "config_ciao_default" },
  storeName: { type: String, required: true },
  tagline: { type: String, default: "" },
  logoUrl: { type: String, default: "/logo.png" },
  primaryColor: { type: String, default: "#36543D" },
  accentColor: { type: String, default: "#D4E2D4" },
  terracottaColor: { type: String, default: "#36543D" },
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

const TransactionSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  type: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String },
  customerPhone: { type: String },
  cashierId: { type: String },
  cashierName: { type: String },
  branchName: { type: String },
  billAmount: { type: Number },
  currency: { type: String, default: "JOD" },
  points: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  rewardTitle: { type: String },
  referenceCode: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const RewardSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  pointsRequired: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  imageUrl: { type: String },
  claimedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const NotificationSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  customerId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: "SYSTEM" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

async function runSeed() {
  console.log("Connecting to MongoDB Atlas for ciao ciao...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log("Connected successfully to Atlas!");

  const TenantConfig = mongoose.models.TenantConfig || mongoose.model('TenantConfig', TenantConfigSchema);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);
  const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
  const Reward = mongoose.models.Reward || mongoose.model('Reward', RewardSchema);
  const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

  // 1. Wipe all test customers, transactions, rewards, notifications to ensure 100% clean slate
  console.log("Cleaning customer, transaction, and old account collections...");
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Reward.deleteMany({});
  await Notification.deleteMany({});
  await TenantConfig.deleteMany({});

  // 2. Upsert TenantConfig
  const configData = {
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
    updatedAt: new Date(),
  };
  await TenantConfig.create(configData);
  console.log("Seeded TenantConfig:", configData.storeName, "-", configData.tagline);

  // 3. Upsert Super Admin (username=ciao, password=ciao2026@)
  const adminHash = bcrypt.hashSync("ciao2026@", 10);
  const adminUser = await User.create({
    _id: "admin_ciao",
    role: "super_admin",
    name: "ciao",
    username: "ciao",
    email: "admin@CIAOCIAOJO.com",
    passwordHash: adminHash,
    pointsBalance: 0,
    lifetimePoints: 0,
    tier: "Gold",
    isActive: true,
  });
  console.log("Seeded Super Admin: username=ciao, password=ciao2026@, email=admin@CIAOCIAOJO.com");

  // 4. Upsert Cashier (username=fathi, PIN=2026)
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
    console.log(` - Role: ${u.role}, Username: ${u.username || 'N/A'}, Name: ${u.name}, StaffPin: ${u.staffPin || 'N/A'}, Email: ${u.email || 'N/A'}`);
  }

  console.log("ALL CIAO CIAO SEEDING COMPLETED SUCCESSFULLY!");
  process.exit(0);
}

runSeed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
