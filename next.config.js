const fs = require("fs");
const path = require("path");

require("dotenv").config();

// Function to load the environment-specific config
const loadConfig = (env) => {
  const configFilePath = path.resolve(__dirname, `config/config.json`);
  const configData = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
  const currentEnvironment = env || "qa";
  const environmentConfig =
    configData.environments[currentEnvironment] ||
    configData.environments[configData.defaultEnvironment];

  // Merge common config with environment-specific config
  const config = {
    ...environmentConfig,
    CORPORATE: configData.corporate,
    ...Object.entries(configData.common).reduce((acc, [key, value]) => {
      acc[key] = `${value}`;
      return acc;
    }, {}),
  };

  return config;
};

// Load the environment-specific config
const envConfig = loadConfig(process.env.ENV);

module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Replace '*' with the specific domain(s) you want to allow
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
  env: {
    ENV: process.env.ENV,
  },
  images: {
    domains: [
      "b2b.tektravels.com",
      "api.tbotechnology.in",
      "qtravel-admin",
      "qa-admin.qugo.io",
      "prod-admin.qugo.io",
      "images.cdnpath.com",
      "fastui.cltpstatic.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'b2b.tektravels.com',
    //     port: '',
    //     pathname: '*',
    //   },
    // ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next",
          name: "static/media/[name].[hash].[ext]",
        },
      },
    });

    // Determine the environment and load the appropriate config file
    // const env = process.env.ENV || "test";
    // const configFilePath = path.resolve(__dirname, `config/${env}.json`);
    // const envConfig = JSON.parse(fs.readFileSync(configFilePath, "utf8"));

    // Generate firebase-messaging-sw.js from template
    const templatePath = path.resolve(
      __dirname,
      "public/firebase-messaging-sw-template.js"
    );
    const outputPath = path.resolve(
      __dirname,
      "public/firebase-messaging-sw.js"
    );
    const templateContent = fs.readFileSync(templatePath, "utf8");
    const finalContent = templateContent
      .replace("__FIREBASE_API_KEY__", envConfig.FIREBASE_API_KEY)
      .replace("__FIREBASE_AUTH_DOMAIN__", envConfig.FIREBASE_AUTH_DOMAIN)
      .replace("__FIREBASE_PROJECT_ID__", envConfig.FIREBASE_PROJECT_ID)
      .replace("__FIREBASE_STORAGE_BUCKET__", envConfig.FIREBASE_STORAGE_BUCKET)
      .replace(
        "__FIREBASE_MESSAGING_SENDER_ID__",
        envConfig.FIREBASE_MESSAGING_SENDER_ID
      )
      .replace("__FIREBASE_APP_ID__", envConfig.FIREBASE_APP_ID)
      .replace(
        "__FIREBASE_MEASUREMENT_ID__",
        envConfig.FIREBASE_MEASUREMENT_ID
      );

    fs.writeFileSync(outputPath, finalContent, "utf8");

    return config;
  },
};
