import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/api/auth/callback/google"
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { siteUrl, startDate, endDate } = req.query;

  if (!siteUrl || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing parameters: siteUrl, startDate, endDate are required." });
  }

  // Extract access token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }
  const accessToken = authHeader.replace("Bearer ", "");

  try {
    // Set OAuth2 credentials
    oauth2Client.setCredentials({ access_token: accessToken });

    // Initialize the Search Console API client
    const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });

    // Fetch search analytics data
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl as string,
      requestBody: {
        startDate: startDate as string,
        endDate: endDate as string,
        dimensions: ["query"],
        rowLimit: 10, // You can adjust this as needed
      },
    });

    const data = response.data.rows || [];

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching GSC data:", error);
    return res.status(500).json({ error: "Failed to fetch GSC data" });
  }
}
