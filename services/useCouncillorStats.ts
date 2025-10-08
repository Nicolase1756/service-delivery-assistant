import * as React from 'react';
import { ReportedIssue, IssueStatus, CouncillorStats, ResidentRating, TrendDataPoint, SentimentData } from '../types';

export const useCouncillorStats = (issues: ReportedIssue[], ward: number, municipality: string, councillorName: string): CouncillorStats | null => {
  return React.useMemo(() => {
    if (!ward || !municipality) return null;

    const municipalIssues = issues.filter(i => i.municipality?.trim() === municipality?.trim());
    const wardIssues = municipalIssues.filter(i => i.ward === ward);

    const totalIssues = wardIssues.length;
    const resolvedIssuesList = wardIssues.filter(i => i.status === IssueStatus.RESOLVED);
    const resolvedIssues = resolvedIssuesList.length;
    const resolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
    
    // Average Resolution Time (Ward)
    let totalResolutionTime = 0;
    let resolvedWithTime = 0;
    resolvedIssuesList.forEach(issue => {
      if (issue.resolvedAt) {
        totalResolutionTime += new Date(issue.resolvedAt).getTime() - new Date(issue.reportedAt).getTime();
        resolvedWithTime++;
      }
    });
    const avgResolutionTimeMs = resolvedWithTime > 0 ? totalResolutionTime / resolvedWithTime : null;

    // --- Municipality-wide Stats (for comparison) ---
    const totalCityIssues = municipalIssues.length;
    const resolvedCityIssues = municipalIssues.filter(i => i.status === IssueStatus.RESOLVED);
    const cityResolutionRate = totalCityIssues > 0 ? (resolvedCityIssues.length / totalCityIssues) * 100 : 0;

    let totalCityResolutionTime = 0;
    let resolvedCityWithTime = 0;
    resolvedCityIssues.forEach(issue => {
        if(issue.resolvedAt) {
            totalCityResolutionTime += new Date(issue.resolvedAt).getTime() - new Date(issue.reportedAt).getTime();
            resolvedCityWithTime++;
        }
    });
    const avgCityResolutionTimeMs = resolvedCityWithTime > 0 ? totalCityResolutionTime / resolvedCityWithTime : null;


    // Issue Trends (last 30 days)
    const issuesOverTime: TrendDataPoint[] = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyData: Record<string, { Reported: number; Resolved: number }> = {};

    for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
        dailyData[dateString] = { Reported: 0, Resolved: 0 };
    }

    wardIssues.forEach(issue => {
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
        issuesOverTime.push({ date: new Date(date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}), ...counts });
    });
    issuesOverTime.reverse();


    // Sentiment Analysis
    const ratedIssues = resolvedIssuesList.filter(i => i.rating);
    const satisfied = ratedIssues.filter(i => i.rating === ResidentRating.SATISFIED).length;
    const unsatisfied = ratedIssues.filter(i => i.rating === ResidentRating.UNSATISFIED).length;
    const positivePercentage = ratedIssues.length > 0 ? (satisfied / ratedIssues.length) * 100 : 0;
    const sentiment: SentimentData = { satisfied, unsatisfied, positivePercentage };

    // Category Breakdown
    const issuesByCategory = wardIssues.reduce<Record<string, number>>((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});

    const categoryBreakdown = Object.entries(issuesByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      councillor: councillorName,
      ward,
      totalIssues,
      resolvedIssues,
      resolutionRate,
      avgResolutionTimeMs,
      issuesOverTime,
      sentiment,
      categoryBreakdown,
      cityResolutionRate,
      avgCityResolutionTimeMs,
    };
  }, [issues, ward, municipality, councillorName]);
};