import * as React from 'react';
import { ReportedIssue, Department, IssueStatus, IssuePriority, ResidentRating, SentimentData, WardPerformance } from '../types';
import { MOCKED_COUNCILLORS } from '../constants';

export interface DepartmentalPerformance {
    name: Department;
    totalIssues: number;
    resolvedIssues: number;
    resolutionRate: number;
    avgResolutionTimeMs: number | null;
}

export const useExecutiveStats = (issues: ReportedIssue[], municipality: string) => {
    return React.useMemo(() => {
        const municipalIssues = issues.filter(i => i.municipality?.trim() === municipality?.trim());

        const totalIssues = municipalIssues.length;
        const resolvedIssuesList = municipalIssues.filter(i => i.status === IssueStatus.RESOLVED);
        const pendingIssuesList = municipalIssues.filter(i => i.status === IssueStatus.PENDING);
        const resolvedIssuesCount = resolvedIssuesList.length;

        // --- Overall KPIs ---
        const overallResolutionRate = totalIssues > 0 ? (resolvedIssuesCount / totalIssues) * 100 : 0;

        let totalResolutionTime = 0;
        let resolvedWithTime = 0;
        resolvedIssuesList.forEach(issue => {
            if (issue.resolvedAt) {
                totalResolutionTime += new Date(issue.resolvedAt).getTime() - new Date(issue.reportedAt).getTime();
                resolvedWithTime++;
            }
        });
        const overallAvgResolutionTimeMs = resolvedWithTime > 0 ? totalResolutionTime / resolvedWithTime : null;
        
        const openIssuesCount = municipalIssues.filter(i => i.status !== IssueStatus.RESOLVED).length;

        // --- Critical Hotspots ---
        const criticalIssues = municipalIssues.filter(i =>
            i.priority === IssuePriority.HIGH &&
            i.status !== IssueStatus.RESOLVED &&
            (new Date().getTime() - new Date(i.reportedAt).getTime()) > (3 * 86400000) // Older than 3 days
        ).sort((a,b) => new Date(a.reportedAt).getTime() - new Date(b.reportedAt).getTime());

        // --- Departmental Performance ---
        const statsByDepartment: Record<string, { total: number; resolved: number; timeSum: number; resolvedWithTime: number; }> = {};
        
        Object.values(Department).forEach(dept => {
            statsByDepartment[dept] = { total: 0, resolved: 0, timeSum: 0, resolvedWithTime: 0 };
        });

        municipalIssues.forEach(issue => {
            if (statsByDepartment[issue.department]) {
                statsByDepartment[issue.department].total++;
                if (issue.status === IssueStatus.RESOLVED) {
                    statsByDepartment[issue.department].resolved++;
                    if (issue.resolvedAt) {
                        statsByDepartment[issue.department].timeSum += new Date(issue.resolvedAt).getTime() - new Date(issue.reportedAt).getTime();
                        statsByDepartment[issue.department].resolvedWithTime++;
                    }
                }
            }
        });

        const departmentalPerformance: DepartmentalPerformance[] = Object.entries(statsByDepartment).map(([name, data]) => ({
            name: name as Department,
            totalIssues: data.total,
            resolvedIssues: data.resolved,
            resolutionRate: data.total > 0 ? (data.resolved / data.total) * 100 : 0,
            avgResolutionTimeMs: data.resolvedWithTime > 0 ? data.timeSum / data.resolvedWithTime : null,
        })).sort((a,b) => b.resolutionRate - a.resolutionRate);
        
        // --- Overall Sentiment ---
        const ratedIssues = resolvedIssuesList.filter(i => i.rating);
        const satisfied = ratedIssues.filter(i => i.rating === ResidentRating.SATISFIED).length;
        const unsatisfied = ratedIssues.filter(i => i.rating === ResidentRating.UNSATISFIED).length;
        const positivePercentage = ratedIssues.length > 0 ? (satisfied / ratedIssues.length) * 100 : 0;
        const overallSentiment: SentimentData = { satisfied, unsatisfied, positivePercentage };

        // --- Ward Performance ---
        const statsByWard: Record<number, { total: number; resolved: number; councillor: string; }> = {};
        municipalIssues.forEach(issue => {
            if (!statsByWard[issue.ward]) {
                statsByWard[issue.ward] = { total: 0, resolved: 0, councillor: issue.councillor };
            }
            statsByWard[issue.ward].total++;
            if (issue.status === IssueStatus.RESOLVED) {
                statsByWard[issue.ward].resolved++;
            }
        });

        const wardPerformance: WardPerformance[] = Object.entries(statsByWard).map(([ward, data]) => ({
            ward: Number(ward),
            councillor: data.councillor,
            totalIssues: data.total,
            resolutionRate: data.total > 0 ? (data.resolved / data.total) * 100 : 0,
        })).sort((a,b) => b.resolutionRate - a.resolutionRate);


        return {
            overallResolutionRate,
            overallAvgResolutionTimeMs,
            openIssuesCount,
            totalIssues,
            criticalIssues,
            departmentalPerformance,
            overallSentiment,
            wardPerformance,
        };

    }, [issues, municipality]);
};