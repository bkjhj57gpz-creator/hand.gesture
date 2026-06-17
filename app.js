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

function applyEffect(gesture) {
  if (gesture === "FIST") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gesture === "PEACE") {
    ctx.fillStyle = "rgba(255, 0, 120, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gesture === "THUMBS UP") {
    ctx.fillStyle = "rgba(0, 255, 80, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (gesture === "POINTING") {
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
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

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  applyEffect(gesture);

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