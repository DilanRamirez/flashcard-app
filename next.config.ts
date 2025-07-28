import withPWA from "next-pwa";

const pwaConfig = withPWA({
  dest: "public", // Where to output the service worker
  register: true, // Auto-register service worker
  skipWaiting: true, // Skip waiting on updates
});

const nextConfig = {
  reactStrictMode: true,
};

export default pwaConfig(nextConfig);
