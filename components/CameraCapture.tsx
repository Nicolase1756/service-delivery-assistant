import * as React from 'react';

interface CameraCaptureProps {
  onCapture: (photoBase64: string) => void;
  onClose: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);

  React.useEffect(() => {
    let mediaStream: MediaStream;

    const getCamera = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access the camera. Please ensure permissions are granted and you are using a secure (HTTPS) connection.");
      }
    };

    getCamera();

    return () => {
      // Cleanup: stop the stream when the component unmounts
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = React.useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality JPEG
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);
  
  const handleClose = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      onClose();
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm text-center">
            <h3 className="text-lg font-bold text-red-600">Camera Error</h3>
            <p className="text-sm text-gray-700 mt-2">{error}</p>
            <button 
                onClick={handleClose} 
                className="mt-4 px-4 py-2 bg-sa-red text-white rounded-md">
                Close
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center p-4">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-4">
            <button onClick={handleClose} className="p-4 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <button onClick={handleCapture} className="p-5 rounded-full bg-white ring-4 ring-white/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sa-black" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M1 8a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 018.07 3h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0016.07 6H17a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2V8zm13.5 3a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" clipRule="evenodd" />
                </svg>
            </button>
             <div className="w-14 h-14"></div> {/* Spacer */}
        </div>
    </div>
  );
};

export default CameraCapture;