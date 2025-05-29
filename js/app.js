// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Start button
    document.getElementById('start-button').addEventListener('click', startGame);
    
    // Word submission
    document.getElementById('submit-word').addEventListener('click', () => {
        if (!isGameActive) return;
        
        const wordInput = document.getElementById('word-input');
        const word = wordInput.value.trim();
        
        if (word) {
            const result = validateWord(word);
            if (result && result.isValid) {
                updateScore(result.score);
                updateWordBreakdown(result);
            } else if (result) {
                updateWordBreakdown(result);
            }
            wordInput.value = '';
        }
    });
    
    // Word input enter key
    document.getElementById('word-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('submit-word').click();
        }
    });
    
    // Play again button
    document.getElementById('play-again').addEventListener('click', startGame);
    
    // Leaderboard buttons
    document.getElementById('view-leaderboard-button').addEventListener('click', () => {
        displayLeaderboard();
        showScreen('leaderboard-screen');
    });
    
    document.getElementById('end-leaderboard').addEventListener('click', () => {
        displayLeaderboard();
        showScreen('leaderboard-screen');
    });
    
    // Back to start button
    document.getElementById('back-to-start').addEventListener('click', () => {
        showScreen('start-screen');
    });

    // Back button during game
    document.getElementById('back-to-start-ingame').addEventListener('click', () => {
        if (confirm('Are you sure you want to end the game? Your score will be lost.')) {
            isGameActive = false;
            clearInterval(timer);
            showScreen('start-screen');
        }
    });

    // Add click-to-add functionality for element cards
    document.getElementById('periodic-table').addEventListener('click', (e) => {
        const elementCard = e.target.closest('.element-card');
        if (elementCard && isGameActive) {
            const wordInput = document.getElementById('word-input');
            const symbol = elementCard.querySelector('.element-symbol').textContent;
            wordInput.value += symbol;
            wordInput.focus();
        }
    });

    // Add loading message styling
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.backgroundColor = '#f8f9fa';
    loadingMessage.style.color = '#2c3e50';
    loadingMessage.style.borderRadius = '5px';
    loadingMessage.style.border = '1px solid #e0e0e0';
    loadingMessage.style.zIndex = '1000';
}); 