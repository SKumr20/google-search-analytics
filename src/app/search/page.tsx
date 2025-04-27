"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  PlusIcon,
  DownloadIcon,
  TrashIcon,
  LayoutIcon,
  MoveIcon,
  SaveIcon
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// React DnD imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

// Time range options
const TIME_RANGES = [
  { label: "Last 7 Days", value: "7d", days: 7 },
  { label: "Last 28 Days", value: "28d", days: 28 },
  { label: "Last 3 Months", value: "3m", days: 90 },
  { label: "Custom Range", value: "custom" }
];

// Metric options
const METRICS = [
  { label: "Clicks", value: "clicks" },
  { label: "Impressions", value: "impressions" },
  { label: "CTR", value: "ctr" },
  { label: "Position", value: "position" }
];

// SortableItem component for drag-and-drop
function SortableItem({ id, metric, timeRange, onDelete, data }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getMetricLabel = () => {
    const metricLabel = METRICS.find(m => m.value === metric)?.label || metric;
    const timeLabel = TIME_RANGES.find(t => t.value === timeRange)?.label || timeRange;
    return `${metricLabel} ${timeLabel}`;
  };

  const getValue = () => {
    if (!data || !data.length) return '-';
    
    // Find the sum of the metric across all queries
    const total = data.reduce((sum, item) => {
      return sum + (Number(item[metric]) || 0);
    }, 0);
    
    // Format based on metric type
    if (metric === 'ctr') {
      return `${(total / data.length).toFixed(2)}%`;
    } else if (metric === 'position') {
      return (total / data.length).toFixed(1);
    } else {
      return total.toLocaleString();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card className="border shadow-sm">
        <CardHeader className="p-3 pb-0 cursor-move" {...attributes} {...listeners}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{getMetricLabel()}</CardTitle>
            <MoveIcon className="h-4 w-4 text-gray-500" />
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="text-2xl font-bold">{getValue()}</div>
        </CardContent>
        <CardFooter className="p-2 pt-0 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onDelete(id)}>
            <TrashIcon className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [gscData, setGscData] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState("sc-domain:macbookjournal.com");
  
  // Report configuration
  const [reportBlocks, setReportBlocks] = useState([]);
  const [nextBlockId, setNextBlockId] = useState(1);
  
  // New metric selection
  const [newMetric, setNewMetric] = useState(METRICS[0].value);
  const [newTimeRange, setNewTimeRange] = useState(TIME_RANGES[0].value);
  
  // Date range state for custom date selection
  const [startDate, setStartDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 28))
  );
  const [endDate, setEndDate] = useState(new Date());
  const [customDateRange, setCustomDateRange] = useState(false);
  
  // Report name
  const [reportName, setReportName] = useState("Custom GSC Report");
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch GSC properties on session load
  useEffect(() => {
    if (session) {
      fetchGSCProperties();
    }
  }, [session]);

  // Fetch GSC properties
  const fetchGSCProperties = async () => {
    try {
      const res = await fetch("/api/gscProperties");
      
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
        if (data.length > 0) {
          setSelectedProperty(data[0].siteUrl);
        }
      }
    } catch (err) {
      setError("Failed to fetch GSC properties");
    }
  };

  // Calculate date range based on time range
  const getDateRange = (timeRangeValue) => {
    const today = new Date();
    let start = new Date();
    
    const timeRange = TIME_RANGES.find(tr => tr.value === timeRangeValue);
    if (!timeRange) return { start: startDate, end: endDate };
    
    if (timeRange.value === "custom") {
      return { start: startDate, end: endDate };
    }
    
    // Set start date based on time range
    start.setDate(today.getDate() - timeRange.days);
    
    return { start, end: today };
  };

  // Fetch GSC data
  const fetchGSCData = async () => {
    if (!session) {
      setError("You must be signed in to fetch GSC data");
      return;
    }

    if (!selectedProperty) {
      setError("Please select a property");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get date range for default view
      const { start, end } = getDateRange(TIME_RANGES[1].value); // Default to last 28 days
      
      // Format dates for API request (YYYY-MM-DD)
      const formattedStartDate = format(start, "yyyy-MM-dd");
      const formattedEndDate = format(end, "yyyy-MM-dd");
      
      const res = await fetch(
        `/api/gscData?siteUrl=${encodeURIComponent(selectedProperty)}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      
      const data = await res.json();
      
      if (res.ok) {
        setGscData(data);
        processQueryData(data);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };
  
  // Process query data to prepare for display
  const processQueryData = (data) => {
    if (!data || data.length === 0) return;
    
    // Process the data to add additional metrics and sort by impressions
    const processed = data.map(item => ({
      query: item.keys[0],
      clicks: item.clicks,
      impressions: item.impressions,
      ctr: (item.ctr * 100).toFixed(2), // Convert to percentage
      position: item.position.toFixed(1)
    })).sort((a, b) => b.impressions - a.impressions);
    
    setProcessedData(processed);
  };
  
  // Add a new block to the report
  const addReportBlock = () => {
    const newBlock = {
      id: `block-${nextBlockId}`,
      metric: newMetric,
      timeRange: newTimeRange
    };
    
    setReportBlocks([...reportBlocks, newBlock]);
    setNextBlockId(nextBlockId + 1);
  };
  
  // Delete a block from the report
  const deleteReportBlock = (blockId) => {
    setReportBlocks(reportBlocks.filter(block => block.id !== blockId));
  };
  
  // Handle block reordering on drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setReportBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  // Fetch data for specific time range
  const fetchTimeRangeData = async (timeRange) => {
    if (!session || !selectedProperty) return null;
    
    const { start, end } = getDateRange(timeRange);
    const formattedStartDate = format(start, "yyyy-MM-dd");
    const formattedEndDate = format(end, "yyyy-MM-dd");
    
    try {
      const res = await fetch(
        `/api/gscData?siteUrl=${encodeURIComponent(selectedProperty)}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(`Failed to fetch data for time range ${timeRange}:`, err);
    }
    
    return null;
  };
  
  // Export report data to CSV
  const exportToCsv = () => {
    if (!processedData.length) return;
    
    // Prepare CSV headers
    let headers = ["Query"];
    
    // Add block headers
    reportBlocks.forEach(block => {
      const metricLabel = METRICS.find(m => m.value === block.metric)?.label || block.metric;
      const timeLabel = TIME_RANGES.find(t => t.value === block.timeRange)?.label || block.timeRange;
      headers.push(`${metricLabel} ${timeLabel}`);
    });
    
    // Add category header
    headers.push("Category");
    
    // Prepare CSV rows
    const rows = processedData.map(item => {
      const row = [item.query];
      
      // Add metrics for each block
      reportBlocks.forEach(block => {
        row.push(item[block.metric] || "-");
      });
      
      // Add a placeholder category column (you can replace this with actual categories if available)
      row.push("Not Categorized");
      
      return row;
    });
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto p-4 mt-20">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">GSC Custom Report Builder</h1>
          
          {session ? (
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          ) : null}
        </div>
        
        {session ? (
          <div className="space-y-8">
            {/* Property Selection & Report Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="property">GSC Property</Label>
                <Select 
                  value={selectedProperty} 
                  onValueChange={setSelectedProperty}
                >
                  <SelectTrigger id="property" className="w-full">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.length > 0 ? (
                      properties.map((property) => (
                        <SelectItem key={property.siteUrl} value={property.siteUrl}>
                          {property.siteUrl}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="sc-domain:macbookjournal.com">
                        sc-domain:macbookjournal.com
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reportName">Report Name</Label>
                <Input
                  id="reportName"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Custom GSC Report"
                />
              </div>
            </div>
          
            {/* Fetch Data Button */}
            <div className="flex justify-start">
              <Button 
                variant="default" 
                onClick={fetchGSCData} 
                disabled={loading || !selectedProperty}
              >
                {loading ? "Loading..." : "Fetch GSC Data"}
              </Button>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Report Configuration */}
            {processedData.length > 0 && (
              <Tabs defaultValue="builder" className="w-full">
                <TabsList className="grid w-full md:w-[400px] grid-cols-2">
                  <TabsTrigger value="builder">Report Builder</TabsTrigger>
                  <TabsTrigger value="preview">Preview Report</TabsTrigger>
                </TabsList>
                
                <TabsContent value="builder" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Report Blocks Config */}
                    <Card className="col-span-1">
                      <CardHeader>
                        <CardTitle>Add Report Blocks</CardTitle>
                        <CardDescription>
                          Drag and drop blocks to customize your report
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="metric">Select Metric</Label>
                          <Select value={newMetric} onValueChange={setNewMetric}>
                            <SelectTrigger id="metric">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {METRICS.map((metric) => (
                                <SelectItem key={metric.value} value={metric.value}>
                                  {metric.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="timeRange">Time Range</Label>
                          <Select value={newTimeRange} onValueChange={setNewTimeRange}>
                            <SelectTrigger id="timeRange">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_RANGES.map((range) => (
                                <SelectItem key={range.value} value={range.value}>
                                  {range.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {newTimeRange === "custom" && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Custom Start Date</Label>
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
                            
                            <div className="space-y-2">
                              <Label>Custom End Date</Label>
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
                        )}
                        
                        <Button 
                          className="w-full" 
                          onClick={addReportBlock}
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Block
                        </Button>
                      </CardContent>
                    </Card>
                    
                    {/* Report Layout */}
                    <Card className="col-span-1 md:col-span-2">
                      <CardHeader>
                        <CardTitle>Report Layout</CardTitle>
                        <CardDescription>
                          Drag blocks to reorder them in your report
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {reportBlocks.length > 0 ? (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis]}
                          >
                            <SortableContext
                              items={reportBlocks.map(block => block.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {reportBlocks.map((block) => (
                                  <SortableItem
                                    key={block.id}
                                    id={block.id}
                                    metric={block.metric}
                                    timeRange={block.timeRange}
                                    onDelete={deleteReportBlock}
                                    data={processedData}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        ) : (
                          <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg">
                            <div className="text-center">
                              <LayoutIcon className="mx-auto h-12 w-12 text-gray-300" />
                              <h3 className="mt-2 text-lg font-medium text-gray-900">No blocks added</h3>
                              <p className="mt-1 text-sm text-gray-500">
                                Add some blocks to start building your report
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                      {reportBlocks.length > 0 && (
                        <CardFooter className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={exportToCsv}>
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export to CSV
                          </Button>
                          <Button variant="default">
                            <SaveIcon className="h-4 w-4 mr-2" />
                            Save Report
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{reportName}</CardTitle>
                      <CardDescription>
                        Generated from {selectedProperty} data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium">Query</th>
                              {reportBlocks.map((block) => {
                                const metricLabel = METRICS.find(m => m.value === block.metric)?.label || block.metric;
                                const timeLabel = TIME_RANGES.find(t => t.value === block.timeRange)?.label || block.timeRange;
                                return (
                                  <th key={block.id} className="text-left py-3 px-4 font-medium">
                                    {`${metricLabel} ${timeLabel}`}
                                  </th>
                                );
                              })}
                              <th className="text-left py-3 px-4 font-medium">Category</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processedData.slice(0, 100).map((item, index) => (
                              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                <td className="py-2 px-4">{item.query}</td>
                                {reportBlocks.map((block) => (
                                  <td key={block.id} className="py-2 px-4">
                                    {item[block.metric] || "-"}
                                  </td>
                                ))}
                                <td className="py-2 px-4">
                                  Not Categorized
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button variant="outline" onClick={exportToCsv}>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Export to CSV
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-6 py-12">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Sign in to Access GSC Data</CardTitle>
                <CardDescription>
                  You must be signed in with your Google account to access GSC data
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button variant="default" onClick={() => signIn("google")}>
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}