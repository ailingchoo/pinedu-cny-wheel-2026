// ====== 奖项（5格）======
const prizes = ["RM8", "RM18", "RM28", "RM58", "RM88 🏆大奖"];
const weights = [45, 30, 15, 8, 2]; // RM88 = 2% 很难中

// ====== 只能转一次 ======
const STORAGE_KEY = "PINEDU_CNY_WHEEL_SPUN_V2";
const WIN_KEY = "PINEDU_CNY_WHEEL_WIN_V2";

// ====== Canvas ======
const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const resultText = document.getElementById("resultText");

const W = canvas.width, H = canvas.height;
const cx = W / 2, cy = H / 2;
const radius = Math.min(W, H) / 2 - 10;

let rotation = 0;
let spinning = false;

// ====== 载入 Logo 图片（放在 repo 根目录：logo.png）======
const logoImg = new Image();
logoImg.src = "logo.png";
logoImg.onload = () => drawWheel();
logoImg.onerror = () => drawWheel();

// ====== 颜色：每个奖项稳定分配一种颜色 ======
function hashToColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const r = 120 + (h % 90);
  const g = 120 + ((h >> 8) % 90);
  const b = 120 + ((h >> 16) % 90);
  return `rgb(${r},${g},${b})`;
}

// ====== 画转盘 ======
function drawWheel() {
  ctx.clearRect(0, 0, W, H);

  const n = prizes.length;
  const arc = (Math.PI * 2) / n;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

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

    // 文字
    ctx.save();
    ctx.rotate(start + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(17,24,39,.95)";
    ctx.font = "900 19px system-ui, sans-serif";
    ctx.fillText(prizes[i], radius - 16, 7);
    ctx.restore();
  }

  // ====== 中心圆圈底 ======
  ctx.beginPath();
  ctx.arc(0, 0, 72, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(17,24,39,.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // ====== 中心：放 Logo（圆形裁切）======
  const logoSize = 86; // 80~100
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 42, 0, Math.PI * 2);
  ctx.clip();
  try {
    ctx.drawImage(logoImg, -logoSize / 2, -logoSize / 2, logoSize, logoSize);
  } catch (e) {}
  ctx.restore();

  // ====== 中心祝福文字（无马emoji，更干净）======
  ctx.fillStyle = "rgba(255,255,255,.95)";
  ctx.textAlign = "center";
  ctx.font = "800 14px system-ui, sans-serif";
  ctx.fillText("马年好运", 0, 56);
  ctx.font = "600 11px system-ui, sans-serif";
  ctx.fillText("新春快乐 · 品教育", 0, 72);

  // ====== 提示 ======
  ctx.fillStyle = "rgba(255,255,255,.85)";
  ctx.font = "700 11px system-ui, sans-serif";
  ctx.fillText("只限一次抽奖", 0, 88);

  ctx.restore(); // 结束 translate/rotate
} // ✅ 这里结束 drawWheel

// ====== 权重抽奖 ======
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
  const n = prizes.length;
  const arc = (Math.PI * 2) / n;
  const centerAngle = index * arc + arc / 2;
  const pointerAngle = -Math.PI / 2; // 12点方向
  let targetRotation = pointerAngle - centerAngle;
  targetRotation = ((targetRotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  return targetRotation;
}

function lockUIWithPrize(prize) {
  spinBtn.disabled = true;
  resultText.textContent = `✅ 你已完成一次抽奖：🎉 ${prize}`;
}

function spin() {
  if (spinning) return;

  // 已转过：直接锁
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    lockUIWithPrize(localStorage.getItem(WIN_KEY) || "（已抽奖）");
    return;
  }

  spinning = true;
  spinBtn.disabled = true;
  resultText.textContent = "转盘旋转中… 🎡";

  const winnerIndex = pickIndexByWeight(weights);
  const target = angleToIndex(winnerIndex);

  const extraSpins = 7 + Math.floor(Math.random() * 2);
  const finalRotation = target + extraSpins * Math.PI * 2;

  const startRotation = rotation;
  const delta = finalRotation - startRotation;

  const duration = 4200;
  const start = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min(1, (now - start) / duration);
    rotation = startRotation + delta * easeOutCubic(t);
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;

      rotation = ((rotation % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
      drawWheel();

      const prize = prizes[winnerIndex];
      localStorage.setItem(STORAGE_KEY, "1");
      localStorage.setItem(WIN_KEY, prize);
      lockUIWithPrize(prize);
    }
  }

  requestAnimationFrame(animate);
}

spinBtn.addEventListener("click", spin);

// 初次载入
drawWheel();
if (localStorage.getItem(STORAGE_KEY) === "1") {
  lockUIWithPrize(localStorage.getItem(WIN_KEY) || "（已抽奖）");
}
