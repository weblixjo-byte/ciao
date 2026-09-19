import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ciao ciao Loyalty Pass",
  description: "ciao ciao Italian Pasta & Pizza Digital Loyalty Pass & Rewards",
  applicationName: "ciao ciao Pass",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ciao ciao Pass",
  },
  manifest: "/manifest.json",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
