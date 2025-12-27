/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode to avoid double rendering issues
  swcMinify: false, // Disable SWC minifier to avoid conflicts
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
  images: {
    domains: ['assets.coingecko.com', 'raw.githubusercontent.com', 'lottie.host'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint errors during build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignore TypeScript errors during build
  },
  experimental: {
    esmExternals: false, // Disable ESM externals
  },
  webpack: (config, { isServer, dev }) => {
    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
      topLevelAwait: true,
    };

    // Handle .wasm files
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Fix for MeshJS and Cardano libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        buffer: require.resolve('buffer'),
      };

      // Add global Buffer polyfill
      config.plugins.push(
        new (require('webpack')).ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    // Handle ESM modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    // Fix for cardano-peer-connect and other problematic modules
    config.module.rules.push({
      test: /node_modules\/@fabianbormann\/cardano-peer-connect/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-runtime'],
        },
      },
    });

    // Externalize problematic packages for server-side
    if (isServer) {
      config.externals = [
        ...config.externals,
        '@fabianbormann/cardano-peer-connect',
        '@basementuniverse/commonjs',
      ];
    }

    // Ignore warnings and errors
    config.ignoreWarnings = [
      /Critical dependency/,
      /Can't resolve/,
      /Module not found/,
      /async\/await/,
      /Cannot redefine property/,
    ];

    // Resolve aliases for problematic modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@fabianbormann/cardano-peer-connect': false,
      '@basementuniverse/commonjs': false,
    };

    return config;
  },
  
  // Transpile packages
  transpilePackages: [
    '@meshsdk/core',
    '@meshsdk/react',
    '@meshsdk/core-cst',
    '@meshsdk/web3-sdk',
  ],
}

module.exports = nextConfig