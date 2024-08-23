/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:true,
    env:{
        ALCHEMY_URI:process.env.NEXT_PUBLIC_ALCHEMY_URI
    }

};

export default nextConfig;
