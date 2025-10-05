import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/store';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ReportSession, BetType, ReportPeriod, Limits } from '@shared/types';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
const ReportGrid = ({ type, data, isLoading, limits }: { type: BetType, data: Map<string, number>, isLoading: boolean, limits: Limits | null }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = type === '2D' ? 1 : 10;
  const renderGridCells = () => {
    if (isLoading) {
      return Array.from({ length: 100 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-md" />
      ));
    }
    const cells = [];
    const startNum = type === '2D' ? 0 : (currentPage - 1) * 100;
    const endNum = startNum + 99;
    const typeLimits = limits?.[type] ?? {};
    for (let i = startNum; i <= endNum; i++) {
      const numStr = type === '2D' ? i.toString().padStart(2, '0') : i.toString().padStart(3, '0');
      const amount = data.get(numStr) || 0;
      const limit = typeLimits[numStr];
      const hasBet = amount > 0;
      const limitExceeded = limit !== undefined && amount > limit;
      cells.push(
        <div
          key={numStr}
          className={cn(
            "flex flex-col items-center justify-center aspect-square rounded-md p-1 text-center transition-all duration-200",
            limitExceeded ? "bg-destructive/20 border-destructive/50 border text-destructive font-semibold"
            : hasBet ? "bg-primary/10 border-primary/50 border text-primary font-semibold"
            : "bg-muted/50 text-muted-foreground"
          )}
        >
          <div className="text-sm md:text-base font-mono">{numStr}</div>
          <div className="text-xs md:text-sm opacity-80">${amount.toFixed(2)}</div>
        </div>
      );
    }
    return cells;
  };
  return (
    <div>
      <div className="grid grid-cols-10 gap-2 md:gap-3">
        {renderGridCells()}
      </div>
      {type === '3D' && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)); }} className={cn(currentPage === 1 && "pointer-events-none opacity-50")} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className={cn(currentPage === totalPages && "pointer-events-none opacity-50")} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const months = [
  { value: 0, label: 'January' }, { value: 1, label: 'February' }, { value: 2, label: 'March' },
  { value: 3, label: 'April' }, { value: 4, label: 'May' }, { value: 5, label: 'June' },
  { value: 6, label: 'July' }, { value: 7, label: 'August' }, { value: 8, label: 'September' },
  { value: 9, label: 'October' }, { value: 10, label: 'November' }, { value: 11, label: 'December' },
];
export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<BetType>('2D');
  // State for 2D reports
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [session, setSession] = useState<ReportSession>('morning');
  // State for 3D reports
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [period, setPeriod] = useState<ReportPeriod>('first_half');
  const fetchReports = useAppStore((state) => state.fetchReports);
  const reportsData = useAppStore((state) => state.reportsData);
  const isLoading = useAppStore((state) => state.isLoadingReports);
  const error = useAppStore((state) => state.error);
  const limits = useAppStore((state) => state.limits);
  const fetchLimits = useAppStore((state) => state.fetchLimits);
  useEffect(() => {
    if (!limits) {
      fetchLimits();
    }
  }, [limits, fetchLimits]);
  const handleGenerateReport = () => {
    if (activeTab === '2D' && date) {
      fetchReports({ gameType: '2D', date, session });
    } else if (activeTab === '3D') {
      fetchReports({ gameType: '3D', year, month, period });
    }
  };
  useEffect(() => {
    handleGenerateReport();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // Refetch when tab changes
  const reportMap = useMemo(() => {
    const map = new Map<string, number>();
    if (reportsData) {
      for (const report of reportsData) {
        map.set(report.number, report.totalAmount);
      }
    }
    return map;
  }, [reportsData]);
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as BetType)} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Game Session Reports</h2>
                <p className="text-muted-foreground">View sales reports by number for specific game sessions.</p>
            </div>
            <TabsList className="grid w-full sm:w-auto grid-cols-2">
                <TabsTrigger value="2D">2D Report</TabsTrigger>
                <TabsTrigger value="3D">3D Report</TabsTrigger>
            </TabsList>
        </div>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>Select filters to generate a report.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-end gap-4 mb-6 p-4 border rounded-lg bg-muted/50">
              {activeTab === '2D' ? (
                <>
                  <div className="grid gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium">Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full sm:w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium">Session</label>
                    <Select value={session} onValueChange={(v: ReportSession) => setSession(v)}>
                      <SelectTrigger className="w-full sm:w-[280px]">
                        <SelectValue placeholder="Select Session" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">Morning Session (12:01 AM - 12:01 PM)</SelectItem>
                        <SelectItem value="evening">Evening Session (12:02 PM - 4:30 PM)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium">Year</label>
                    <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                      <SelectTrigger className="w-full sm:w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium">Month</label>
                    <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                      <SelectTrigger className="w-full sm:w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>{months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 w-full sm:w-auto">
                    <label className="text-sm font-medium">Period</label>
                    <Select value={period} onValueChange={(v: ReportPeriod) => setPeriod(v)}>
                      <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first_half">1st - 15th</SelectItem>
                        <SelectItem value="second_half">16th - End of Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <Button onClick={handleGenerateReport} className="w-full sm:w-auto" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <TabsContent value="2D" className="mt-0">
              <ReportGrid type="2D" data={reportMap} isLoading={isLoading} limits={limits} />
            </TabsContent>
            <TabsContent value="3D" className="mt-0">
              <ReportGrid type="3D" data={reportMap} isLoading={isLoading} limits={limits} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}