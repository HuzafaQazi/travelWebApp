import testConfig from '../config/test.json';
import devConfig from '../config/dev.json';
import prodConfig from '../config/prod.json';
import localConfig from '../config/local.json';
import sitConfig from '../config/sit.json';

const environments = {
  test: testConfig,
  dev: devConfig,
  prod: prodConfig,
  local: localConfig,
  sit: sitConfig,
};

const defaultEnvironment = 'test'; // Change this to the default environment you want

const currentEnvironment = process.env.ENV || defaultEnvironment;
const config = environments[currentEnvironment] || environments[defaultEnvironment];

export default config;
