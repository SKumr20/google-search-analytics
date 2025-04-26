"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: session } = useSession();
  console.log(session);
  const [gscData, setGscData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGSCData = async () => {
    if (!session) {
      setError("You must be signed in to fetch GSC data");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(
        `/api/gscData?siteUrl=sc-domain:macbookjournal.com&startDate=2025-01-01&endDate=2025-01-31`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
  
      const data = await res.json();
  
      if (res.ok) {
        setGscData(data);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div>
      <h1>Google Search Console Data</h1>
      {session ? (
        <>
          <Button variant="default" onClick={fetchGSCData} disabled={loading}>
            {loading ? "Loading..." : "Fetch GSC Data"}
          </Button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <div>
            {gscData.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Query</th>
                    <th>Clicks</th>
                    <th>Impressions</th>
                  </tr>
                </thead>
                <tbody>
                  {gscData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.keys[0]}</td>
                      <td>{row.clicks}</td>
                      <td>{row.impressions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No data available</p>
            )}
          </div>
          <Button variant="default" onClick={() => signOut()}>Sign Out</Button>
        </>
      ) : (
        <div>
          <p>You must be signed in to access GSC data</p>
          <Button variant="default" onClick={() => signIn("google")}>Sign in with Google</Button>
        </div>
      )}
    </div>
  );
}
