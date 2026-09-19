import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ciao ciao Admin Dashboard",
  description: "ciao ciao Italian Pasta & Pizza Executive Admin Dashboard",
  applicationName: "ciao ciao Admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ciao ciao Admin",
  },
  manifest: "/manifest-admin.json",
  other: {
    "application-name": "ciao ciao Admin Dashboard",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
