import * as React from 'react';
import { ReportedIssue, User, IssueStatus, ResidentRating } from '../types';

export const useResidentStats = (issues: ReportedIssue[], currentUser: User) => {
  return React.useMemo(() => {
    // --- Personal Stats ---
    const myIssues = issues.filter(i => i.residentId === currentUser.id);
    const myOpenIssues = myIssues.filter(i => i.status !== IssueStatus.RESOLVED).length;
    const myResolvedIssues = myIssues.filter(i => i.status === IssueStatus.RESOLVED);
    
    const myRatedIssues = myResolvedIssues.filter(i => i.rating);
    const mySatisfiedRatings = myRatedIssues.filter(i => i.rating === ResidentRating.SATISFIED).length;
    const mySatisfactionRate = myRatedIssues.length > 0 ? (mySatisfiedRatings / myRatedIssues.length) * 100 : null;

    // --- Ward Stats ---
    const wardIssues = issues.filter(i => i.ward === currentUser.ward);
    const totalWardIssues = wardIssues.length;
    const resolvedWardIssues = wardIssues.filter(i => i.status === IssueStatus.RESOLVED);
    const wardResolutionRate = totalWardIssues > 0 ? (resolvedWardIssues.length / totalWardIssues) * 100 : 0;
    
    let totalWardResolutionTime = 0;
    let resolvedWardWithTime = 0;
    resolvedWardIssues.forEach(issue => {
        if(issue.resolvedAt) {
            totalWardResolutionTime += new Date(issue.resolvedAt).getTime() - new Date(issue.reportedAt).getTime();
            resolvedWardWithTime++;
        }
    });
    const avgWardResolutionTimeMs = resolvedWardWithTime > 0 ? totalWardResolutionTime / resolvedWardWithTime : null;

    // --- City-wide Stats (for comparison) ---
    const totalCityIssues = issues.length;
    const resolvedCityIssues = issues.filter(i => i.status === IssueStatus.RESOLVED);
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


    return {
      myTotalIssues: myIssues.length,
      myOpenIssues,
      myResolvedIssuesCount: myResolvedIssues.length,
      mySatisfactionRate,
      wardResolutionRate,
      avgWardResolutionTimeMs,
      cityResolutionRate,
      avgCityResolutionTimeMs
    };
  }, [issues, currentUser]);
};