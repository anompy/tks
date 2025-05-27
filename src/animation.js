function AnimationCorrectAnswer(data, result) {
    const delay = 30;

    for (let i = 0; i < data.length; i++) {
        const letter = result[i];
        const hintSpan = document.querySelector(`#hint-${i + 1}`);
        const target = document.getElementById(`box-${data[i]}`);
        const fromRect = hintSpan.getBoundingClientRect();
        const toRect = target.getBoundingClientRect();

        setTimeout(() => {
            // Clone huruf
            const flyingLetter = hintSpan.cloneNode(true);
            hintSpan.remove();
            flyingLetter.style.position = "fixed";
            flyingLetter.style.left = fromRect.left + fromRect.width / 2 + "px";
            flyingLetter.style.top = fromRect.top + fromRect.height / 2 + "px";
            flyingLetter.style.transform = "translate(-50%, -50%)";
            flyingLetter.style.transition = "left 0.5s ease, top 0.5s ease";
            flyingLetter.style.zIndex = "2000";
            flyingLetter.style.pointerEvents = "none";
            flyingLetter.style.fontSize = "28px";
            flyingLetter.style.fontWeight = "bold";

            document.body.appendChild(flyingLetter);

            // Biarkan browser render posisi awal dulu
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    flyingLetter.style.left = toRect.left + toRect.width / 2 + "px";
                    flyingLetter.style.top = toRect.top + toRect.height / 2 + "px";
                });
            });

            // Setelah sampai tujuan
            setTimeout(() => {
                flyingLetter.remove();
                target.classList.add("solved");
                target.textContent = letter;
                target.style.transform = "scale(1.1)";
                target.style.zIndex = "110";

                setTimeout(() => {
                    target.style.transform = "scale(1)";
                    target.style.zIndex = "100";
                }, 200);
            }, 500);
            
        }, i * delay);
    }
    
}
