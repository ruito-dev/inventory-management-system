import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker用のスタンドアロン出力設定
  output: 'standalone',
  
  // 開発環境でのホットリロード設定
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config) => {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
      return config
    },
  }),
};

export default nextConfig;
