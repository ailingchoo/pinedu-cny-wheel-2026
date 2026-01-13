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
logoImg.onerror = () => drawWheel(); // 如果 logo 找不到，也不会卡死

// （可选）如果你之后上传 horse.png，就会自动用图片；没上传就用🐴
const horseImg = new Image();
horseImg.src = "horse.png";
le

