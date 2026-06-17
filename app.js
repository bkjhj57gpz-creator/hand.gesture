const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();

function fingersUp(landmarks) {
  return {
    thumb: landmarks[4].x < landmarks[3].x,
    index: landmarks[8].y < landmarks[6].y,
    middle: landmarks[12].y < landmarks[10].y,
    ring: landmarks[16].y < landmarks[14].y,
    pinky: landmarks[20].y < landmarks[18].y
  };
}

function getGesture(landmarks) {
  const f = fingersUp(landmarks);

  if (f.index && f.middle && f.ring && f.pinky) return "OPEN PALM";
  if (!f.index && !f.middle && !f.ring && !f.pinky) return "FIST";
  if (f.index && f.middle && !f.ring && !f.pinky) return "PEACE";
  if (f.thumb && !f.index && !f.middle && !f.ring && !f.pinky) return "THUMBS UP";
  if (f.index && !f.middle && !f.ring && !f.pinky) return "POINTING";

  return "HAND";
}

const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

hands.onResults(results => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let gesture = "SHOW HAND";

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    gesture = getGesture(results.multiHandLandmarks[0]);
  }

  if (gesture === "FIST") {
    ctx.filter = "brightness(40%)";
  } else if (gesture === "PEACE") {
    ctx.filter = "hue-rotate(120deg) saturate(2)";
  } else if (gesture === "THUMBS UP") {
    ctx.filter = "contrast(180%)";
  } else if (gesture === "POINTING") {
    ctx.filter = "grayscale(100%)";
  } else {
    ctx.filter = "none";
  }

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  ctx.filter = "none";

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
      drawLandmarks(ctx, landmarks);
    }
  }

  ctx.font = "40px Arial";
  ctx.fillStyle = "yellow";
  ctx.fillText(gesture, 30, 70);
});

const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 1280,
  height: 720
});

camera.start();