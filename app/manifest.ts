import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ledgrly",
    short_name: "Ledgrly",
    description:
      "Gestiona tus ventas, gastos, inventario, clientes y mucho más con Ledgrly.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e293b",
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
  };
}
