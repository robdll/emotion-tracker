import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    };

    loadModels();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);

        // Start detection when camera starts
        detectEmotions();
      }
    } catch (error) {
      console.error('Error accessing the camera:', error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
    }
  };

  const detectEmotions = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
      if (!isCameraOn) return; // Stop detection when the camera is off

      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }
    }, 100);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: '640px', height: '480px', margin: '0 auto' }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="640"
          height="480"
          style={{ display: isCameraOn ? 'block' : 'none', border: '1px solid #ccc', borderRadius: '8px' }}
        ></video>
        <canvas
          ref={canvasRef}
          width="640"
          height="480"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: isCameraOn ? 'block' : 'none',
          }}
        ></canvas>
      </div>
      <div style={{ marginTop: '20px' }}>
        {!isCameraOn ? (
          <button onClick={startCamera} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Start Camera
          </button>
        ) : (
          <button onClick={stopCamera} style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraFeed;
