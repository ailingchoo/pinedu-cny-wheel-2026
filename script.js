// =======================
// 奖项 & 权重
// =======================
const prizes = ["RM8", "RM18", "RM28", "RM58", "RM88 🏆大奖"];
const weights = [45, 30, 15, 8, 2];

// 轮盘上显示（避免太长）
const wheelLabels = ["RM8", "RM18", "RM28", "RM58", "RM88"];

// =======================
// 只能转一次
// =======================
const STORAGE_KEY = "PINEDU_WHEEL_SPUN_FINAL_V3";
const WIN_KEY = "PINEDU_WHEEL_WIN_FINAL_V3";

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
const radius = Math.min(W, H) / 2 - 6;

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
// 描边文字（更清楚）
// =======================
function drawTextOutlined(text, x, y, fontSize = 20) {
  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${fontSize}px system-ui`;

  // 描边 + 阴影，盖在上层也清楚
  ctx.shadowColor = "rgba(0,0,0,.35)";
  ctx.shadowBlur = 6;

  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.strokeText(text, x, y);

  ctx.fillStyle = "#111827";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawCenter() {
  // ✅ 中心再缩小一点，给奖项文字更多空间
  const centerR = 70;
  const logoR = 46;
  const logoSize = 92;

  // ✅ Logo 往下，给“马年好运”位置
  const logoY = 14;

  // 底圆
  ctx.beginPath();
  ctx.arc(0, 0, centerR, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(17,24,39,.92)";
  ctx.fill();

  // 金色发光
  ctx.save();
  ctx.shadowColor = "rgba(255,215,120,.55)";
  ctx.shadowBlur = 16;
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

  // ✅ 马年好运：放在 logo 上方、不会被挡（更大）
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "900 26px system-ui";
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowBlur = 8;
  ctx.lineWidth = 6;
  ctx.strokeStyle = "rgba(0,0,0,.55)";
  ctx.strokeText("马年好运", 0, -28);
  ctx.fillStyle = "rgba(255,255,255,.98)";
  ctx.fillText("马年好运", 0, -28);
  ctx.restore();

  // Logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, logoY, logoR, 0, Math.PI * 2);
  ctx.clip();
  try {
    ctx.drawImage(logoImg, -logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
  } catch {}
  ctx.restore();
}

function drawLabelsOnTop() {
  const n = wheelLabels.length;
  const arc = (Math.PI * 2) / n;

  for (let i = 0; i < n; i++) {
    ctx.save();
    ctx.rotate(i * arc + arc / 2);

    // ✅ 再往外一点，保证永远不被中心挡
    // 数值越大越靠外：radius - 4 / radius - 0
    drawTextOutlined(wheelLabels[i], radius - 2, 8, 22);

    ctx.restore();
  }
}

// =======================
// 绘制转盘（关键：文字最后画）
// =======================
function drawWheel() {
  ctx.clearRect(0, 0, W, H);

  const n = wheelLabels.length;
  const arc = (Math.PI * 2) / n;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // 1) 先画扇形（不画文字）
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, i * arc, (i + 1) * arc);
    ctx.closePath();
    ctx.fillStyle = hashToColor(wheelLabels[i]);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // 2) 再画中心（会盖到里面的区域没关系）
  drawCenter();

  // 3) 最后再把奖项文字画一次（盖在最上面，永远不会被挡）
  drawLabelsOnTop();

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
  const arc = (Math.PI * 2) / wheelLabels.length;
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

