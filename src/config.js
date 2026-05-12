import configData from "../config/config.json";

const currentEnvironment = process.env.ENV || "qa";
const environmentConfig =
  configData.environments[currentEnvironment] ||
  configData.environments[configData.defaultEnvironment];

// Merge common config with environment-specific config
const config = {
  ...environmentConfig,
  CORPORATE: configData.corporate,
  ...Object.entries(configData.common).reduce((acc, [key, value]) => {
    // acc[key] = `${environmentConfig.BASE_URL}${value}`;
    acc[key] = `${value}`;
    return acc;
  }, {}),
};

export default config;
