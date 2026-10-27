// 測試：在全新的 Canvas 上合成一次浮水印
const testCanvas = document.createElement('canvas');
testCanvas.width = width;
testCanvas.height = height;

const testCtx = testCanvas.getContext('2d');

// 使用純白背景，排除原本照片與既有浮水印
testCtx.fillStyle = '#ffffff';
testCtx.fillRect(0, 0, width, height);

testCtx.save();
testCtx.translate(width / 2, height / 2);
testCtx.rotate(angle);

testCtx.drawImage(
  textCanvas,
  -textWidthPx / 2,
  -textHeightPx / 2,
  textWidthPx,
  textHeightPx
);

testCtx.restore();
