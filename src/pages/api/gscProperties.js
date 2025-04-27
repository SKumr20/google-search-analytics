// /api/gscProperties.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { google } from 'googleapis';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "You must be signed in to access this API" });
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

    // Fetch site list
    const { data } = await searchconsole.sites.list();
    
    if (!data || !data.siteEntry) {
      return res.status(200).json([]);
    }

    // Filter and format properties
    const properties = data.siteEntry
      .filter(site => site.permissionLevel === 'siteOwner' || site.permissionLevel === 'siteFullUser')
      .map(site => ({
        siteUrl: site.siteUrl,
        permissionLevel: site.permissionLevel
      }));

    return res.status(200).json(properties);
  } catch (error) {
    console.error('Error fetching GSC properties:', error);
    
    // Handle specific Google API errors
    if (error.response && error.response.data) {
      return res.status(error.response.status || 500).json({ 
        error: error.response.data.error || "Error accessing Google Search Console API" 
      });
    }
    
    return res.status(500).json({ error: "Failed to fetch GSC properties" });
  }
}