import * as React from 'react';
import { ReportedIssue } from '../types';
import IssueCard from './IssueCard';

interface MyReportsProps {
  issues: ReportedIssue[];
  onSelectIssue: (issue: ReportedIssue) => void;
  residentId: string;
}

const MyReports: React.FC<MyReportsProps> = ({ issues, onSelectIssue, residentId }) => {
  const myIssues = issues.filter(issue => issue.residentId === residentId);

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reported Issues</h1>
      {myIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={() => onSelectIssue(issue)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-700">You haven't reported any issues yet.</h2>
          <p className="text-gray-500 mt-2">Use the "Report Issue" page to submit your first report.</p>
        </div>
      )}
    </div>
  );
};

export default MyReports;