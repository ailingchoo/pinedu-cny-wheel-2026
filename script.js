// =======================
// 奖项 & 权重
// =======================
const prizes = ["RM8", "RM18", "RM28", "RM58", "RM88 🏆大奖"];
const weights = [45, 30, 15, 8, 2]; // RM88 很难中

// =======================
// 只能转一次（localStorage）
// =======================
const STORAGE_KEY = "PINEDU_CNY_WHEEL_SPUN_FINAL";
const WIN_KEY = "PINEDU_CNY_WHEEL_WIN_FINAL";

// =======================
// Canvas 元素
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
// 载入 Logo（根目录 logo.png）
// =======================
const logoImg = new Image();
logoImg.src = "logo.png";
logoImg.onload = () => drawWheel();
logoImg.onerror = () => drawWheel();

// =======================
// 颜色函数（稳定分配）
// =======================
function hashToColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  const r = 120 + (h % 90);
  const g = 120 + ((h >> 8) % 90);
  const b = 120 + ((h >> 16) % 90);
  return `rgb(${r},${g},${b})`;
}

// =======================
// 环绕文字：重复铺满整圈（4字反复）
// =======================
function drawCircularRepeatText(baseText, x, y, r) {
  ctx.save();
  ctx.translate(x, y);

  // 字体风格（你想更大更霸气：把 14 改 15/16）
  ctx.font = "900 14px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // 让它更像一圈“标志字环”，间距紧一点好看
  const spacing = 0.22; // 越小越密（0.20~0.26）
  const totalAngle = Math.PI * 2;

  // 需要多少个字符才能铺满整圈
  const chars = [...baseText];
  const count = Math.ceil(totalAngle / spacing);
  const repeated = Array.from({ length: count }, (_, i) => chars[i % chars.length]);

  // 从正上方开始
  let angle = -Math.PI / 2;

  for (const ch of repeated) {
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -r);
    ctx.rotate(-angle); // 保持字正向
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += spacing;
  }

  ctx.restore();
}

// =======================
// 绘制转盘
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
    const start = i * arc;
    const end = start + arc;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = hashToColor(prizes[i]);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(17,24,39,.95)";
    ctx.font = "900 19px system-ui, sans-serif";
    ctx.fillText(prizes[i], radius - 16, 7);
    ctx.restore();
  }

  // =======================
  // 高级中心区域（大圆 + 金框 + 发光 + 环绕字）
  // =======================
  const centerR = 92;
  const logoClipR = 54;
  const logoSize = 110;

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

  // 金色细框
  ctx.beginPath();
  ctx.arc(0, 0, centerR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(255,210,110,.95)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Logo（稍微上移一点点更居中）
  const logoY = -6;
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, logoY, logoClipR, 0, Math.PI * 2);
  ctx.clip();
  try {
    ctx.drawImage(logoImg, -logoSize / 2, logoY - logoSize / 2, logoSize, logoSize);
  } catch (e) {}
  ctx.restore();

  // ✅ 环绕字：4字“马年好运”重复铺满整圈
  // r = 72 控制字离 logo 的距离（想更贴近：68；想更外圈：76）
  drawCircularRepeatText("马年好运", 0, logoY, 72);

  ctx.restore();
}

// =======================
// 权重抽奖
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
  const pointerAngle = -Math.PI / 2;
  let target = pointerAngle - centerAngle;
  return ((target % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
}

// =======================
// 转动逻辑
// =======================
function lockUI(prize) {
  spinBtn.disabled = true;
  resultText.textContent = `✅ 抽奖完成：🎉 ${prize}`;
}

function spin() {
  if (spinning) return;

  if (localStorage.getItem(STORAGE_KEY) === "1") {
    lockUI(localStorage.getItem(WIN_KEY) || "");
    return;
  }

  spinning = true;
  spinBtn.disabled = true;
  resultText.textContent = "转盘旋转中… 🎡";

  const winner = pickIndexByWeight(weights);
  const target = angleToIndex(winner);
  const finalRotation = target + (7 + Math.floor(Math.random() * 2)) * Math.PI * 2;

  const startRotation = rotation;
  const delta = finalRotation - startRotation;
  const duration = 4200;
  const start = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min(1, (now - start) / duration);
    rotation = startRotation + delta * easeOut(t);
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      drawWheel();
      const prize = prizes[winner];
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(WIN_KEY, prize);
      lockUI(prize);
    }
  }

  requestAnimationFrame(animate);
}

spinBtn.addEventListener("click", spin);

// 初始载入
drawWheel();
if (localStorage.getItem(STORAGE_KEY) === "1") {
  lockUI(localStorage.getItem(WIN_KEY) || "");
}

