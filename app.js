const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

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

function pos(point) {
  return {
    x: point.x * canvas.width,
    y: point.y * canvas.height
  };
}

function drawSunglasses(landmarks) {
  const p = pos(landmarks[9]);
  ctx.font = "90px Arial";
  ctx.fillText("😎", p.x - 45, p.y - 120);
}

function drawCrown(landmarks) {
  const p = pos(landmarks[9]);
  ctx.font = "90px Arial";
  ctx.fillText("👑", p.x - 45, p.y - 150);
}

function drawFire() {
  ctx.font = "80px Arial";
  for (let i = 0; i < 6; i++) {
    ctx.fillText("🔥", Math.random() * canvas.width, canvas.height - Math.random() * 220);
  }
}

function drawLaser(landmarks) {
  const p = pos(landmarks[8]);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(canvas.width, p.y);
  ctx.stroke();

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlow() {
  ctx.fillStyle = "rgba(0, 255, 120, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function applyFilter(gesture, landmarks) {
  if (gesture === "OPEN PALM") {
    drawGlow();
  }

  if (gesture === "FIST") {
    drawFire();
  }

  if (gesture === "PEACE") {
    drawSunglasses(landmarks);
  }

  if (gesture === "THUMBS UP") {
    drawCrown(landmarks);
  }

  if (gesture === "POINTING") {
    drawLaser(landmarks);
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

  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  let gesture = "SHOW HAND";

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0];
    gesture = getGesture(landmarks);

    applyFilter(gesture, landmarks);

    drawConnectors(ctx, landmarks, HAND_CONNECTIONS);
    drawLandmarks(ctx, landmarks);
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