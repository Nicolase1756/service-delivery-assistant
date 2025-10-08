import { Jobseeker } from '../types';

const JOBSEEKER_STORAGE_KEY = 'service-delivery-jobseekers';

const generateMockJobseekers = (): Jobseeker[] => {
    return [
        {
            residentId: 'user-3',
            residentName: 'Maria Garcia',
            ward: 3,
            contactInfo: '083 123 4567',
            skills: 'Project management, general construction, and team leadership. I have 10 years of experience in the building sector.',
            registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        }
    ];
}


export const getJobseekers = (): Jobseeker[] => {
  try {
    const jobseekersJson = localStorage.getItem(JOBSEEKER_STORAGE_KEY);
    if (!jobseekersJson) {
      const mockJobseekers = generateMockJobseekers();
      localStorage.setItem(JOBSEEKER_STORAGE_KEY, JSON.stringify(mockJobseekers));
      return mockJobseekers;
    }
    return JSON.parse(jobseekersJson);
  } catch (error) {
    console.error("Failed to parse jobseekers from localStorage", error);
    return [];
  }
};

export const saveJobseekers = (jobseekers: Jobseeker[]): void => {
  try {
    const jobseekersJson = JSON.stringify(jobseekers);
    localStorage.setItem(JOBSEEKER_STORAGE_KEY, jobseekersJson);
  } catch (error) {
    console.error("Failed to save jobseekers to localStorage", error);
  }
};


export const addJobseeker = (jobseekerData: Omit<Jobseeker, 'registeredAt'>): Jobseeker => {
    const allJobseekers = getJobseekers();
    const newJobseeker: Jobseeker = {
        ...jobseekerData,
        registeredAt: new Date().toISOString(),
    };
    const updatedJobseekers = [...allJobseekers.filter(j => j.residentId !== newJobseeker.residentId), newJobseeker];
    saveJobseekers(updatedJobseekers);
    return newJobseeker;
};


export const removeJobseeker = (residentId: string): void => {
    const allJobseekers = getJobseekers();
    const updatedJobseekers = allJobseekers.filter(j => j.residentId !== residentId);
    saveJobseekers(updatedJobseekers);
};