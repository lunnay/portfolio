document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelectorAll('.nene-system').forEach((container, index) => {
        
        container.innerHTML = `
            <div class="cuddle-area" id="cuddle"></div>
            <div class="boop-area" id="booping"></div>
            <div class="character-body">
                <div class="character-head"></div>
                <div class="character-main"></div>
            </div>
        `;
        const style = document.createElement('style');
        style.textContent = `
            .nene-system { width: 80px; height: 80px; position: relative; }
            .cuddle-area {
                cursor: url(cursores/petting.png), auto; 
                position: absolute; 
                width: 60px; height: 30px; 
                transform: translate(10px, 0px); z-index: 2;
            }
            .boop-area {
                cursor: url(cursores/pontano.png), auto;
                position: absolute;
                width: 15px; height: 15px;
                transform: translate(28px, 40px); z-index: 2;
            }
            .character-head {
                position: fixed;
                width: 80px; height: 80px;
                background-image: url(fotos/nn_head.png); z-index: 1;
            }
            .character-main {
                position: fixed;
                width: 80px; height: 80px;
                background-image: url(fotos/nn_body.png);
            }
        `;
        document.head.appendChild(style);

        const nnHead = container.querySelector('.character-head');
        const cuddleArea = container.querySelector('.cuddle-area');
        const boopArea = container.querySelector('.boop-area');

        let lastMouseX = 0, lastMouseY = 0;
        
        cuddleArea.addEventListener('mouseenter', () => {
            lastMouseX = 0;
            lastMouseY = 0;
        });

        cuddleArea.addEventListener('mousemove', (e) => {
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            const speed = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
            
            if (speed < 5) {
                nnHead.style.transform = `
                    rotate(${deltaX * 0.5}deg)
                    translate(${deltaX * 0.2}px, ${deltaY * 0.2}px)
                `;
            }
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });

        cuddleArea.addEventListener('mouseleave', () => {
            nnHead.style.transform = 'none';
        });

        boopArea.addEventListener('click', () => {
            nnHead.style.transform = 'translate(0.5px, -1px)';
            setTimeout(() => nnHead.style.transform = 'none', 100);
        });
    });
});