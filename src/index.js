import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import * as faceapi from "face-api.js";
import "./styles.css";

function App() {
  useEffect(() => {
    configure();
  }, []);

  return (
    <div className="App">
      <div className="videoContainer">
        <video onPlay={onPlay} id="inputVideo" autoPlay muted />
        <canvas id="overlay" />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

async function configure() {
  // load the models
  const p = faceapi.loadTinyFaceDetectorModel(
    "https://statefull.github.io/src/models/"
  );
  p.then(() => {
    console.log("!!! ok");
    const t = faceapi.loadFaceLandmarkTinyModel(
      "https://statefull.github.io/src/models/"
    );

    t.then(() => {
      console.log("!!! face ok");
      const videoEl = document.getElementById("inputVideo");

      navigator.getUserMedia(
        { video: {} },
        stream => (videoEl.srcObject = stream),
        err => console.error(err)
      );
    }).catch(err => console.log("!!! face", err));
  }).catch(err => console.log("!!! dd", err));
}

async function onPlay() {
  const canvas = document.getElementById("overlay");
  const video = document.getElementById("inputVideo");

  setInterval(async () => {
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 128,
      scoreThreshold: 0.3
    });

    const result = await faceapi
      .detectSingleFace(video, options)
      .withFaceLandmarks(true);

    if (!result) return;
    drawLandmarks(video, canvas, [result], true);
  }, 40);
}

function resizeCanvasAndResults(dimensions, canvas, results) {
  const { width, height } =
    dimensions instanceof HTMLVideoElement
      ? faceapi.getMediaDimensions(dimensions)
      : dimensions;
  canvas.width = width;
  canvas.height = height;

  return results.map(res => {
    res.detection.box.rescale(width, height);
    return res;
  });
}

function drawLandmarks(dimensions, canvas, results, withBoxes = true) {
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results);
  if (withBoxes) {
    faceapi.draw.drawDetections(
      canvas,
      resizedResults.map(det => det.detection)
    );
  }
  const faceLandmarks = resizedResults.map(det => det.landmarks);

  faceapi.draw.drawFaceLandmarks(canvas, faceLandmarks);
}
