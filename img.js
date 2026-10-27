
methods: {
  getFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = async () => {
        try {
          const maxSize = 950;

          let width = img.width;
          let height = img.height;

          // 1. 計算最終圖片尺寸
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

          // 2. 建立高解析度 Canvas
          const scale = 2;

          const highCanvas = document.createElement('canvas');
          highCanvas.width = width * scale;
          highCanvas.height = height * scale;

          const highCtx = highCanvas.getContext('2d');

          // 3. 先繪製高解析度圖片
          highCtx.drawImage(
            img,
            0,
            0,
            highCanvas.width,
            highCanvas.height
          );

          // 4. 在高解析度 Canvas 上加浮水印
          await this.addWatermark(highCanvas, scale);

          // 5. 最後才縮小到正式輸出尺寸
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          ctx.drawImage(
            highCanvas,
            0,
            0,
            width,
            height
          );

          // 6. 維持 JPEG 品質 0.5
          this.inputVal = canvas.toDataURL('image/jpeg', 0.5);
          this.$emit('input', this.inputVal);

        } catch (error) {
          console.error('圖片處理失敗:', error);
        }
      };

      img.onerror = () => {
        console.error('圖片載入失敗');
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      console.error('檔案讀取失敗');
    };

    reader.readAsDataURL(file);
  },

  async addWatermark(canvas, scale = 2) {
    const ctx = canvas.getContext('2d');

    // 使用最終輸出尺寸計算浮水印
    const width = canvas.width / scale;
    const height = canvas.height / scale;

    const watermark = 'XXXXXXX用';
    const fontFamily = 'TW-MOE-Std-Kai';

    const angle = -Math.atan2(height, width);
    const diagonal = Math.hypot(width, height);

    // 1. 等待字型載入
    await document.fonts.load(
      `bold 24px "${fontFamily}"`,
      watermark
    );

    // 2. 計算字體大小
    let fontSize = Math.min(width, height) * 0.15;

    ctx.save();

    // 使用 scale 放大座標系統
    ctx.scale(scale, scale);

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

    // 3. 移動到圖片中心並旋轉
    ctx.translate(width / 2, height / 2);
    ctx.rotate(angle);

    // 4. 設定浮水印樣式
    ctx.font = `bold ${fontSize}px "${fontFamily}"`;
    ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 5. 直接繪製高解析度旋轉文字
    ctx.fillText(watermark, 0, 0);

    ctx.restore();
  }
}
