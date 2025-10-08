import * as React from 'react';
// FIX: Completed CouncillorStats object to include missing properties (issuesOverTime, sentiment, categoryBreakdown) to match the type definition.
import { ReportedIssue, IssueStatus, CouncillorStats, TrendDataPoint, SentimentData, ResidentRating } from '../types';
import { MOCKED_COUNCILLORS } from '../constants';

export const useIssueStats = (issues: ReportedIssue[]) => {
  return React.useMemo(() => {
    const totalIssues = issues.length;
    const resolvedIssuesList = issues.filter(i => i.status === IssueStatus.RESOLVED);
    const pendingIssuesList = issues.filter(i => i.status === IssueStatus.PENDING);
    const inProgressIssuesList = issues.filter(i => i.status === IssueStatus.IN_PROGRESS);

    const resolvedIssues = resolvedIssuesList.length;
    const pendingIssues = pendingIssuesList.length;
    const inProgressIssues = inProgressIssuesList.length;
    
    const highPriorityPending = pendingIssuesList.filter(i => i.priority === 'High').length;

    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedWithTime = 0;
    resolvedIssuesList.forEach(issue => {
      if (issue.resolvedAt) {
        const reported = new Date(issue.reportedAt).getTime();
        const resolved = new Date(issue.resolvedAt).getTime();
        totalResolutionTime += (resolved - reported);
        resolvedWithTime++;
      }
    });
    const avgResolutionTimeMs = resolvedWithTime > 0 ? totalResolutionTime / resolvedWithTime : null;
    const cityResolutionRate = totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0;
    const cityAvgResolutionTimeMs = avgResolutionTimeMs;

    // Data for charts
    const issuesByStatus = [
      { name: IssueStatus.PENDING, count: pendingIssues },
      { name: IssueStatus.IN_PROGRESS, count: inProgressIssues },
      { name: IssueStatus.RESOLVED, count: resolvedIssues },
    ];

    const issuesByCategory = issues.reduce<Record<string, number>>((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1;
      return acc;
    }, {});

    const categoryChartData = Object.entries(issuesByCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
      
    // --- Overall Sentiment Analysis ---
    const ratedIssues = resolvedIssuesList.filter(i => i.rating);
    const satisfied = ratedIssues.filter(i => i.rating === ResidentRating.SATISFIED).length;
    const unsatisfied = ratedIssues.filter(i => i.rating === ResidentRating.UNSATISFIED).length;
    const positivePercentage = ratedIssues.length > 0 ? (satisfied / ratedIssues.length) * 100 : 0;
    const overallSentiment: SentimentData = { satisfied, unsatisfied, positivePercentage };

    // --- Overall Issue Trends (last 30 days) ---
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

    issues.forEach(issue => {
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

    // Councillor Stats
    const statsByCouncillor: Record<string, { 
      ward: number; 
      total: number; 
      resolved: number; 
      resolutionTimeSum: number; 
      resolvedWithTime: number; 
      issues: ReportedIssue[]; 
    }> = {};

    issues.forEach(issue => {
      if (!statsByCouncillor[issue.councillor]) {
        statsByCouncillor[issue.councillor] = {
          ward: issue.ward,
          total: 0,
          resolved: 0,
          resolutionTimeSum: 0,
          resolvedWithTime: 0,
          issues: []
        };
      }
      statsByCouncillor[issue.councillor].total++;
      statsByCouncillor[issue.councillor].issues.push(issue);
      if (issue.status === IssueStatus.RESOLVED) {
        statsByCouncillor[issue.councillor].resolved++;
        if (issue.resolvedAt) {
           const reported = new Date(issue.reportedAt).getTime();
           const resolved = new Date(issue.resolvedAt).getTime();
           statsByCouncillor[issue.councillor].resolutionTimeSum += (resolved - reported);
           statsByCouncillor[issue.councillor].resolvedWithTime++;
        }
      }
    });
    
    // Ensure all councillors are represented, even if they have 0 issues
    Object.entries(MOCKED_COUNCILLORS).forEach(([ward, name]) => {
      if (!statsByCouncillor[name]) {
         statsByCouncillor[name] = {
            ward: Number(ward),
            total: 0,
            resolved: 0,
            resolutionTimeSum: 0,
            resolvedWithTime: 0,
            issues: []
         };
      }
    });

    const councillorStats: CouncillorStats[] = Object.entries(statsByCouncillor).map(([name, data]) => {
      const resolutionRate = data.total > 0 ? (data.resolved / data.total) * 100 : 0;
      const avgTime = data.resolvedWithTime > 0 ? data.resolutionTimeSum / data.resolvedWithTime : null;
      
      const councillorIssues = data.issues;
      const resolvedCouncillorIssues = councillorIssues.filter(i => i.status === IssueStatus.RESOLVED);

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
  
      councillorIssues.forEach(issue => {
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
      const ratedIssues = resolvedCouncillorIssues.filter(i => i.rating);
      const satisfied = ratedIssues.filter(i => i.rating === ResidentRating.SATISFIED).length;
      const unsatisfied = ratedIssues.filter(i => i.rating === ResidentRating.UNSATISFIED).length;
      const positivePercentage = ratedIssues.length > 0 ? (satisfied / ratedIssues.length) * 100 : 0;
      const sentiment: SentimentData = { satisfied, unsatisfied, positivePercentage };
  
      // Category Breakdown
      const issuesByCategory = councillorIssues.reduce((acc, issue) => {
        acc[issue.category] = (acc[issue.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  
      const categoryBreakdown = Object.entries(issuesByCategory)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      return {
        councillor: name,
        ward: data.ward,
        totalIssues: data.total,
        resolvedIssues: data.resolved,
        resolutionRate: parseFloat(resolutionRate.toFixed(1)),
        avgResolutionTimeMs: avgTime,
        issuesOverTime,
        sentiment,
        categoryBreakdown,
        cityResolutionRate: parseFloat(cityResolutionRate.toFixed(1)),
        avgCityResolutionTimeMs: cityAvgResolutionTimeMs,
      };
    }).sort((a, b) => b.resolutionRate - a.resolutionRate || a.totalIssues - b.totalIssues);


    return {
      totalIssues,
      resolvedIssues,
      pendingIssues,
      inProgressIssues,
      highPriorityPending,
      avgResolutionTimeMs,
      issuesByStatus,
      categoryChartData,
      councillorStats,
      overallSentiment,
      issuesOverTime,
    };
  }, [issues]);
};