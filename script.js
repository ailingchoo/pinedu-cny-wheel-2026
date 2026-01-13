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
  ctx.font = "900 14px system-ui, sans-serif"

