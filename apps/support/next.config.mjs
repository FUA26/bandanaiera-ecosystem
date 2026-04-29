/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],

  // Enable standalone output for Docker builds
  // Comment out or remove for development builds
  ...(process.env.NODE_ENV === "production" && {
    output: "standalone",
  }),
}

export default nextConfig
