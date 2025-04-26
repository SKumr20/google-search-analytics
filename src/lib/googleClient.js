import { google } from "googleapis";

// Set up the GSC API client
export const getGSCClient = (accessToken) => {
  return google.searchconsole({
    version: "v1",
    auth: accessToken, // Use the access token you get from NextAuth
  });
};

// Function to get GSC data (e.g., for clicks, impressions)
export const getSearchAnalytics = async (accessToken, siteUrl, startDate, endDate) => {
  const searchconsole = getGSCClient(accessToken);

  const res = await searchconsole.searchanalytics.query({
    siteUrl: siteUrl, // The site URL you want to query
    requestBody: {
      startDate: startDate, // Start date for the query (YYYY-MM-DD)
      endDate: endDate, // End date for the query (YYYY-MM-DD)
      dimensions: ["query"], // We only need the query dimension
      rowLimit: 10, // Adjust based on your needs
    },
  });

  return res.data.rows;
};
