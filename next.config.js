/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io', // This allows Next.js to render images from UploadThing!
      },
    ],
  },
};

export default nextConfig;