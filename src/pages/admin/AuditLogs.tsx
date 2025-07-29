import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { Shield } from 'lucide-react';

export default function AuditLogs() {
  const { auditLogs } = useStore();

  return (
    <div className="space-y-6">
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">Review system activities and compliance events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input placeholder="Search logs..." />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Timestamp</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Module</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-2">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-2">{log.action.replace('_', ' ').toUpperCase()}</td>
                    <td className="py-2">{log.moduleId || 'System'}</td>
                    <td className="py-2">{log.userId}</td>
                    <td className="py-2 font-mono">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}