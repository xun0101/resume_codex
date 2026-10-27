getFile(e) {
    const file = e.target.files[0];
    const inputResult = this.chceck(file);
    if (!inputResult) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
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
            ctx.drawImage(img, 0, 0, width, height);

            // 浮水印全部交由 addWatermark 處理
            await this.addWatermark(canvas);
          
            // 維持原本 JPEG 品質 0.5
            this.inputVal = canvas.toDataURL('image/jpeg', 0.5);
            this.$emit('input', this.inputVal);
          } catch {
            this.newAlert.option.content = '圖片加載失敗';
            this.newAlert.show = true;
          }
        };
        img.src = event.target.result;
      };
      this.imgTitle = file.name;
    } else {
      this.alert.content = inputResult;
      this.newAlert.show = true;
    }
  },
