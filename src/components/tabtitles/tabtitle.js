import Head from "next/head";

const TabTitle = ({ children, title }) => {
  return (
    <div>
      <Head>
        <title>Top Holiday Packages, Tours, and Affordable Travel Deals.</title>
      </Head>
      {children}
    </div>
  );
};

export default TabTitle;
