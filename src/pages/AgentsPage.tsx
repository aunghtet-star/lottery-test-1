import { useEffect, useMemo, useState } from 'react';
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
import { AddAgentDialog } from '@/components/AddAgentDialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
const ITEMS_PER_PAGE = 10;
export function AgentsPage() {
  const agents = useAppStore((state) => state.agents);
  const bets = useAppStore((state) => state.bets);
  const isLoadingAgents = useAppStore((state) => state.isLoadingAgents);
  const isLoadingBets = useAppStore((state) => state.isLoadingBets);
  const error = useAppStore((state) => state.error);
  const fetchAgents = useAppStore((state) => state.fetchAgents);
  const fetchBets = useAppStore((state) => state.fetchBets);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    if (agents.length === 0) fetchAgents();
    if (bets.length === 0) fetchBets();
  }, [fetchAgents, fetchBets, agents.length, bets.length]);
  const agentSales = useMemo(() => {
    const salesMap = new Map<string, number>();
    bets.forEach(bet => {
      salesMap.set(bet.agentId, (salesMap.get(bet.agentId) || 0) + bet.amount);
    });
    return salesMap;
  }, [bets]);
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return agents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [agents, currentPage]);
  const totalPages = Math.ceil(agents.length / ITEMS_PER_PAGE);
  const isLoading = isLoadingAgents || isLoadingBets;
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
        </TableRow>
      ));
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5}>
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </TableCell>
        </TableRow>
      );
    }
    if (paginatedAgents.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center h-24">
            No agents found. Add one to get started.
          </TableCell>
        </TableRow>
      );
    }
    return paginatedAgents.map((agent) => (
      <TableRow key={agent.id}>
        <TableCell className="font-medium">{agent.id.substring(0, 8)}...</TableCell>
        <TableCell>{agent.name}</TableCell>
        <TableCell>
          <Badge
            variant={agent.status === 'active' ? 'default' : 'outline'}
            className={agent.status === 'active' ? 'bg-green-600/20 text-green-600 border-green-600/20' : ''}
          >
            {agent.status}
          </Badge>
        </TableCell>
        <TableCell>{agent.commissionRate}%</TableCell>
        <TableCell className="text-right">${(agentSales.get(agent.id) || 0).toFixed(2)}</TableCell>
      </TableRow>
    ));
  };
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Management</h2>
          <p className="text-muted-foreground">Manage your network of sub-agents and sellers.</p>
        </div>
        <AddAgentDialog />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Agent List</CardTitle>
          <CardDescription>View, edit, and manage your agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
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