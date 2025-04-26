import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { google } from 'googleapis';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "You must be signed in to access this API" });
  }

  const { siteUrl, startDate, endDate } = req.query;
  
  if (!siteUrl || !startDate || !endDate) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  try {
    // Configure Google OAuth2 client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken
    });

    // Initialize the Search Console API
    const searchconsole = google.searchconsole({
      version: 'v1',
      auth: oauth2Client
    });

    // Make the API request to Google Search Console
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDate,
        endDate: endDate,
        dimensions: ['query'],
        rowLimit: 10 // Adjust based on your needs
      }
    });

    // Return the data
    return res.status(200).json(response.data.rows || []);
    
  } catch (error) {
    console.error('Error fetching GSC data:', error);
    
    // Handle specific Google API errors
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json({ 
        error: error.response.data.error || "Error accessing Google Search Console API" 
      });
    }
    
    return res.status(500).json({ error: "Failed to fetch GSC data" });
  }
}