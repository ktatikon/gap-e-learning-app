import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useReportingDashboard, useReportGenerator, useOverdueTrainingReport } from "@/hooks/useReports";
import { Download, FileText, Users, TrendingUp, Calendar, AlertTriangle, CheckCircle2, Loader2, Shield } from "lucide-react";

export default function Reports() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // Today
  });
  const [selectedReportType, setSelectedReportType] = useState('training-records');

  // Get reporting data
  const {
    trainingRecords,
    certificates,
    overdueTraining,
    summary,
    isLoading,
    hasError,
    canViewReports,
    refetchAll
  } = useReportingDashboard(dateRange);

  const {
    generateTrainingReport,
    generateCertificateReport,
    generateOverdueReport,
    isGenerating
  } = useReportGenerator();

  if (!canViewReports) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Access denied. Admin or compliance role required.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gxp-card">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Compliance Reports
        </h1>
        <p className="text-muted-foreground">
          Generate comprehensive training and compliance reports for regulatory requirements.
        </p>
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{summary.total_users}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{summary.completed_trainings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{summary.overdue_trainings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                  <p className="text-2xl font-bold">{summary.completion_rate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Configure report parameters and date ranges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="training-records">Training Records</SelectItem>
                  <SelectItem value="certificates">Completion Certificates</SelectItem>
                  <SelectItem value="overdue">Overdue Training</SelectItem>
                  <SelectItem value="audit">Audit Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={refetchAll} className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Training Records Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Training Records
            </CardTitle>
            <CardDescription>
              Complete training enrollment and completion records
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Total Records: {trainingRecords.length}</p>
              <p>Date Range: {dateRange.startDate} to {dateRange.endDate}</p>
            </div>
            <Button
              onClick={() => generateTrainingReport(dateRange)}
              disabled={isGenerating}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Export Training Records'}
            </Button>
          </CardContent>
        </Card>

        {/* Completion Certificates Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Completion Certificates
            </CardTitle>
            <CardDescription>
              Verified training completions with electronic signatures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Certificates: {certificates.length}</p>
              <p>Signature Compliance: {summary?.signature_compliance || 0}%</p>
            </div>
            <Button
              onClick={() => generateCertificateReport(dateRange)}
              disabled={isGenerating}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Export Certificates'}
            </Button>
          </CardContent>
        </Card>

        {/* Overdue Training Report */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue Training
            </CardTitle>
            <CardDescription>
              Mandatory training past due dates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Overdue Items: {overdueTraining.length}</p>
              <p>Requires Immediate Attention</p>
            </div>
            <Button
              onClick={generateOverdueReport}
              disabled={isGenerating}
              className="w-full"
              variant={overdueTraining.length > 0 ? "destructive" : "default"}
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Export Overdue Report'}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Reports
            </CardTitle>
            <CardDescription>
              Pre-configured compliance reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const lastMonth = new Date();
                lastMonth.setMonth(lastMonth.getMonth() - 1);
                setDateRange({
                  startDate: lastMonth.toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                });
              }}
            >
              Last 30 Days Report
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const lastQuarter = new Date();
                lastQuarter.setMonth(lastQuarter.getMonth() - 3);
                setDateRange({
                  startDate: lastQuarter.toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                });
              }}
            >
              Quarterly Report
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const lastYear = new Date();
                lastYear.setFullYear(lastYear.getFullYear() - 1);
                setDateRange({
                  startDate: lastYear.toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0]
                });
              }}
            >
              Annual Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
