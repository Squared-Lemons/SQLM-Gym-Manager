/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@app/ui", "@app/api"],
  serverExternalPackages: [
    "better-sqlite3",
    "better-auth",
    "@app/auth",
    "@app/database",
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "better-sqlite3": "commonjs better-sqlite3",
      });
    }
    return config;
  },
};

module.exports = nextConfig;
