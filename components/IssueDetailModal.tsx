import * as React from 'react';
import { ReportedIssue, IssueStatus, HistoryEvent, HistoryEventType, ResidentRating, User, Role } from '../types';
import Icon from './Icon';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CameraCapture from './CameraCapture';

interface IssueDetailModalProps {
  issue: ReportedIssue | null;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onStatusChange?: (id: string, status: IssueStatus) => void;
  onAddComment?: (id: string, comment: string) => void;
  onRateIssue?: (id: string, rating: ResidentRating) => void;
  onAssignIssue?: (id: string) => void; // For worker assigning to self
  onAssignIssueByOfficial?: (issueId: string, workerId: string, workerName: string) => void; // For official assigning to a worker
  onAddWorkPhoto?: (issueId: string, photoBase64: string, type: 'before' | 'after') => void;
}

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
}

const HistoryEventItem: React.FC<{event: HistoryEvent}> = ({ event }) => {
    const isComment = event.type === HistoryEventType.COMMENT;
    const isResidentComment = isComment && event.user === 'Resident';
    const isMunicipalityComment = isComment && event.user === 'Municipality';

    if (isComment) {
        return (
             <div className={`flex items-start gap-3 ${isResidentComment ? 'justify-start' : 'justify-end'}`}>
                {isResidentComment && <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">R</div>}
                <div className={`p-3 rounded-lg max-w-xs ${isResidentComment ? 'bg-blue-50' : 'bg-gray-100'}`}>
                    <p className="text-sm text-gray-800">{event.details}</p>
                    <p className="text-xs text-gray-400 mt-1 text-right">{timeAgo(event.timestamp)}</p>
                </div>
                {isMunicipalityComment && <div className="w-8 h-8 rounded-full bg-sa-green text-white flex items-center justify-center font-bold text-sm flex-shrink-0">M</div>}
            </div>
        )
    }

    return (
        <div className="text-center my-2">
            <p className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded-full">
                {event.details} - <span className="font-semibold">{event.user}</span>, {timeAgo(event.timestamp)}
            </p>
        </div>
    )
}

const CommentForm: React.FC<{issueId: string; onAddComment: (id: string, comment: string) => void}> = ({issueId, onAddComment}) => {
    const [comment, setComment] = React.useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(comment.trim()) {
            onAddComment(issueId, comment.trim());
            setComment('');
        }
    }
    return (
         <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                className="flex-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sa-green focus:border-sa-green"
                placeholder="Add a comment..."
            />
            <button type="submit" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green">
                Send
            </button>
        </form>
    )
}

const RatingForm: React.FC<{issueId: string; onRateIssue: (id: string, rating: ResidentRating) => void}> = ({issueId, onRateIssue}) => {
    return (
        <div className="mt-6 border-t pt-4 text-center bg-yellow-50 p-4 rounded-lg">
            <p className="font-semibold text-gray-800">Are you satisfied with the resolution?</p>
            <p className="text-sm text-gray-600 mb-3">Your feedback helps improve our services.</p>
            <div className="flex justify-center gap-4">
                 <button 
                    onClick={() => onRateIssue(issueId, ResidentRating.SATISFIED)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    👍 Satisfied
                </button>
                 <button 
                    onClick={() => onRateIssue(issueId, ResidentRating.UNSATISFIED)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    👎 Unsatisfied
                </button>
            </div>
        </div>
    )
}


const IssueDetailModal: React.FC<IssueDetailModalProps> = ({ issue, onClose, currentUser, allUsers, onStatusChange, onAddComment, onRateIssue, onAssignIssue, onAssignIssueByOfficial, onAddWorkPhoto }) => {
  const [selectedWorkerId, setSelectedWorkerId] = React.useState<string>('');
  const [isCameraOpen, setIsCameraOpen] = React.useState(false);
  const [cameraMode, setCameraMode] = React.useState<'before' | 'after'>('before');


  if (!issue) return null;
  
  const isAssignedWorker = issue.assignedTo === currentUser.id;

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as IssueStatus;

    if (
      isAssignedWorker &&
      newStatus === IssueStatus.RESOLVED &&
      !issue.afterWorkPhotoBase64
    ) {
      alert("Please upload an 'After Work' photo before marking the issue as resolved.");
      // Reset the select to its original value to prevent change
      e.target.value = issue.status; 
      return;
    }

    if (onStatusChange) {
      onStatusChange(issue.id, newStatus);
    }
  };
  
  const handleTakePhoto = (mode: 'before' | 'after') => {
    setCameraMode(mode);
    setIsCameraOpen(true);
  }

  const handleCapturePhoto = (photoBase64: string) => {
    if (onAddWorkPhoto) {
        onAddWorkPhoto(issue.id, photoBase64, cameraMode);
    }
    setIsCameraOpen(false);
  }

  const isCurrentUserReporter = issue.residentId === currentUser.id;
  const canUpdateStatus = currentUser.role === Role.MUNICIPAL_OFFICIAL || isAssignedWorker;
  
  const canWorkerSelfAssign = currentUser.role === Role.MUNICIPAL_WORKER && !issue.assignedTo && issue.status === IssueStatus.PENDING && issue.department === currentUser.department;

  const isDeptOfficial = currentUser.role === Role.MUNICIPAL_OFFICIAL && issue.department === currentUser.department;
  const canOfficialAssign = isDeptOfficial && !issue.assignedTo;
  const departmentWorkers = allUsers.filter(u => u.role === Role.MUNICIPAL_WORKER && u.department === issue.department);

  const handleOfficialAssign = () => {
      if (onAssignIssueByOfficial && selectedWorkerId) {
          const worker = allUsers.find(u => u.id === selectedWorkerId);
          if (worker) {
              onAssignIssueByOfficial(issue.id, worker.id, worker.name);
          }
      }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      {isCameraOpen && <CameraCapture onCapture={handleCapturePhoto} onClose={() => setIsCameraOpen(false)} />}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative flex flex-col" style={{maxHeight: '90vh'}} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="p-6 border-b">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-sa-green/10 text-sa-green flex items-center justify-center">
                    <Icon category={issue.category} className="h-8 w-8" />
                </div>
                <div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900">{issue.category}</h2>
                        <StatusBadge status={issue.status} />
                        <PriorityBadge priority={issue.priority} />
                    </div>
                     <p className="text-sm font-medium text-gray-500 mt-1">
                        Department: <span className="text-gray-900">{issue.department}</span>
                    </p>
                </div>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm">
                 <div className="sm:col-span-2">
                    <dt className="font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-gray-900">{issue.description}</dd>
                </div>
                <div>
                    <dt className="font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-gray-900">{issue.location}</dd>
                </div>
                 <div>
                    <dt className="font-medium text-gray-500">Ward / Councillor</dt>
                    <dd className="mt-1 text-gray-900">Ward {issue.ward} ({issue.councillor})</dd>
                </div>
            </dl>
             {issue.photoBase64 && (
                <div className="mt-4">
                    <dt className="text-sm font-medium text-gray-500">Photo Evidence from Resident</dt>
                    <dd className="mt-1">
                        <img src={issue.photoBase64} alt="Issue evidence" className="rounded-lg w-full h-auto object-cover max-h-48" />
                    </dd>
                </div>
            )}
             {isAssignedWorker && (
                <div className="mt-4 border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Work Evidence</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <p className="font-semibold">Before Work</p>
                            {issue.beforeWorkPhotoBase64 ? (
                                <img src={issue.beforeWorkPhotoBase64} alt="Before work" className="mt-2 rounded-lg w-full h-auto object-cover"/>
                            ) : (
                                <div className="mt-2 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-full bg-gray-50">
                                  <p className="text-xs text-gray-500 mb-2">No photo uploaded</p>
                                  <button onClick={() => handleTakePhoto('before')} className="inline-flex items-center gap-2 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sa-blue hover:bg-sa-blue/90">
                                    📷 Take Photo
                                  </button>
                                </div>
                            )}
                        </div>
                         <div className="text-center">
                            <p className="font-semibold">After Work</p>
                            {issue.afterWorkPhotoBase64 ? (
                                <img src={issue.afterWorkPhotoBase64} alt="After work" className="mt-2 rounded-lg w-full h-auto object-cover"/>
                            ) : (
                                <div className="mt-2 p-4 border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-full bg-gray-50">
                                  <p className="text-xs text-gray-500 mb-2">No photo uploaded</p>
                                  <button 
                                      onClick={() => handleTakePhoto('after')} 
                                      disabled={!issue.beforeWorkPhotoBase64}
                                      className="inline-flex items-center gap-2 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sa-blue hover:bg-sa-blue/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                  >
                                    📷 Take Photo
                                  </button>
                                   {!issue.beforeWorkPhotoBase64 && <p className="text-xs text-gray-400 mt-1">Upload 'Before' photo first.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {canWorkerSelfAssign && onAssignIssue && (
                 <div className="mt-4 border-t pt-4">
                    <button onClick={() => onAssignIssue(issue.id)} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sa-blue hover:bg-sa-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-blue">
                        Assign to Me
                    </button>
                </div>
            )}
            {canOfficialAssign && (
                <div className="mt-4 border-t pt-4 space-y-2">
                    <label htmlFor="assign-worker" className="block text-sm font-medium text-gray-700">Assign to Worker</label>
                    <div className="flex gap-2">
                        <select
                            id="assign-worker"
                            value={selectedWorkerId}
                            onChange={e => setSelectedWorkerId(e.target.value)}
                            className="flex-grow block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md"
                        >
                            <option value="">Select a worker...</option>
                            {departmentWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                        <button onClick={handleOfficialAssign} disabled={!selectedWorkerId} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green disabled:bg-gray-400">
                            Assign
                        </button>
                    </div>
                </div>
            )}
            {canUpdateStatus && (
                <div className="mt-4 border-t pt-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Update Status</label>
                    <select
                        id="status"
                        name="status"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md"
                        defaultValue={issue.status} // Use defaultValue to avoid controlled/uncontrolled warnings
                        onChange={handleStatusChange}
                    >
                        <option>{IssueStatus.PENDING}</option>
                        <option>{IssueStatus.IN_PROGRESS}</option>
                        <option>{IssueStatus.RESOLVED}</option>
                    </select>
                </div>
            )}
        </div>

        <div className="p-6 flex-grow overflow-y-auto bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 mb-4">History & Comments</h3>
            <div className="space-y-4">
                {issue.history.map(event => <HistoryEventItem key={event.id} event={event} />)}
            </div>
        </div>
        
        <div className="p-6 border-t bg-white">
            {issue.status === IssueStatus.RESOLVED && isCurrentUserReporter && !issue.rating && onRateIssue && (
                <RatingForm issueId={issue.id} onRateIssue={onRateIssue} />
            )}
             {issue.status !== IssueStatus.RESOLVED && onAddComment && (
                <CommentForm issueId={issue.id} onAddComment={(id, comment) => onAddComment(id, comment)} />
            )}
             {issue.rating && (
                <div className="text-center text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                    Feedback received: You rated this resolution as <strong>{issue.rating}</strong>.
                </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;