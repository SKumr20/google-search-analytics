"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Hero from "@/components/sections/Hero.jsx";

export default function Home() {
  const { data: session } = useSession();
  const [gscData, setGscData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Date range state
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 0, 1)); // Jan 1, 2025
  const [endDate, setEndDate] = useState<Date | undefined>(new Date(2025, 0, 31)); // Jan 31, 2025

  const fetchGSCData = async () => {
    if (!session) {
      setError("You must be signed in to fetch GSC data");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }
    
    // Format dates for API request (YYYY-MM-DD)
    const formattedStartDate = format(startDate, "yyyy-MM-dd");
    const formattedEndDate = format(endDate, "yyyy-MM-dd");
  
    setLoading(true);
    setError(null);
  
    try {
      const res = await fetch(
        `/api/gscData?siteUrl=sc-domain:macbookjournal.com&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
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
    <>
      <Hero />
      <div className="flex flex-col items-center justify-center p-10 mt-8 space-y-6">
        <h1 className="text-2xl font-bold">Google Search Console Data</h1>
        
        {session ? (
          <div className="flex flex-col items-center space-y-6 w-full max-w-md">
            <div className="flex flex-col w-full space-y-4">
              {/* Start Date Picker */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal">
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* End Date Picker */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal">
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => date < (startDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <Button 
              variant="default" 
              onClick={fetchGSCData} 
              disabled={loading} 
              className="w-full">
              {loading ? "Loading..." : "Fetch GSC Data"}
            </Button>
            
            {error && <p className="text-red-500">{error}</p>}
            
            {gscData.length > 0 ? (
              <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left border">Query</th>
                      <th className="p-2 text-left border">Clicks</th>
                      <th className="p-2 text-left border">Impressions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gscData.map((row, index) => (
                      <tr key={index}>
                        <td className="p-2 border">{row.keys[0]}</td>
                        <td className="p-2 border">{row.clicks}</td>
                        <td className="p-2 border">{row.impressions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => signOut()} 
              className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <p className="text-gray-600">You must be signed in to access GSC data</p>
            <Button variant="default" onClick={() => signIn("google")}>Sign in with Google</Button>
          </div>
        )}
      </div>
    </>

  );
}