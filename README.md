# ciao ciao Loyalty Platform (Italian Pasta & Pizza)

White-label Progressive Web App (PWA) loyalty and rewards platform customized for **ciao ciao** (Italian Pasta & Pizza).

## 🚀 Key Features

- **3 Dedicated PWA Web Apps**:
  - Customer Loyalty Pass: `/customer`
  - Cashier POS Terminal: `/cashier` (with custom POS badge)
  - Executive Admin Dashboard: `/admin`
- **Permanent Persistent Sessions**: 10-year session tokens (`3650d` / `315,360,000s`) ensuring staff and customers remain logged in until manual logout. Dual-layer persistence via encrypted HTTP-only cookies and localStorage.
- **Brand Identity**:
  - Primary Color: `#36543D`
  - Accent Color: `#D4E2D4`
  - Currency: `JOD`
  - Points: 10 pts per JOD | 1.00 JOD discount per 100 pts | 50 welcome bonus pts
- **Authentication**:
  - Admin: `ciao` / `ciao2026@`
  - Cashier: `fathi` / PIN `2026`
  - Customer: Instant Google One-Tap OAuth
- **Database**: MongoDB Atlas cloud cluster with direct ReplicaSet connection.

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Run database seed
node scripts/seed-ciao.js

# Start development server
npm run dev

# Build for production
npm run build
```
