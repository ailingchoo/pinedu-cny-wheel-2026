// =======================
// 奖项 & 权重
// =======================
const prizes = ["RM8", "RM18", "RM28", "RM58", "RM88 🏆大奖"];
const weights = [45, 30, 15, 8, 2];

// =======================
// 只能转一次
// =======================
const STORAGE_KEY = "PINEDU_WHEEL_SPUN_FINAL";
const WIN_KEY = "PINEDU_WHEEL_WIN_FINAL";

// =======================
// Canvas
// =======================
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultText = document.getElementById("resultText");

const W = canvas.width;
const H = canvas.height;
const cx = W / 2;
const cy = H / 2;
const radius = Math.min(W, H) / 2 - 10;

let rotation = 0;
let spinning = false;

// =======================
// Logo
// =======================
const logoImg = new Image();
logoImg.src = "logo.png";
logoImg.onload = () => drawWheel();
logoImg.onerror = () => drawWheel();

// =======================
// 扇形颜色
// =======================
function hashToColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `rgb(${120 + (h % 90)}, ${120 + ((h >> 8) % 90)}, ${120 + ((h >> 16) % 90)})`;
}

// =======================
// 只画一次的环绕字（4字）
// =======================
function drawCircularOnce(text, r, start = -Math.PI / 2) {
  ctx.save();
  ctx.font = "900 14px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars = [...text];
  const step = (Math.PI * 2) / chars.length;
  let angle = start;

  for (const ch of chars) {
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -r);
    ctx.rotate(-angle);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += step;
  }
  ctx.restore();
}

// =======================
// 画转盘
// =======================
function drawWheel() {
  ctx.clearRect(0, 0, W, H);
  const n = prizes.length;
  const arc = (Math.PI * 2) / n;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // 扇形
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, i * arc, (i + 1) * arc);
    ctx.closePath();
    ctx.fillStyle = hashToColor(prizes[i]);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(i * arc + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#111827";
    ctx.font = "900 19px system-ui";
    ctx.fillText(prizes[i], radius - 16, 6);
    ctx.restore();
  }

  // =======================
  // 中心高级区域
  // =======================
  const centerR = 92;
  const logoR = 54;
  const logoSize = 110;
  const logoY = -6;

  // 底圆
  ctx.beginPath();
  ctx.arc(0, 0, centerR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(17,24,39,.92)";
  ctx.fill();

  // 金色发光
  ctx.save();
  ctx.shadowColor = "rgba(255,215,120,.55)";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(0, 0, centerR + 2, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,215,120,.55)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 金色边框
  ctx.beginPath();
  ctx.arc(0, 0, centerR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,210,110,.95)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, logoY, logoR, 0, Math.PI * 2);
  ctx.clip();
  try {
    ctx.drawImage(logoImg, -logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
  } catch {}
  ctx.restore();

  // ✅ 只出现一次的「马年好运」
  drawCircularOnce("马年好运", 72);

  ctx.restore();
}

// =======================
// 抽奖逻辑
// =======================
function pickIndexByWeight(ws) {
  const total = ws.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ws.length; i++) {
    r -= ws[i];
    if (r <= 0) return i;
  }
  return ws.length - 1;
}

function angleToIndex(index) {
  const arc = (Math.PI * 2) / prizes.length;
  const centerAngle = index * arc + arc / 2;
  const pointer = -Math.PI / 2;
  return ((pointer - centerAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
}

function lockUI(prize) {
  spinBtn.disabled = true;
  resultText.textContent = `🎉 抽中：${prize}`;
}

function spin() {
  if (spinning) return;

  if (localStorage.getItem(STORAGE_KEY)) {
    lockUI(localStorage.getItem(WIN_KEY));
    return;
  }

  spinning = true;
  spinBtn.disabled = true;
  resultText.textContent = "转盘旋转中…";

  const win = pickIndexByWeight(weights);
  const target = angleToIndex(win) + (7 + Math.floor(Math.random() * 2)) * Math.PI * 2;

  const start = rotation;
  const delta = target - start;
  const t0 = performance.now();

  function animate(t) {
    const p = Math.min(1, (t - t0) / 4200);
    rotation = start + delta * (1 - Math.pow(1 - p, 3));
    drawWheel();
    if (p < 1) requestAnimationFrame(animate);
    else {
      spinning = false;
      const prize = prizes[win];
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(WIN_KEY, prize);
      lockUI(prize);
    }
  }
  requestAnimationFrame(animate);
}

spinBtn.addEventListener("click", spin);
drawWheel();

if (localStorage.getItem(STORAGE_KEY)) {
  lockUI(localStorage.getItem(WIN_KEY));
}

