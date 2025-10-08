import * as React from 'react';
import { ReportedIssue, IssueStatus, Department } from '../types';

export const useWorkerStats = (issues: ReportedIssue[], workerId: string, department: Department, municipality: string) => {
  return React.useMemo(() => {
    const myIssues = issues.filter(issue => issue.assignedTo === workerId);
    
    const activeTaskCount = myIssues.filter(i => i.status !== IssueStatus.RESOLVED).length;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const resolvedThisWeekCount = myIssues.filter(i => 
      i.status === IssueStatus.RESOLVED && 
      i.resolvedAt && 
      new Date(i.resolvedAt) > sevenDaysAgo
    ).length;

    // My Avg Resolution Time
    let myTotalResolutionTime = 0;
    let myResolvedWithTime = 0;
    myIssues.forEach(issue => {
      if (issue.status === IssueStatus.RESOLVED && issue.resolvedAt) {
        myTotalResolutionTime += new Date(issue.resolvedAt).getTime() - new Date(issue.reportedAt).getTime();
        myResolvedWithTime++;
      }
    });
    const avgResolutionTimeMs = myResolvedWithTime > 0 ? myTotalResolutionTime / myResolvedWithTime : null;
    
    // Department Avg Resolution Time
    const departmentIssues = issues.filter(i => i.department?.trim() === department?.trim() && i.municipality?.trim() === municipality?.trim());
    const departmentResolvedIssues = departmentIssues.filter(i => i.status === IssueStatus.RESOLVED && i.resolvedAt);
    let deptTotalResolutionTime = 0;
    departmentResolvedIssues.forEach(issue => {
        deptTotalResolutionTime += new Date(issue.resolvedAt!).getTime() - new Date(issue.reportedAt).getTime();
    });
    const departmentAvgResolutionTimeMs = departmentResolvedIssues.length > 0 ? deptTotalResolutionTime / departmentResolvedIssues.length : null;


    return {
      activeTaskCount,
      resolvedThisWeekCount,
      avgResolutionTimeMs,
      departmentAvgResolutionTimeMs,
    };
  }, [issues, workerId, department, municipality]);
};