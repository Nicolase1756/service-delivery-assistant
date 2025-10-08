import * as React from 'react';
import { IssueCategory, ReportedIssue, IssuePriority, User } from '../types';
import { MOCKED_COUNCILLORS, CATEGORY_PRIORITY_MAP } from '../constants';
import { suggestCategory } from '../services/geminiService';

interface ReportIssueProps {
  addIssue: (issue: Omit<ReportedIssue, 'id' | 'reportedAt' | 'status' | 'councillor' | 'history' | 'rating' | 'assignedTo' | 'department' | 'beforeWorkPhotoBase64' | 'afterWorkPhotoBase64'>) => void;
  onReportSuccess: () => void;
  currentUser: User;
}

const ReportIssue: React.FC<ReportIssueProps> = ({ addIssue, onReportSuccess, currentUser }) => {
  const [category, setCategory] = React.useState<IssueCategory>(IssueCategory.WATER);
  const [description, setDescription] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [ward, setWard] = React.useState<number>(currentUser.ward || 1);
  const [photoBase64, setPhotoBase64] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [photoError, setPhotoError] = React.useState<string | null>(null);
  
  const [priority, setPriority] = React.useState<IssuePriority>(CATEGORY_PRIORITY_MAP[category]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiError, setAiError] = React.useState<string | null>(null);
  const [aiSuggestionText, setAiSuggestionText] = React.useState<string | null>(null);

  const [isGettingLocation, setIsGettingLocation] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    // Update priority if user changes category manually.
    setPriority(CATEGORY_PRIORITY_MAP[category]);
    // Clear AI suggestion if user changes category, indicating they are overriding.
    setAiSuggestionText(null);
  }, [category]);


  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

      if (file.size > MAX_FILE_SIZE) {
        setPhotoError('File is too large. Please select a file smaller than 10MB.');
        e.target.value = ''; // Reset file input
        setPhotoBase64(null);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.onerror = () => {
        setPhotoError('There was an error reading the file. Please try again.');
        setPhotoBase64(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
   const handleAnalyze = async () => {
    if (!description && !photoBase64) {
        setAiError("Please provide a description or a photo to analyze.");
        return;
    }
    setIsAnalyzing(true);
    setAiError(null);
    setAiSuggestionText(null);

    const suggestion = await suggestCategory(description, photoBase64);
    if (suggestion) {
        setCategory(suggestion.category);
        setPriority(suggestion.priority);
        setAiSuggestionText(`AI suggested: ${suggestion.category} (Priority: ${suggestion.priority}). You can change this if incorrect.`);
    } else {
        setAiError("Could not get AI suggestion. Please select a category manually.");
    }
    setIsAnalyzing(false);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError(`Error getting location: ${error.message}. Please enter manually.`);
        setIsGettingLocation(false);
      }
    );
  };

  const handleSubmit = React.useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location || !ward || !currentUser.municipality) {
        alert("Please fill in all fields.");
        return;
    }
    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      addIssue({
        category,
        description,
        location,
        photoBase64,
        residentId: currentUser.id,
        municipality: currentUser.municipality!,
        ward,
        priority
      });
      setIsSubmitting(false);

      // Reset form fields
      setCategory(IssueCategory.WATER);
      setDescription('');
      setLocation('');
      setWard(currentUser.ward || 1);
      setPhotoBase64(null);
      setAiSuggestionText(null);
      setPhotoError(null);
      setAiError(null);
      setLocationError(null);
      
      onReportSuccess();
    }, 1000);
  }, [category, description, location, photoBase64, ward, priority, addIssue, onReportSuccess, currentUser]);

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Report a New Issue</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as IssueCategory)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sa-green focus:border-sa-green sm:text-sm rounded-md"
          >
            {Object.values(IssueCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        
        <div>
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || (!description && !photoBase64)}
                className="text-sm font-medium text-sa-green hover:text-sa-green/80 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
             >
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI ✨'}
            </button>
          </div>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-sa-green focus:border-sa-green"
            placeholder="Please provide a detailed description of the issue."
            required
          />
           {aiSuggestionText && <p className="mt-2 text-sm text-green-700">{aiSuggestionText}</p>}
           {aiError && <p className="mt-2 text-sm text-red-600" role="alert">{aiError}</p>}
        </div>

        <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <div className="mt-1 flex rounded-md shadow-sm">
                <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300 focus:ring-sa-green focus:border-sa-green"
                    placeholder="e.g., 123 Main St or GPS coordinates"
                    required
                />
                <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-sa-green focus:border-sa-green disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                    {isGettingLocation ? (
                         <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.978.572.536.536 0 00.28.14l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                        </svg>
                    )}
                </button>
            </div>
            {locationError && <p className="mt-2 text-sm text-red-600" role="alert">{locationError}</p>}
        </div>

        <div>
          <label htmlFor="ward" className="block text-sm font-medium text-gray-700">Ward</label>
           <p id="ward-description" className="mt-1 text-sm text-gray-500">
            This is pre-filled from your profile.
          </p>
          <input
            type="text"
            id="ward"
            value={`Ward ${ward} (${currentUser.municipality})`}
            disabled
            className="mt-1 block w-full bg-gray-100 shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Upload Photo (Optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
                {photoBase64 ? (
                    <img src={photoBase64} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded"/>
                ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sa-green hover:text-sa-green-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sa-green">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handlePhotoChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {photoError && <p className="mt-2 text-sm text-red-600" role="alert">{photoError}</p>}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sa-green hover:bg-sa-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sa-green disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportIssue;