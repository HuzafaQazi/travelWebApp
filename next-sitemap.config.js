const path = require("path");
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();

const loadConfig = (env) => {
  const configFilePath = path.resolve(__dirname, "config/config.json");
  const configData = JSON.parse(fs.readFileSync(configFilePath, "utf8"));
  const currentEnvironment = env || process.env.ENV || "qa";
  const environmentConfig =
    configData.environments[currentEnvironment] ||
    configData.environments[configData.defaultEnvironment];

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

const environmentConfig = loadConfig(process.env.ENV);

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

const fetchDynamicRoutes = async () => {
  try {
    const [packagesResponse, blogsResponse] = await Promise.all([
      axios.get(
        `${environmentConfig.BASE_URL}${environmentConfig.ALL_PACKAGES}`
      ),
      axios.get(`${environmentConfig.BASE_URL}${environmentConfig.ALL_BLOGS}`),
    ]);

    const packageRoutes = packagesResponse.data.data.map((pkg) => {
      const countrySlug = slugify(pkg.country_name);
      return `/packages/${countrySlug}/${pkg.slug}`;
    });

    const blogRoutes = blogsResponse.data.data.map((blog) => {
      const countrySlug = slugify(blog.country_name);
      const citySlug = slugify(blog.city_name);
      return `/blogs/${countrySlug}/${citySlug}/${blog.slug}`;
    });

    return [...packageRoutes, ...blogRoutes];
  } catch (error) {
    console.error("Error fetching dynamic routes:", error);
    return [];
  }
};

const isProd = process.env.ENV === "prod";

// Delete existing robots.txt if it exists
const deleteExistingFiles = () => {
  const outputPath = path.resolve(__dirname, "public");
  const filesToDelete = ["robots.txt", "sitemap.xml", "sitemap-0.xml"];

  filesToDelete.forEach((file) => {
    const filePath = path.join(outputPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted existing ${file}`);
    }
  });
};

// Delete existing files before generation
deleteExistingFiles();

// Synchronous configuration for next-sitemap
// module.exports = {
//   siteUrl: environmentConfig.WEB_BASE_URL,
//   generateRobotsTxt: true,
//   robotsTxtOptions: {
//     policies: [
//       { userAgent: "*", disallow: "" },
//       { userAgent: "Rogerbot", disallow: "/" },
//       { userAgent: "MJ12bot", disallow: "/" },
//       { userAgent: "AhrefsBot", disallow: "/" },
//       { userAgent: "Googlebot", allow: "/" },
//       { userAgent: "Googlebot-Mobile", allow: "/" },
//       { userAgent: "Googlebot-Image", allow: "/" },
//       { userAgent: "Mediapartners-Google", allow: "/" },
//       { userAgent: "Adsbot-Google", allow: "/" },
//       { userAgent: "Slurp", allow: "/" },
//       { userAgent: "msnbot", allow: "/" },
//     ],
//   },
//   exclude: ["*"], // Exclude all pages initially
//   transform: async (config, path) => {
//     const staticRoutes = [
//       "/blogs",
//       "/bookingtermsandconditions",
//       "/bookingprivacypolicy",
//     ];

//     if (staticRoutes.includes(path)) {
//       return {
//         loc: path,
//         changefreq: "weekly",
//         priority: 0.8,
//       };
//     }

//     // Return null to exclude non-matching paths
//     return null;
//   },
//   additionalPaths: async (config) => {
//     const dynamicRoutes = await fetchDynamicRoutes();

//     // Include static routes explicitly
//     const staticRoutes = [
//       "/blogs",
//       "/bookingtermsandconditions",
//       "/bookingprivacypolicy",
//     ];

//     return [
//       ...staticRoutes.map((route) => ({
//         loc: `${config.siteUrl}${route}`,
//         changefreq: "weekly",
//         priority: 0.8,
//       })),
//       ...dynamicRoutes.map((route) => ({
//         loc: `${config.siteUrl}${route}`,
//         changefreq: "daily",
//         priority: 0.9,
//       })),
//     ];
//   },
// };

module.exports = {
  siteUrl: environmentConfig.WEB_BASE_URL,
  generateRobotsTxt: isProd,
  generateIndexSitemap: false,
  robotsTxtOptions: isProd
    ? {
        policies: [
          { userAgent: "*", disallow: "" },
          { userAgent: "Rogerbot", disallow: "/" },
          { userAgent: "MJ12bot", disallow: "/" },
          { userAgent: "AhrefsBot", disallow: "/" },
          { userAgent: "Googlebot", allow: "/" },
          { userAgent: "Googlebot-Mobile", allow: "/" },
          { userAgent: "Googlebot-Image", allow: "/" },
          { userAgent: "Mediapartners-Google", allow: "/" },
          { userAgent: "Adsbot-Google", allow: "/" },
          { userAgent: "Slurp", allow: "/" },
          { userAgent: "msnbot", allow: "/" },
        ],
      }
    : {
        policies: [{ userAgent: "*", disallow: "/" }], // Disallow all crawling for non-prod
      },
  exclude: isProd ? ["*"] : ["/**"], // Exclude all pages for non-prod
  transform: async (config, path) => {
    if (!isProd) return null;
    const staticRoutes = [
      "/blogs",
      "/bookingtermsandconditions",
      "/bookingprivacypolicy",
    ];

    if (staticRoutes.includes(path)) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.8,
      };
    }

    // Return null to exclude non-matching paths
    return null;
  },
  additionalPaths: async (config) => {
    if (!isProd) return []; // Only add additional paths in production

    const dynamicRoutes = await fetchDynamicRoutes();

    // Include static routes explicitly
    const staticRoutes = [
      "/blogs",
      "/bookingtermsandconditions",
      "/bookingprivacypolicy",
    ];

    return [
      ...staticRoutes.map((route) => ({
        loc: `${config.siteUrl}${route}`,
        changefreq: "weekly",
        priority: 0.8,
      })),
      ...dynamicRoutes.map((route) => ({
        loc: `${config.siteUrl}${route}`,
        changefreq: "daily",
        priority: 0.9,
      })),
    ];
  },
};
