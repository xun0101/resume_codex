
async getFile(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const img = new Image();

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const maxSize = 950;

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        width = Math.round(width);
        height = Math.round(height);

        canvas.width = width;
        canvas.height = height;

        // 先繪製原始圖片
        // 這裡不設定 globalAlpha，避免影響原圖
        ctx.drawImage(img, 0, 0, width, height);

        // 浮水印全部交由 addWatermark 處理
        await this.addWatermark(canvas);

        // 維持原本 JPEG 品質 0.5
        this.inputVal = canvas.toDataURL('image/jpeg', 0.5);
        this.$emit('input', this.inputVal);

      } catch (error) {
        console.error('圖片處理失敗:', error);
      }
    };

    img.onerror = () => {
      console.error('圖片載入失敗');
    };

    img.src = reader.result;
  };

  reader.onerror = () => {
    console.error('檔案讀取失敗');
  };

  reader.readAsDataURL(file);
},

async addWatermark(canvas) {
  const ctx = canvas.getContext('2d');

  const width = canvas.width;
  const height = canvas.height;

  const watermark = 'XXXXXXX用';
  const fontFamily = 'TW-MOE-Std-Kai';

  // 保留原本的浮水印角度
  const angle = -Math.atan2(height, width);
  const diagonal = Math.hypot(width, height);

  // 保留原本的字體大小計算方式
  let fontSize = Math.min(width, height) * 0.15;

  ctx.save();
  ctx.font = `bold ${fontSize}px "${fontFamily}"`;

  const textWidth = ctx.measureText(watermark).width;
  const targetWidth = diagonal * 0.85;

  if (textWidth > 0) {
    fontSize *= targetWidth / textWidth;
  }

  fontSize = Math.min(
    fontSize,
    diagonal * 0.075
  );

  ctx.restore();

  const fontSpec = `bold ${fontSize}px "${fontFamily}"`;

  // 沿用原本的字型載入方式
  await document.fonts.load(fontSpec, watermark);

  // 使用獨立文字 Canvas，維持 scale = 2
  const scale = 2;

  const textCanvas = document.createElement('canvas');
  const textCtx = textCanvas.getContext('2d');

  textCtx.font = fontSpec;

  const metrics = textCtx.measureText(watermark);

  const textWidthPx = Math.ceil(
    metrics.width + fontSize * 2
  );

  const textHeightPx = Math.ceil(fontSize * 3);

  textCanvas.width = Math.ceil(textWidthPx * scale);
  textCanvas.height = Math.ceil(textHeightPx * scale);

  textCtx.scale(scale, scale);

  textCtx.font = fontSpec;

  // 恢復半透明灰色文字
  // 不使用 globalAlpha
  textCtx.fillStyle = 'rgba(128, 128, 128, 0.5)';
  textCtx.textAlign = 'center';
  textCtx.textBaseline = 'middle';

  textCtx.fillText(
    watermark,
    textWidthPx / 2,
    textHeightPx / 2
  );

  // 在最終圖片上合成浮水印
  ctx.save();

  ctx.translate(width / 2, height / 2);
  ctx.rotate(angle);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    textCanvas,
    -textWidthPx / 2,
    -textHeightPx / 2,
    textWidthPx,
    textHeightPx
  );

  ctx.restore();
}
