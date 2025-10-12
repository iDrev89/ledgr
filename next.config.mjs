// /** @type {import('next').NextConfig} */
// // import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
// import createNextIntlPlugin from "next-intl/plugin";

// const withNextIntl = createNextIntlPlugin();

// const nextConfig = {
//   webpack: (config, { isServer }) => {
//     if (isServer) {
//       config.plugins = [...config.plugins, new PrismaPlugin()];
//     }

//     return config;
//   },
// };

// export default withNextIntl(nextConfig);

import createNextIntlPlugin from "next-intl/plugin";
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
