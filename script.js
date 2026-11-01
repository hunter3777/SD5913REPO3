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
const SOUND_ORIGIN = { x: 358, y: 350 };
const RAY_COUNT = 20;
const RAY_MIN_ANGLE = -72;
const RAY_MAX_ANGLE = -12;
const SOUND_TEST_DURATION = 1200;
const SEAT_DETECTION_RADIUS = 18;
const SUCCESS_COVERAGE_PERCENT = 60;

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
  background: "#f5f0e6",
  wall: "#e9e1d4",
  ink: "#354858",
  muted: "#77838b",
  lightLine: "#c8c3b9",
  seatFill: "#e5e9e8",
  seatStroke: "#71818a",
  coveredSeatFill: "#dce7dc",
  coveredSeatStroke: "#667f6d",
  source: "#6d8491",
  roof: "#607c8b",
};

const roofPoints = [];
const audienceSeats = createAudienceSeats();
let soundRays = [];
let activePointerId = null;
let soundTestAnimationFrame = null;
let soundTestProgress = 1;
let coveredSeatCount = 0;
let warningTimeout = null;

const coveredCountOutput = document.getElementById("covered-count");
const totalCountOutput = document.getElementById("total-count");
const coveragePercentOutput = document.getElementById("coverage-percent");
const gameWarning = document.getElementById("game-warning");
const testSoundButton = document.getElementById("test-sound-button");

if (
  !(coveredCountOutput instanceof HTMLOutputElement) ||
  !(totalCountOutput instanceof HTMLOutputElement) ||
  !(coveragePercentOutput instanceof HTMLOutputElement) ||
  !(gameWarning instanceof HTMLParagraphElement) ||
  !(testSoundButton instanceof HTMLButtonElement)
) {
  throw new Error("Echo Architect is missing a required score display or game control.");
}

function drawBackground() {
  const paper = context.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
  paper.addColorStop(0, "#faf7f0");
  paper.addColorStop(1, "#eee8dd");
  context.fillStyle = paper;
  context.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);

  const header = context.createLinearGradient(0, 0, 0, 44);
  header.addColorStop(0, "#eee8dd");
  header.addColorStop(1, "#e5ded2");
  context.fillStyle = header;
  context.fillRect(0, 0, SCENE_WIDTH, 42);

  context.strokeStyle = "rgba(91, 105, 113, 0.20)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, 42.5);
  context.lineTo(SCENE_WIDTH, 42.5);
  context.stroke();

  drawAuditoriumArches();

  context.fillStyle = "#63747d";
  context.font = "600 10px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "2px";
  context.fillText("THEATRE  /  ACOUSTIC SECTION", 26, 26);
}

function drawAuditoriumArches() {
  context.save();

  const interior = context.createLinearGradient(0, 80, 0, 450);
  interior.addColorStop(0, "rgba(211, 220, 220, 0.60)");
  interior.addColorStop(1, "rgba(224, 225, 216, 0.20)");
  context.fillStyle = interior;
  context.beginPath();
  context.moveTo(328, 270);
  context.lineTo(328, 236);
  context.bezierCurveTo(328, 116, 442, 58, 640, 58);
  context.bezierCurveTo(838, 58, 964, 116, 978, 236);
  context.lineTo(978, 412);
  context.lineTo(360, 462);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(83, 103, 113, 0.23)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(312, 274);
  context.lineTo(312, 235);
  context.bezierCurveTo(312, 98, 436, 47, 643, 47);
  context.bezierCurveTo(850, 47, 980, 100, 994, 235);
  context.stroke();

  context.strokeStyle = "rgba(255, 255, 255, 0.58)";
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(340, 263);
  context.lineTo(340, 236);
  context.bezierCurveTo(340, 126, 450, 72, 641, 72);
  context.bezierCurveTo(832, 72, 948, 126, 966, 236);
  context.stroke();

  context.save();
  context.beginPath();
  context.moveTo(328, 270);
  context.lineTo(328, 236);
  context.bezierCurveTo(328, 116, 442, 58, 640, 58);
  context.bezierCurveTo(838, 58, 964, 116, 978, 236);
  context.lineTo(978, 412);
  context.lineTo(360, 462);
  context.closePath();
  context.clip();

  context.strokeStyle = "rgba(112, 128, 132, 0.12)";
  context.lineWidth = 1;
  for (let x = 380; x <= 940; x += 38) {
    context.beginPath();
    context.moveTo(x, 70);
    context.lineTo(x, 440);
    context.stroke();
  }
  context.restore();

  context.restore();
}

function drawStage() {
  const stageFace = context.createLinearGradient(0, 330, 0, 458);
  stageFace.addColorStop(0, "#e5dfd4");
  stageFace.addColorStop(1, "#d4cbbd");
  context.fillStyle = stageFace;
  context.fillRect(24, 332, 296, 114);

  context.fillStyle = "rgba(255, 255, 255, 0.28)";
  context.fillRect(28, 336, 286, 8);

  context.strokeStyle = "#596b75";
  context.lineWidth = 1.8;
  context.beginPath();
  context.moveTo(24, 332);
  context.lineTo(320, 332);
  context.lineTo(320, 446);
  context.lineTo(24, 446);
  context.stroke();

  context.strokeStyle = "rgba(79, 97, 106, 0.38)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(24, 350);
  context.lineTo(24, 446);
  context.moveTo(46, 350);
  context.lineTo(46, 446);
  context.moveTo(298, 350);
  context.lineTo(298, 446);
  context.moveTo(60, 350);
  context.lineTo(60, 410);
  context.moveTo(284, 350);
  context.lineTo(284, 410);
  context.stroke();

  context.fillStyle = "#53656f";
  context.font = "600 10px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "2px";
  context.fillText("STAGE", 62, 426);

  context.strokeStyle = "#53656f";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(0, 458);
  context.lineTo(360, 458);
  context.stroke();

  context.strokeStyle = "rgba(188, 156, 105, 0.68)";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(24, 462);
  context.lineTo(359, 462);
  context.stroke();
}

function drawSoundSource() {
  const sourceX = 330;
  const sourceY = 350;

  context.save();
  context.strokeStyle = colors.source;
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(sourceX + 14, sourceY - 12);
  context.lineTo(sourceX + 14, sourceY + 12);
  context.lineTo(sourceX + 28, sourceY + 20);
  context.lineTo(sourceX + 28, sourceY - 20);
  context.closePath();
  context.fillStyle = "rgba(109, 132, 145, 0.10)";
  context.fill();
  context.stroke();

  context.strokeStyle = "rgba(165, 139, 98, 0.76)";
  context.beginPath();
  context.arc(sourceX + 28, sourceY, 19, -0.72, 0.72);
  context.stroke();
  context.strokeStyle = "rgba(165, 139, 98, 0.40)";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(sourceX + 28, sourceY, 31, -0.72, 0.72);
  context.stroke();

  context.fillStyle = "#73818a";
  context.font = "600 9px Segoe UI, Arial, sans-serif";
  context.letterSpacing = "1.5px";
  context.fillText("SOUND SOURCE", sourceX - 20, sourceY + 46);
  context.restore();
}

function drawAuditoriumFloor() {
  context.strokeStyle = "#536873";
  context.lineWidth = 2.2;
  context.beginPath();
  context.moveTo(354, 464);
  context.lineTo(968, 414);
  context.stroke();

  context.strokeStyle = "rgba(255, 255, 255, 0.72)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(356, 468);
  context.lineTo(968, 418);
  context.stroke();

  context.strokeStyle = "rgba(177, 150, 111, 0.55)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(354, 474);
  context.lineTo(968, 424);
  context.stroke();
}

function createAudienceSeats() {
  const seats = [];
  const rowCount = 5;
  const seatsPerRow = 5;
  const seatSpacing = 102;

  for (let row = 0; row < rowCount; row += 1) {
    const rowStartX = 400 + row * 22;
    const rowStartY = 438 - row * 25 - row * 1.3;

    for (let seat = 0; seat < seatsPerRow; seat += 1) {
      seats.push({
        x: rowStartX + seat * seatSpacing,
        y: rowStartY - seat * 8.3,
        covered: false,
      });
    }
  }

  return seats;
}

function drawSeat(x, y, covered) {
  context.save();
  context.translate(x, y);
  context.strokeStyle = covered ? colors.coveredSeatStroke : colors.seatStroke;
  context.lineWidth = 1.5;
  context.fillStyle = covered ? colors.coveredSeatFill : colors.seatFill;

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
  for (const seat of audienceSeats) {
    drawSeat(seat.x, seat.y, seat.covered);
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
  context.setLineDash([3, 6]);
  context.strokeStyle = "rgba(97, 116, 124, 0.62)";
  context.lineWidth = 1;

  for (const marker of markers) {
    context.beginPath();
    context.moveTo(marker.x, markerY + 10);
    context.lineTo(marker.x, 244);
    context.stroke();

    context.setLineDash([]);
    context.beginPath();
    context.arc(marker.x, markerY, 5, 0, Math.PI * 2);
    context.fillStyle = "#f5f0e6";
    context.fill();
    context.strokeStyle = "#607783";
    context.lineWidth = 1.5;
    context.stroke();

    context.fillStyle = "#687a83";
    context.font = "600 9px Segoe UI, Arial, sans-serif";
    context.letterSpacing = "1.5px";
    context.fillText(marker.label, marker.x - 19, markerY - 14);
    context.setLineDash([3, 6]);
    context.strokeStyle = "rgba(97, 116, 124, 0.62)";
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
  drawSoundRays(soundTestProgress);
}

function drawRoof() {
  if (roofPoints.length === 0) {
    return;
  }

  context.save();
  context.strokeStyle = colors.roof;
  context.lineWidth = 5.5;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgba(54, 75, 87, 0.20)";
  context.shadowBlur = 5;
  context.shadowOffsetY = 2;
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

function crossProduct(first, second) {
  return first.x * second.y - first.y * second.x;
}

function subtractVectors(first, second) {
  return { x: first.x - second.x, y: first.y - second.y };
}

function addScaledVector(origin, direction, distance) {
  return {
    x: origin.x + direction.x * distance,
    y: origin.y + direction.y * distance,
  };
}

function normalizeVector(vector) {
  const magnitude = Math.hypot(vector.x, vector.y);

  if (!Number.isFinite(magnitude) || magnitude === 0) {
    return null;
  }

  return { x: vector.x / magnitude, y: vector.y / magnitude };
}

function isFinitePoint(point) {
  return Boolean(
    point &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y)
  );
}

function findRaySegmentIntersection(origin, direction, segmentStart, segmentEnd) {
  const segment = subtractVectors(segmentEnd, segmentStart);
  const originToSegment = subtractVectors(segmentStart, origin);
  const denominator = crossProduct(direction, segment);

  if (Math.abs(denominator) < 1e-8) {
    return null;
  }

  // Solve origin + t * direction = segmentStart + u * segment. A hit is valid
  // only in front of the ray (t >= 0) and along the roof segment (0 <= u <= 1).
  const distance = crossProduct(originToSegment, segment) / denominator;
  const segmentPosition = crossProduct(originToSegment, direction) / denominator;

  if (
    !Number.isFinite(distance) ||
    !Number.isFinite(segmentPosition) ||
    distance < 0 ||
    segmentPosition < 0 ||
    segmentPosition > 1
  ) {
    return null;
  }

  const normal = normalizeVector({ x: -segment.y, y: segment.x });

  if (!normal) {
    return null;
  }

  return {
    distance,
    point: addScaledVector(origin, direction, distance),
    normal,
  };
}

function reflectVector(direction, normal) {
  // Reflection is d - 2(d · n)n, where n is the unit surface normal.
  const projection = direction.x * normal.x + direction.y * normal.y;
  return normalizeVector({
    x: direction.x - 2 * projection * normal.x,
    y: direction.y - 2 * projection * normal.y,
  });
}

function findFirstRoofIntersection(origin, direction) {
  let closestHit = null;

  for (let index = 0; index < roofPoints.length - 1; index += 1) {
    const segmentStart = roofPoints[index];
    const segmentEnd = roofPoints[index + 1];

    if (!isFinitePoint(segmentStart) || !isFinitePoint(segmentEnd)) {
      continue;
    }

    const hit = findRaySegmentIntersection(origin, direction, segmentStart, segmentEnd);

    if (hit && (!closestHit || hit.distance < closestHit.distance)) {
      closestHit = hit;
    }
  }

  return closestHit;
}

function findRaySceneExit(origin, direction) {
  const distances = [];

  if (direction.x > 0) {
    distances.push((SCENE_WIDTH - origin.x) / direction.x);
  } else if (direction.x < 0) {
    distances.push((0 - origin.x) / direction.x);
  }

  if (direction.y > 0) {
    distances.push((SCENE_HEIGHT - origin.y) / direction.y);
  } else if (direction.y < 0) {
    distances.push((0 - origin.y) / direction.y);
  }

  const positiveDistances = distances.filter((distance) => Number.isFinite(distance) && distance >= 0);
  const exitDistance = Math.min(...positiveDistances);

  if (!Number.isFinite(exitDistance)) {
    return origin;
  }

  return addScaledVector(origin, direction, exitDistance);
}

function isValidRoofDrawing() {
  return (
    roofPoints.length >= 2 &&
    !roofPoints.some((point) => !isFinitePoint(point)) &&
    !roofPoints.some((point, index) => (
      index > 0 &&
      Math.hypot(point.x - roofPoints[index - 1].x, point.y - roofPoints[index - 1].y) < 1e-6
    ))
  );
}

function createSoundRays() {
  const hasValidRoof = isValidRoofDrawing();

  const rays = [];

  for (let index = 0; index < RAY_COUNT; index += 1) {
    const fraction = index / (RAY_COUNT - 1);
    const angle = (RAY_MIN_ANGLE + (RAY_MAX_ANGLE - RAY_MIN_ANGLE) * fraction) * (Math.PI / 180);
    const direction = normalizeVector({ x: Math.cos(angle), y: Math.sin(angle) });

    if (!direction) {
      continue;
    }

    const hit = hasValidRoof ? findFirstRoofIntersection(SOUND_ORIGIN, direction) : null;

    if (!hit) {
      rays.push({
        incoming: [SOUND_ORIGIN, findRaySceneExit(SOUND_ORIGIN, direction)],
        reflected: null,
        isReflected: false,
      });
      continue;
    }

    const reflectedDirection = reflectVector(direction, hit.normal);
    const reflectedEnd = reflectedDirection
      ? findRaySceneExit(hit.point, reflectedDirection)
      : hit.point;

    rays.push({
      incoming: [SOUND_ORIGIN, hit.point],
      reflected: reflectedDirection ? [hit.point, reflectedEnd] : null,
      isReflected: Boolean(reflectedDirection),
    });
  }

  return rays;
}

function getSeatDetectionPoint(seat) {
  return { x: seat.x + 9.5, y: seat.y - 8.5 };
}

function isPointNearSegment(point, segmentStart, segmentEnd, radius) {
  const segment = subtractVectors(segmentEnd, segmentStart);
  const lengthSquared = segment.x * segment.x + segment.y * segment.y;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y) <= radius;
  }

  const fromStart = subtractVectors(point, segmentStart);
  const projection = Math.max(
    0,
    Math.min(1, (fromStart.x * segment.x + fromStart.y * segment.y) / lengthSquared)
  );
  const closestPoint = addScaledVector(segmentStart, segment, projection);

  return Math.hypot(point.x - closestPoint.x, point.y - closestPoint.y) <= radius;
}

function isSeatCoveredByReflectedRays(seat, rays) {
  const detectionPoint = getSeatDetectionPoint(seat);

  return rays.some((ray) => (
    ray.isReflected &&
    Array.isArray(ray.reflected) &&
    ray.reflected.length === 2 &&
    isFinitePoint(ray.reflected[0]) &&
    isFinitePoint(ray.reflected[1]) &&
    isPointNearSegment(
      detectionPoint,
      ray.reflected[0],
      ray.reflected[1],
      SEAT_DETECTION_RADIUS
    )
  ));
}

function updateCoverageDisplay() {
  const percentage = audienceSeats.length > 0
    ? Math.round((coveredSeatCount / audienceSeats.length) * 100)
    : 0;

  coveredCountOutput.value = String(coveredSeatCount);
  totalCountOutput.value = String(audienceSeats.length);
  coveragePercentOutput.value = `${percentage}%`;
}

function resetSeatCoverage() {
  coveredSeatCount = 0;

  for (const seat of audienceSeats) {
    seat.covered = false;
  }

  updateCoverageDisplay();
}

function calculateSeatCoverage(rays) {
  resetSeatCoverage();

  for (const seat of audienceSeats) {
    if (isSeatCoveredByReflectedRays(seat, rays)) {
      seat.covered = true;
      coveredSeatCount += 1;
    }
  }

  updateCoverageDisplay();
  return {
    covered: coveredSeatCount,
    total: audienceSeats.length,
    percentage: audienceSeats.length > 0
      ? (coveredSeatCount / audienceSeats.length) * 100
      : 0,
  };
}

function showScoreResult(percentage) {
  const successDialog = document.getElementById("success-popup");
  const failureDialog = document.getElementById("failure-popup");
  const successCoverage = document.getElementById("success-coverage");
  const failureCoverage = document.getElementById("failure-coverage");
  const successMessage = document.getElementById("success-message");
  const failureMessage = document.getElementById("failure-message");

  if (
    !(successDialog instanceof HTMLDialogElement) ||
    !(failureDialog instanceof HTMLDialogElement) ||
    !(successCoverage instanceof HTMLOutputElement) ||
    !(failureCoverage instanceof HTMLOutputElement) ||
    !(successMessage instanceof HTMLParagraphElement) ||
    !(failureMessage instanceof HTMLParagraphElement)
  ) {
    throw new Error("Echo Architect requires complete success and failure dialogs.");
  }

  const displayedPercentage = `${Math.round(percentage)}%`;
  successCoverage.value = displayedPercentage;
  failureCoverage.value = displayedPercentage;

  const didSucceed = percentage >= SUCCESS_COVERAGE_PERCENT;
  successMessage.textContent = `Your roof carries sound to ${displayedPercentage} of the audience, meeting the ${SUCCESS_COVERAGE_PERCENT}% target.`;
  failureMessage.textContent = `Your roof covered ${displayedPercentage} of the audience. Redesign the roof to direct more sound toward the seats.`;
  const resultDialog = didSucceed ? successDialog : failureDialog;

  if (!resultDialog.open) {
    resultDialog.showModal();
  }
}

function showRoofWarning() {
  gameWarning.textContent = "Draw a complete roof from the START marker before testing the sound.";
  gameWarning.hidden = false;

  if (warningTimeout !== null) {
    clearTimeout(warningTimeout);
  }

  warningTimeout = window.setTimeout(() => {
    gameWarning.hidden = true;
    warningTimeout = null;
  }, 4000);
}

function clearRoofWarning() {
  if (warningTimeout !== null) {
    clearTimeout(warningTimeout);
    warningTimeout = null;
  }

  gameWarning.textContent = "";
  gameWarning.hidden = true;
}

function setSoundTestRunning(running) {
  canvas.dataset.soundTestRunning = String(running);
  testSoundButton.disabled = running;
}

function drawRayPath(points, progress, phase = 0, energy = 1) {
  if (!points || points.length < 2 || progress <= 0) {
    return;
  }

  const [start, end] = points;
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const length = Math.hypot(deltaX, deltaY);

  if (length === 0) {
    return;
  }

  const visibleLength = length * Math.min(1, progress);
  const normalX = -deltaY / length;
  const normalY = deltaX / length;
  const waveLength = 34;
  const amplitude = 3.2;
  const sampleSpacing = 4;
  const samples = [];

  for (let distance = 0; distance < visibleLength; distance += sampleSpacing) {
    const fraction = distance / length;
    const envelope = Math.sin(Math.PI * fraction);
    const waveOffset = Math.sin((distance / waveLength) * Math.PI * 2 + phase) *
      amplitude * envelope;
    samples.push({
      x: start.x + (deltaX / length) * distance + normalX * waveOffset,
      y: start.y + (deltaY / length) * distance + normalY * waveOffset,
    });
  }

  const endpointFraction = visibleLength / length;
  const endpointEnvelope = Math.sin(Math.PI * endpointFraction);
  const endpointOffset = Math.sin((visibleLength / waveLength) * Math.PI * 2 + phase) *
    amplitude * endpointEnvelope;
  samples.push({
    x: start.x + (deltaX / length) * visibleLength + normalX * endpointOffset,
    y: start.y + (deltaY / length) * visibleLength + normalY * endpointOffset,
  });

  const visibleStart = samples[0];
  const visibleEnd = samples[samples.length - 1];
  const gradient = context.createLinearGradient(
    visibleStart.x,
    visibleStart.y,
    visibleEnd.x,
    visibleEnd.y
  );
  gradient.addColorStop(0, `rgba(195, 161, 107, ${0.62 * energy})`);
  gradient.addColorStop(0.55, `rgba(195, 161, 107, ${0.34 * energy})`);
  gradient.addColorStop(1, `rgba(195, 161, 107, ${0.06 * energy})`);

  context.save();
  context.strokeStyle = gradient;
  context.lineWidth = 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgba(202, 169, 116, 0.32)";
  context.shadowBlur = 7;
  context.beginPath();
  context.moveTo(samples[0].x, samples[0].y);

  for (let index = 1; index < samples.length; index += 1) {
    const previous = samples[index - 1];
    const current = samples[index];
    context.quadraticCurveTo(
      previous.x + (current.x - previous.x) * 0.5,
      previous.y + (current.y - previous.y) * 0.5,
      current.x,
      current.y
    );
  }

  context.stroke();
  context.restore();
}

function drawSoundRays(progress) {
  if (soundRays.length === 0) {
    return;
  }

  for (let index = 0; index < soundRays.length; index += 1) {
    const ray = soundRays[index];
    const phase = index * 0.57;
    drawRayPath(ray.incoming, progress, phase);

    if (ray.isReflected && ray.reflected) {
      drawRayPath(ray.reflected, Math.max(0, progress - 0.38) / 0.62, phase + 1.1, 0.58);
    }
  }
}

function stopSoundTest() {
  if (soundTestAnimationFrame !== null) {
    cancelAnimationFrame(soundTestAnimationFrame);
    soundTestAnimationFrame = null;
  }

  setSoundTestRunning(false);
}

function finishSoundTest() {
  soundTestAnimationFrame = null;
  soundTestProgress = 1;
  setSoundTestRunning(false);

  const score = calculateSeatCoverage(soundRays);
  drawTheatreScene();
  showScoreResult(score.percentage);
}

function runSoundTest() {
  if (isSoundTestRunning()) {
    return;
  }

  if (!isValidRoofDrawing()) {
    showRoofWarning();
    return;
  }

  clearRoofWarning();
  stopSoundTest();
  finishRoofDrawing();
  soundRays = createSoundRays();
  resetSeatCoverage();
  soundTestProgress = 0;
  setSoundTestRunning(true);

  if (soundRays.length === 0) {
    finishSoundTest();
    return;
  }

  if (document.hidden) {
    finishSoundTest();
    return;
  }

  const startedAt = performance.now();

  function animateSoundRays(timestamp) {
    soundTestProgress = Math.min(1, (timestamp - startedAt) / SOUND_TEST_DURATION);
    drawTheatreScene();

    if (soundTestProgress < 1) {
      soundTestAnimationFrame = requestAnimationFrame(animateSoundRays);
    } else {
      finishSoundTest();
    }
  }

  soundTestAnimationFrame = requestAnimationFrame(animateSoundRays);
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

  if (!point || !isNearRoofAnchor(point)) {
    return;
  }

  clearRoofWarning();
  soundRays = [];
  soundTestProgress = 1;
  resetSeatCoverage();
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

  if (!point || (!isInRoofArea(point) && !isNearRoofAnchor(point))) {
    finishRoofDrawing();
    return;
  }

  if (!isInRoofArea(point)) {
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

testSoundButton.addEventListener("click", runSoundTest);

const resetButton = document.getElementById("reset-button");

if (!(resetButton instanceof HTMLButtonElement)) {
  throw new Error('Echo Architect requires a button with id "reset-button".');
}

resetButton.addEventListener("click", () => {
  finishRoofDrawing();
  stopSoundTest();
  clearRoofWarning();
  soundRays = [];
  soundTestProgress = 1;
  roofPoints.length = 0;
  resetSeatCoverage();

  for (const dialog of document.querySelectorAll("dialog")) {
    if (dialog.open) {
      dialog.close();
    }
  }

  drawTheatreScene();
});

const playAgainButton = document.getElementById("play-again-button");
const retryButton = document.getElementById("retry-button");

if (!(playAgainButton instanceof HTMLButtonElement) || !(retryButton instanceof HTMLButtonElement)) {
  throw new Error("Echo Architect requires play-again and retry buttons.");
}

playAgainButton.addEventListener("click", () => resetButton.click());
retryButton.addEventListener("click", () => resetButton.click());

resetSeatCoverage();
drawTheatreScene();