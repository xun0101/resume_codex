img.onload = async () => {
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

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

   
            const watermark = 'XXXXXXX用';
            const fontFamily = 'TW-MOE-Std-Kai';
            await document.fonts.load(`bold 24px "${fontFamily}"`, watermark);
      
            const angle = -Math.atan2(height, width);
            const diagonal = Math.hypot(width, height);
            ctx.save();
          
            ctx.translate(width / 2, height / 2);
            ctx.rotate(angle);
       
            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
         
            let fontSize = Math.min(width, height) * 0.15;
            ctx.font = `bold ${fontSize}px "${fontFamily}"`;
            const textWidth = ctx.measureText(watermark).width;
            const targetWidth = diagonal * 0.85;
            if (textWidth > 0) {
            fontSize *= targetWidth / textWidth;
            }
            
     
            fontSize = Math.min(
            fontSize,
            // Math.min(width, height) * 0.121
            diagonal * 0.075
            );
            // fontSize = 90.62
            ctx.font = `bold ${fontSize}px "${fontFamily}"`;


            ctx.fillText(watermark, 0, 0);
            
            ctx.restore();
            
            this.inputVal = canvas.toDataURL('image/jpeg', 0.5);
            this.$emit('input', this.inputVal);
          }
