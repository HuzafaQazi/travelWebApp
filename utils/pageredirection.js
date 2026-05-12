import { logEvent } from "firebase/analytics";
import { analytics } from "./firebase";
import { createSlug } from "./slug";

export const redirectPackageDetail = (id, title, countryname) => {
  const titleSlug = createSlug(title);
  const countrySlug = createSlug(countryname);

  const url = `/packages/${countrySlug}/${titleSlug}`;
  // const url = `/packages/${id}/${countrySlug}/${titleSlug}`;

  // logEvent(analytics, 'package_detail_redirect', {
  //   packageid: id,
  //   packagetitle: title,
  //   countryname: countryname
  // });

  return url;
};

export const redirectBlogDetail = (countryname, cityname, slug) => {
  const updatedCountryname = createSlug(countryname);
  const updatedCityname = createSlug(cityname);

  const url = `/blogs/${updatedCountryname}/${updatedCityname}/${slug}`;

  return url;
};

export const redirectCountryPackagePage = (country_id) => {
  const url = `/packages/${country_id}`;
  logEvent(analytics, "country_page_redirect", {
    countryid: country_id,
  });

  return url;
};

export const redirectTravelGuidePage = (id, title) => {
  const titleSlug = createSlug(title);

  const url = `/travelguides/${id}/${titleSlug}`;
  logEvent(analytics, "travel_guide_redirect", {
    package_id: id,
    package_title: title,
  });

  return url;
};
