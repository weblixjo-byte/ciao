import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ciao ciao",
    short_name: "ciao ciao",
    description: "ciao ciao Italian Pasta & Pizza Loyalty Pass & Rewards",
    start_url: "/customer",
    display: "standalone",
    background_color: "#FAFBFA",
    theme_color: "#426E49",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Customer Digital Pass",
        short_name: "Customer Pass",
        description: "Open Member Loyalty Pass",
        url: "/customer",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Cashier POS Terminal",
        short_name: "Cashier POS",
        description: "Open Cashier POS Checkout Terminal",
        url: "/cashier",
        icons: [{ src: "/icon-cashier-192.png", sizes: "192x192" }],
      },
    ],
  };
}
