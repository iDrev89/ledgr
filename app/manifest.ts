import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ledgrly - Business Management App",
    short_name: "Ledgrly",
    description:
      "Modern business management application for small businesses. Manage sales, expenses, payroll, inventory, and generate automated financial reports with ease.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#a78bfa",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    dir: "ltr",
    categories: ["business", "finance", "productivity"],
    icons: [
      {
        src: "/icons/icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-128x128.png",
        sizes: "128x128",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Nueva Venta",
        short_name: "Venta",
        description: "Registrar una nueva venta",
        url: "/sales/new?source=shortcut",
        icons: [
          {
            src: "/icons/shortcut-sale.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Registrar Gasto",
        short_name: "Gasto",
        description: "Registrar un nuevo gasto",
        url: "/expenses?source=shortcut",
        icons: [
          {
            src: "/icons/shortcut-expense.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Dashboard",
        short_name: "Dashboard",
        description: "Ver panel de control",
        url: "/dashboard?source=shortcut",
        icons: [
          {
            src: "/icons/shortcut-dashboard.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Dashboard principal con métricas y gráficos",
      },
      {
        src: "/screenshots/mobile-sales.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
        label: "Registro de ventas en dispositivo móvil",
      },
    ],
  };
}
