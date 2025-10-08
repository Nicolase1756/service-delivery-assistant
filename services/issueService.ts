
import { ReportedIssue, IssueStatus, IssueCategory, IssuePriority, HistoryEventType, ResidentRating, HistoryEvent, Department } from '../types';
import { MOCKED_COUNCILLORS, CATEGORY_DEPARTMENT_MAP } from '../constants';

const ISSUES_STORAGE_KEY = 'service-delivery-issues';

const generateMockIssues = (): ReportedIssue[] => {
  const issues: ReportedIssue[] = [
    { 
      id: '1', 
      category: IssueCategory.POTHOLE, 
      description: 'Large pothole on Main St', 
      location: '123 Main St', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.RESOLVED, 
      priority: IssuePriority.MEDIUM, 
      reportedAt: new Date(Date.now() - 86400000 * 5).toISOString(), 
      resolvedAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
      residentId: 'user-2', 
      municipality: 'Mangaung Metropolitan Municipality',
      ward: 1, 
      councillor: MOCKED_COUNCILLORS[1],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.POTHOLE],
      history: [
        { id: 'h1-1', timestamp: new Date(Date.now() - 86400000 * 5).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'},
        { id: 'h1-2', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), type: HistoryEventType.STATUS_CHANGED, user: 'Municipality', details: `Status changed to ${IssueStatus.RESOLVED}.`},
        { id: 'h1-3', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.RATED, user: 'Resident', details: `Resident rated this as ${ResidentRating.SATISFIED}.`},
      ],
      rating: ResidentRating.SATISFIED,
      assignedTo: 'worker-2',
    },
    { 
      id: '2', 
      category: IssueCategory.WATER, 
      description: 'Water pipe leaking for 3 days', 
      location: '456 Oak Ave', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.IN_PROGRESS, 
      priority: IssuePriority.HIGH, 
      reportedAt: new Date(Date.now() - 86400000 * 3).toISOString(), 
      residentId: 'user-3', 
      municipality: 'Dihlabeng Local Municipality',
      ward: 2, 
      councillor: MOCKED_COUNCILLORS[2],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.WATER],
      history: [
        { id: 'h2-1', timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'},
        { id: 'h2-2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.STATUS_CHANGED, user: 'Municipality', details: `Status changed to ${IssueStatus.IN_PROGRESS}.`},
      ],
      rating: null,
      assignedTo: 'worker-1',
    },
    { 
      id: '3', 
      category: IssueCategory.ELECTRICITY, 
      description: 'Street light is out', 
      location: 'Corner of Pine and Maple', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.PENDING, 
      priority: IssuePriority.MEDIUM, 
      reportedAt: new Date(Date.now() - 86400000 * 1).toISOString(), 
      residentId: 'user-1', 
      municipality: 'Mangaung Metropolitan Municipality',
      ward: 1, 
      councillor: MOCKED_COUNCILLORS[1],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.ELECTRICITY],
      history: [
        { id: 'h3-1', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'}
      ],
      rating: null,
      assignedTo: null,
    },
    { 
      id: '4', 
      category: IssueCategory.WASTE, 
      description: 'Waste not collected this week', 
      location: '789 Birch Rd', 
      photoBase64: null, 
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.PENDING, 
      priority: IssuePriority.LOW, 
      reportedAt: new Date().toISOString(), 
      residentId: 'user-4', 
      municipality: 'Dihlabeng Local Municipality',
      ward: 3, 
      councillor: MOCKED_COUNCILLORS[3],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.WASTE],
      history: [
        { id: 'h4-1', timestamp: new Date().toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'}
      ],
      rating: null,
      assignedTo: null,
    },
     { 
      id: '5', 
      category: IssueCategory.WATER, 
      description: 'No water in the area', 
      location: 'Willow Creek', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.PENDING, 
      priority: IssuePriority.HIGH, 
      reportedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), 
      residentId: 'user-1', 
      municipality: 'Mangaung Metropolitan Municipality',
      ward: 2, 
      councillor: MOCKED_COUNCILLORS[2],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.WATER],
      history: [
        { id: 'h5-1', timestamp: new Date(Date.now() - 86400000 * 0.5).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'}
      ],
      rating: null,
      assignedTo: null,
    },
    { 
      id: '6', 
      category: IssueCategory.POTHOLE, 
      description: 'Pothole causing traffic issues near the university', 
      location: 'Nelson Mandela Dr, Bloemfontein', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.IN_PROGRESS, 
      priority: IssuePriority.MEDIUM, 
      reportedAt: new Date(Date.now() - 86400000 * 2).toISOString(), 
      residentId: 'user-1', 
      municipality: 'Mangaung Metropolitan Municipality',
      ward: 1, 
      councillor: MOCKED_COUNCILLORS[1],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.POTHOLE],
      history: [
          { id: 'h6-1', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'},
          { id: 'h6-2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.ASSIGNED, user: 'System', details: 'Issue assigned to Geordi La Forge.'},
          { id: 'h6-3', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.STATUS_CHANGED, user: 'System', details: 'Status changed to In Progress.'},
      ],
      rating: null,
      assignedTo: 'worker-2',
    },
    { 
      id: '7', 
      category: IssueCategory.TRAFFIC_SIGNAL, 
      description: 'Traffic signal at cnr. of Zastron and West Burger is stuck on red.', 
      location: 'Zastron St & West Burger St, Bloemfontein', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.PENDING, 
      priority: IssuePriority.HIGH, 
      reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      residentId: 'user-2', 
      municipality: 'Mangaung Metropolitan Municipality',
      ward: 2, 
      councillor: MOCKED_COUNCILLORS[2],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.TRAFFIC_SIGNAL],
      history: [
          { id: 'h7-1', timestamp: new Date(Date.now() - 3600000 * 4).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'}
      ],
      rating: null,
      assignedTo: null,
    },
    { 
      id: '8', 
      category: IssueCategory.ELECTRICITY, 
      description: 'Power outage in Phuthaditjhaba Industrial area.', 
      location: 'Phuthaditjhaba Industrial, Dihlabeng', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.PENDING, 
      priority: IssuePriority.HIGH, 
      reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      residentId: 'user-3', 
      municipality: 'Dihlabeng Local Municipality',
      ward: 3, 
      councillor: MOCKED_COUNCILLORS[3],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.ELECTRICITY],
      history: [
          { id: 'h8-1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'}
      ],
      rating: null,
      assignedTo: null,
    },
    { 
      id: '9', 
      category: IssueCategory.PARKS_AND_REC, 
      description: 'Broken swing at the Bethlehem town park.', 
      location: 'Bethlehem Central Park', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.PENDING, 
      priority: IssuePriority.LOW, 
      reportedAt: new Date(Date.now() - 86400000 * 1).toISOString(), 
      residentId: 'user-4', 
      municipality: 'Dihlabeng Local Municipality',
      ward: 4, 
      councillor: MOCKED_COUNCILLORS[4],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.PARKS_AND_REC],
      history: [
          { id: 'h9-1', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'}
      ],
      rating: null,
      assignedTo: null,
    },
    { 
      id: '10', 
      category: IssueCategory.SEWAGE, 
      description: 'Sewage drain overflowing in Batho location.', 
      location: 'Batho Community, Mangaung', 
      photoBase64: null,
      beforeWorkPhotoBase64: null,
      afterWorkPhotoBase64: null,
      status: IssueStatus.IN_PROGRESS, 
      priority: IssuePriority.HIGH, 
      reportedAt: new Date(Date.now() - 86400000 * 4).toISOString(), 
      residentId: 'user-1', 
      municipality: 'Mangaung Metropolitan Municipality',
      ward: 1, 
      councillor: MOCKED_COUNCILLORS[1],
      department: CATEGORY_DEPARTMENT_MAP[IssueCategory.SEWAGE],
      history: [
          { id: 'h10-1', timestamp: new Date(Date.now() - 86400000 * 4).toISOString(), type: HistoryEventType.CREATED, user: 'System', details: 'Issue reported.'},
          { id: 'h10-2', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.ASSIGNED, user: 'System', details: 'Issue assigned to Miles O\'Brien.'},
          { id: 'h10-3', timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), type: HistoryEventType.STATUS_CHANGED, user: 'System', details: 'Status changed to In Progress.'},
      ],
      rating: null,
      assignedTo: 'worker-1',
    }
  ];
  return issues;
};

export const getIssues = (): ReportedIssue[] => {
  try {
    const issuesJson = localStorage.getItem(ISSUES_STORAGE_KEY);
    if (!issuesJson) {
      const mockIssues = generateMockIssues();
      localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(mockIssues));
      return mockIssues;
    }
    return JSON.parse(issuesJson);
  } catch (error) {
    console.error("Failed to parse issues from localStorage", error);
    return [];
  }
};

export const saveIssues = (issues: ReportedIssue[]): void => {
  try {
    const issuesJson = JSON.stringify(issues);
    localStorage.setItem(ISSUES_STORAGE_KEY, issuesJson);
  } catch (error) {
    console.error("Failed to save issues to localStorage", error);
  }
};

const updateIssue = (id: string, updateFn: (issue: ReportedIssue) => ReportedIssue): ReportedIssue | undefined => {
    const allIssues = getIssues();
    const issueIndex = allIssues.findIndex(issue => issue.id === id);
    if (issueIndex !== -1) {
        allIssues[issueIndex] = updateFn(allIssues[issueIndex]);
        saveIssues(allIssues);
        return allIssues[issueIndex];
    }
    return undefined;
}


export const addIssue = (issue: Omit<ReportedIssue, 'id' | 'reportedAt' | 'status' | 'councillor' | 'history' | 'rating' | 'assignedTo' | 'department' | 'beforeWorkPhotoBase64' | 'afterWorkPhotoBase64'>): ReportedIssue => {
  const allIssues = getIssues();
  const councillor = MOCKED_COUNCILLORS[issue.ward] || 'Unknown';
  const now = new Date().toISOString();
  const newIssue: ReportedIssue = {
    ...issue,
    id: new Date().getTime().toString(),
    reportedAt: now,
    status: IssueStatus.PENDING,
    councillor,
    department: CATEGORY_DEPARTMENT_MAP[issue.category],
    history: [{
        id: `hist-${Date.now()}`,
        timestamp: now,
        type: HistoryEventType.CREATED,
        user: 'System',
        details: 'Issue reported.'
    }],
    rating: null,
    assignedTo: null,
    beforeWorkPhotoBase64: null,
    afterWorkPhotoBase64: null,
  };
  const updatedIssues = [newIssue, ...allIssues];
  saveIssues(updatedIssues);
  return newIssue;
};

export const updateIssueStatus = (id: string, status: IssueStatus, workerName?: string): ReportedIssue | undefined => {
    return updateIssue(id, issue => {
        issue.status = status;
        if (status === IssueStatus.RESOLVED) {
            issue.resolvedAt = new Date().toISOString();
        }
        issue.history.push({
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: HistoryEventType.STATUS_CHANGED,
            user: 'Municipality',
            details: `Status changed to ${status}${workerName ? ` by ${workerName}`: ''}.`
        });
        return issue;
    });
};

export const assignIssueToWorker = (id: string, workerId: string, workerName: string): ReportedIssue | undefined => {
    return updateIssue(id, issue => {
        issue.assignedTo = workerId;
        issue.status = IssueStatus.IN_PROGRESS; // Automatically set to In Progress on assignment
        issue.history.push({
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: HistoryEventType.ASSIGNED,
            user: 'System',
            details: `Issue assigned to ${workerName}.`
        });
         issue.history.push({
            id: `hist-${Date.now()}-status`,
            timestamp: new Date().toISOString(),
            type: HistoryEventType.STATUS_CHANGED,
            user: 'System',
            details: `Status changed to ${IssueStatus.IN_PROGRESS}.`
        });
        return issue;
    });
}

export const addWorkPhoto = (id: string, photoBase64: string, type: 'before' | 'after', workerName: string): ReportedIssue | undefined => {
    return updateIssue(id, issue => {
        const photoType = type === 'before' ? 'beforeWorkPhotoBase64' : 'afterWorkPhotoBase64';
        const photoTypeName = type === 'before' ? 'Before Work' : 'After Work';
        issue[photoType] = photoBase64;

        issue.history.push({
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: HistoryEventType.PHOTO_ADDED,
            user: 'Municipality',
            details: `${photoTypeName} photo added by ${workerName}.`
        });
        return issue;
    });
}


export const addComment = (id: string, comment: string, user: 'Resident' | 'Municipality'): ReportedIssue | undefined => {
    return updateIssue(id, issue => {
        issue.history.push({
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: HistoryEventType.COMMENT,
            user: user,
            details: comment
        });
        return issue;
    });
}

export const updateIssueRating = (id: string, rating: ResidentRating): ReportedIssue | undefined => {
    return updateIssue(id, issue => {
        issue.rating = rating;
        issue.history.push({
            id: `hist-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: HistoryEventType.RATED,
            user: 'Resident',
            details: `Resident rated this as ${rating}.`
        });
        return issue;
    });
}
