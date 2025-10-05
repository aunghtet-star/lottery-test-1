import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/store/store';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { BetStatus } from '@shared/types';
const ITEMS_PER_PAGE = 10;
export function LedgerPage() {
  const bets = useAppStore((state) => state.bets);
  const agents = useAppStore((state) => state.agents);
  const isLoading = useAppStore((state) => state.isLoadingBets);
  const error = useAppStore((state) => state.error);
  const fetchBets = useAppStore((state) => state.fetchBets);
  const fetchAgents = useAppStore((state) => state.fetchAgents);
  const updateBetStatus = useAppStore((state) => state.updateBetStatus);
  const searchQuery = useAppStore((state) => state.searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (bets.length === 0) fetchBets();
    if (agents.length === 0) fetchAgents();
  }, [fetchBets, fetchAgents, bets.length, agents.length]);
  const agentsById = useMemo(() => new Map(agents.map(a => [a.id, a])), [agents]);
  const filteredBets = useMemo(() => {
    return bets.filter(bet => {
      const agentName = agentsById.get(bet.agentId)?.name || '';
      const searchLower = searchQuery.toLowerCase();
      return (
        agentName.toLowerCase().includes(searchLower) ||
        bet.number.includes(searchQuery) ||
        bet.id.toLowerCase().includes(searchLower)
      );
    });
  }, [bets, searchQuery, agentsById]);
  const paginatedBets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredBets, currentPage]);
  const totalPages = Math.ceil(filteredBets.length / ITEMS_PER_PAGE);
  const handleStatusUpdate = (betId: string, status: BetStatus) => {
    const promise = updateBetStatus(betId, status);
    toast.promise(promise, {
      loading: 'Updating status...',
      success: `Bet status updated to ${status}.`,
      error: 'Failed to update status.',
    });
  };
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={8}>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      );
    }
    if (paginatedBets.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center h-24">
            No transactions found.
          </TableCell>
        </TableRow>
      );
    }
    return paginatedBets.map((bet) => (
      <TableRow key={bet.id}>
        <TableCell className="font-medium">{bet.id.substring(0, 8)}...</TableCell>
        <TableCell>{agentsById.get(bet.agentId)?.name || 'Unknown Agent'}</TableCell>
        <TableCell><Badge variant="outline">{bet.type}</Badge></TableCell>
        <TableCell>{bet.number}</TableCell>
        <TableCell>{new Date(bet.timestamp).toLocaleString()}</TableCell>
        <TableCell>
          <Badge
            variant={
              bet.status === 'Won' ? 'default'
              : bet.status === 'Lost' ? 'destructive'
              : 'secondary'
            }
            className={bet.status === 'Won' ? 'bg-green-600/20 text-green-600 border-green-600/20' : ''}
          >
            {bet.status || 'Pending'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">${bet.amount.toFixed(2)}</TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-haspopup="true" size="icon" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleStatusUpdate(bet.id, 'Won')}>Mark as Won</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusUpdate(bet.id, 'Lost')}>Mark as Lost</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Ledger</CardTitle>
          <CardDescription>A complete log of all transactions and bets.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Game Type</TableHead>
                <TableHead>Number</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderContent()}
            </TableBody>
          </Table>
        </CardContent>
        <div className="flex items-center justify-end space-x-2 py-4 px-6 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}