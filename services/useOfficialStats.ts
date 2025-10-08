import * as React from 'react';
import { ReportedIssue, User, Role, IssueStatus, IssuePriority, DepartmentTrendDataPoint } from '../types';

export interface WorkerStats {
    id: string;
    name: string;
    activeIssuesCount: number;
    resolvedLast7DaysCount: number;
}

export const useOfficialStats = (issues: ReportedIssue[], users: User[], department: string, municipality: string) => {
  return React.useMemo(() => {
    const departmentIssues = issues.filter(issue => issue.department?.trim() === department?.trim() && issue.municipality?.trim() === municipality?.trim());
    const departmentWorkers = users.filter(user => user.role === Role.MUNICIPAL_WORKER && user.department?.trim() === department?.trim() && user.municipality?.trim() === municipality?.trim());

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const workerPerformance: WorkerStats[] = departmentWorkers.map(worker => {
      const assignedIssues = departmentIssues.filter(issue => issue.assignedTo === worker.id);
      
      const activeIssuesCount = assignedIssues.filter(issue => issue.status !== IssueStatus.RESOLVED).length;
      
      const resolvedLast7DaysCount = assignedIssues.filter(issue => 
        issue.status === IssueStatus.RESOLVED && 
        issue.resolvedAt && 
        new Date(issue.resolvedAt) > sevenDaysAgo
      ).length;

      return {
        id: worker.id,
        name: worker.name,
        activeIssuesCount,
        resolvedLast7DaysCount,
      };
    }).sort((a, b) => b.activeIssuesCount - a.activeIssuesCount || a.name.localeCompare(b.name));
    
    // Pending issues by priority
    const pendingIssues = departmentIssues.filter(i => i.status === IssueStatus.PENDING);
    const pendingByPriority = [
        { name: IssuePriority.HIGH, count: pendingIssues.filter(i => i.priority === IssuePriority.HIGH).length },
        { name: IssuePriority.MEDIUM, count: pendingIssues.filter(i => i.priority === IssuePriority.MEDIUM).length },
        { name: IssuePriority.LOW, count: pendingIssues.filter(i => i.priority === IssuePriority.LOW).length },
    ].filter(p => p.count > 0);


    // Historical Performance (last 30 days)
    const historicalPerformance: DepartmentTrendDataPoint[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyData: Record<string, { Reported: number; Resolved: number }> = {};

    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        dailyData[dateString] = { Reported: 0, Resolved: 0 };
    }

    departmentIssues.forEach(issue => {
        const reportedDate = new Date(issue.reportedAt);
        if (reportedDate >= thirtyDaysAgo) {
            const dateString = reportedDate.toLocaleDateString('en-CA');
            if (dailyData[dateString]) {
                dailyData[dateString].Reported++;
            }
        }
        if (issue.resolvedAt) {
            const resolvedDate = new Date(issue.resolvedAt);
            if (resolvedDate >= thirtyDaysAgo) {
                const dateString = resolvedDate.toLocaleDateString('en-CA');
                 if (dailyData[dateString]) {
                    dailyData[dateString].Resolved++;
                }
            }
        }
    });

    Object.entries(dailyData).forEach(([date, counts]) => {
        historicalPerformance.push({ date: new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), ...counts });
    });
    historicalPerformance.reverse();


    return {
        workerPerformance,
        pendingByPriority,
        historicalPerformance,
    };

  }, [issues, users, department, municipality]);
};