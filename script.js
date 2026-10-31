const SCENE_WIDTH = 1000;
const SCENE_HEIGHT = 560;
const ROOF_AREA = {
  left: 380,
  right: 938,
  top: 72,
  bottom: 248,
};
const ROOF_START_RADIUS = 40;
const ROOF_ANCHOR = { x: 380, y: 174 };

const canvas = document.getElementById("game-canvas");

if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error('Echo Architect requires a canvas element with id "game-canvas".');
}

canvas.width = SCENE_WIDTH;
canvas.height = SCENE_HEIGHT;

const context = canvas.getContext("2d");

if (!context) {
  throw new Error("Echo Architect could not create a 2D canvas context.");
}

const colors = {
  background: "#fbfcfc",
  wall: "#e9eef1",
  ink: "#46535d",
  muted: "#87939b",
  lightLine: "#cbd3d9",
  seatFill: "#f6f8f9",
  source: "#2879a8",
  roof: "#2879a8",
};

const roofPoints = [];
let activePointerId = null;

function drawBackground() {
  context.fillStyle = colors.background;
  context.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  context.fillStyle = colors.wall;
  context.fillRect(0, 0, SCENE_WIDTH, 42);

  context.strokeStyle = colors.lightLine;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, 42.5);
  context.lineTo(SCENE_WIDTH, 42.5);
  context.stroke();

  context.fillStyle = colors.muted;
  context.font = "600 11px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "1.5px";
  context.fillText("THEATRE SECTION", 24, 27);
}

function drawStage() {
  context.fillStyle = "#eef1f3";
  context.fillRect(0, 332, 320, 126);

  context.strokeStyle = colors.ink;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(24, 332);
  context.lineTo(320, 332);
  context.lineTo(320, 446);
  context.lineTo(24, 446);
  context.stroke();

  context.strokeStyle = colors.muted;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(24, 350);
  context.lineTo(24, 446);
  context.moveTo(46, 350);
  context.lineTo(46, 446);
  context.moveTo(298, 350);
  context.lineTo(298, 446);
  context.stroke();

  context.fillStyle = colors.ink;
  context.font = "600 12px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "1px";
  context.fillText("STAGE", 48, 427);

  context.strokeStyle = colors.ink;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 458);
  context.lineTo(360, 458);
  context.stroke();
}

function drawSoundSource() {
  const sourceX = 330;
  const sourceY = 350;

  context.strokeStyle = colors.source;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(sourceX + 14, sourceY - 12);
  context.lineTo(sourceX + 14, sourceY + 12);
  context.lineTo(sourceX + 28, sourceY + 20);
  context.lineTo(sourceX + 28, sourceY - 20);
  context.closePath();
  context.stroke();

  context.beginPath();
  context.arc(sourceX + 28, sourceY, 20, -0.75, 0.75);
  context.stroke();
  context.beginPath();
  context.arc(sourceX + 28, sourceY, 34, -0.75, 0.75);
  context.stroke();

  context.fillStyle = colors.source;
  context.font = "600 10px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "1px";
  context.fillText("SOUND SOURCE", sourceX - 20, sourceY + 46);
}

function drawAuditoriumFloor() {
  context.strokeStyle = colors.ink;
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(354, 464);
  context.lineTo(968, 414);
  context.stroke();

  context.strokeStyle = colors.lightLine;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(354, 470);
  context.lineTo(968, 420);
  context.stroke();
}

function drawSeat(x, y) {
  context.save();
  context.translate(x, y);
  context.strokeStyle = colors.ink;
  context.lineWidth = 1.5;
  context.fillStyle = colors.seatFill;

  context.beginPath();
  context.moveTo(0, 0);
  context.lineTo(0, -13);
  context.quadraticCurveTo(0, -17, 4, -17);
  context.lineTo(15, -17);
  context.quadraticCurveTo(19, -17, 19, -13);
  context.lineTo(19, 0);
  context.closePath();
  context.fill();
  context.stroke();

  context.beginPath();
  context.moveTo(-2, 1);
  context.lineTo(21, 1);
  context.moveTo(1, 1);
  context.lineTo(1, 6);
  context.moveTo(18, 1);
  context.lineTo(18, 6);
  context.stroke();
  context.restore();
}

function drawAudienceSeats() {
  const rowCount = 5;
  const seatsPerRow = 5;
  const seatSpacing = 102;

  for (let row = 0; row < rowCount; row += 1) {
    const rowStartX = 400 + row * 22;
    const rowStartY = 438 - row * 25 - row * 1.3;

    for (let seat = 0; seat < seatsPerRow; seat += 1) {
      const x = rowStartX + seat * seatSpacing;
      const y = rowStartY - seat * 8.3;
      drawSeat(x, y);
    }
  }

  context.fillStyle = colors.muted;
  context.font = "600 10px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "1px";
  context.fillText("AUDIENCE", 820, 520);
}

function drawRoofMarkers() {
  const markerY = 174;
  const markers = [
    { x: 380, label: "START" },
    { x: 938, label: "END" },
  ];

  context.save();
  context.setLineDash([4, 5]);
  context.strokeStyle = colors.muted;
  context.lineWidth = 1;

  for (const marker of markers) {
    context.beginPath();
    context.moveTo(marker.x, markerY + 10);
    context.lineTo(marker.x, 244);
    context.stroke();

    context.setLineDash([]);
    context.beginPath();
    context.arc(marker.x, markerY, 5, 0, Math.PI * 2);
    context.fillStyle = colors.background;
    context.fill();
    context.strokeStyle = colors.ink;
    context.stroke();

    context.fillStyle = colors.muted;
    context.font = "600 9px Segoe UI, Arial, sans-serif";
    context.letterSpacing = "1px";
    context.fillText(marker.label, marker.x - 18, markerY - 13);
    context.setLineDash([4, 5]);
    context.strokeStyle = colors.muted;
  }

  context.restore();
}

function drawTheatreScene() {
  drawBackground();
  drawStage();
  drawSoundSource();
  drawAuditoriumFloor();
  drawAudienceSeats();
  drawRoofMarkers();
  drawRoof();
}

function drawRoof() {
  if (roofPoints.length === 0) {
    return;
  }

  context.save();
  context.strokeStyle = colors.roof;
  context.lineWidth = 5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(roofPoints[0].x, roofPoints[0].y);

  for (let index = 1; index < roofPoints.length; index += 1) {
    context.lineTo(roofPoints[index].x, roofPoints[index].y);
  }

  if (roofPoints.length === 1) {
    context.lineTo(roofPoints[0].x + 0.01, roofPoints[0].y);
  }

  context.stroke();
  context.restore();
}

function getCanvasPoint(event) {
  const bounds = canvas.getBoundingClientRect();

  if (bounds.width === 0 || bounds.height === 0) {
    return null;
  }

  return {
    x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
    y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
  };
}

function isInRoofArea(point) {
  return (
    point.x >= ROOF_AREA.left &&
    point.x <= ROOF_AREA.right &&
    point.y >= ROOF_AREA.top &&
    point.y <= ROOF_AREA.bottom
  );
}

function isNearRoofAnchor(point) {
  return Math.hypot(point.x - ROOF_ANCHOR.x, point.y - ROOF_ANCHOR.y) <= ROOF_START_RADIUS;
}

function isSoundTestRunning() {
  return canvas.dataset.soundTestRunning === "true";
}

function finishRoofDrawing() {
  const pointerId = activePointerId;
  activePointerId = null;

  if (pointerId !== null && canvas.hasPointerCapture(pointerId)) {
    canvas.releasePointerCapture(pointerId);
  }
}

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();

  if (
    activePointerId !== null ||
    isSoundTestRunning() ||
    !event.isPrimary ||
    event.button !== 0
  ) {
    return;
  }

  const point = getCanvasPoint(event);

  if (!point || !isInRoofArea(point) || !isNearRoofAnchor(point)) {
    return;
  }

  activePointerId = event.pointerId;
  roofPoints.length = 0;
  roofPoints.push({ ...ROOF_ANCHOR });
  canvas.setPointerCapture(event.pointerId);
  drawTheatreScene();
});

canvas.addEventListener("pointermove", (event) => {
  if (event.pointerId !== activePointerId) {
    return;
  }

  event.preventDefault();

  if (isSoundTestRunning()) {
    finishRoofDrawing();
    return;
  }

  const point = getCanvasPoint(event);

  if (!point || !isInRoofArea(point)) {
    finishRoofDrawing();
    return;
  }

  const previousPoint = roofPoints[roofPoints.length - 1];

  if (Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y) >= 1) {
    roofPoints.push(point);
    drawTheatreScene();
  }
});

canvas.addEventListener("pointerup", (event) => {
  if (event.pointerId === activePointerId) {
    event.preventDefault();
    finishRoofDrawing();
  }
});

canvas.addEventListener("pointercancel", (event) => {
  if (event.pointerId === activePointerId) {
    finishRoofDrawing();
  }
});

canvas.addEventListener("lostpointercapture", (event) => {
  if (event.pointerId === activePointerId) {
    finishRoofDrawing();
  }
});

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

const resetButton = document.getElementById("reset-button");

if (!(resetButton instanceof HTMLButtonElement)) {
  throw new Error('Echo Architect requires a button with id "reset-button".');
}

resetButton.addEventListener("click", () => {
  finishRoofDrawing();
  roofPoints.length = 0;
  drawTheatreScene();
});

drawTheatreScene();