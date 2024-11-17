import { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import styles from '../styles/Home.module.css';

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const isCameraOnRef = useRef(false);

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
        isCameraOnRef.current = true;
        videoRef.current.onloadedmetadata = () => {
          detectEmotions();
          setIsCameraOn(true);
        };
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
      isCameraOnRef.current = false;
    }
  };

  const detectEmotions = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Match canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const displaySize = { width: video.videoWidth, height: video.videoHeight };

    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {

      if (!isCameraOnRef.current) return; // Stop detection when the camera is off

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

  const handleBtnClick = () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <>
      <button onClick={handleBtnClick} className={styles.btn}>
        {isCameraOn ? 'Stop' : 'Start'} Camera
      </button>
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          autoPlay
          muted
          style={{ display: isCameraOn ? 'block' : 'none' }}
        ></video>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
        ></canvas>
      </div>
    </>
  );
};

export default CameraFeed;
