import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function Reports() {
  const { userProgress, modules } = useStore();

  const reportData = [
    { training: 'GMP Fundamentals', user: 'John Student', score: 85, completed: '2024-01-15' },
    { training: '21 CFR Part 11', user: 'John Student', score: 92, completed: '2024-01-14' },
  ];

  return (
    <div className="space-y-6">
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">Training Reports</h1>
        <p className="text-muted-foreground">Generate and export training reports.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Select><SelectTrigger><SelectValue placeholder="Module" /></SelectTrigger><SelectContent><SelectItem value="all">All Modules</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="User" /></SelectTrigger><SelectContent><SelectItem value="all">All Users</SelectItem></SelectContent></Select>
            <Select><SelectTrigger><SelectValue placeholder="Date Range" /></SelectTrigger><SelectContent><SelectItem value="30">Last 30 days</SelectItem></SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Training Completion Report</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
            <Button variant="outline"><FileSpreadsheet className="h-4 w-4 mr-2" />Export Excel</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b"><th className="text-left py-2">Training</th><th className="text-left py-2">User</th><th className="text-left py-2">Score</th><th className="text-left py-2">Completed</th></tr></thead>
              <tbody>
                {reportData.map((row, i) => (
                  <tr key={i} className="border-b"><td className="py-2">{row.training}</td><td className="py-2">{row.user}</td><td className="py-2">{row.score}%</td><td className="py-2">{row.completed}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}