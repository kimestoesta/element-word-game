// Game Logic

// Game state
let currentScore = 0;
let timeRemaining = 90; // 90 seconds
let timer = null;
let isGameActive = false;
let usedWords = new Set(); // Track used words

// Leaderboard
const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Helper function to find all possible element combinations
function findElementCombinations(word) {
    word = word.toUpperCase();
    if (!word) return [[]];
    
    let combinations = [];
    
    // Try two-letter element first (to handle cases like 'He' before 'H')
    if (word.length >= 2) {
        const twoLetters = word.slice(0, 2);
        // Convert to proper case (first letter uppercase, second lowercase)
        const properCase = twoLetters[0] + twoLetters[1].toLowerCase();
        if (periodicTable[properCase]) {
            const subCombinations = findElementCombinations(word.slice(2));
            combinations.push(...subCombinations.map(combo => 
                [{symbol: properCase, ...periodicTable[properCase]}, ...combo]
            ));
        }
    }
    
    // Try one-letter element
    const properCase = word[0];
    if (periodicTable[properCase]) {
        const subCombinations = findElementCombinations(word.slice(1));
        combinations.push(...subCombinations.map(combo => 
            [{symbol: properCase, ...periodicTable[properCase]}, ...combo]
        ));
    }
    
    return combinations;
}

// Word validation function
function validateWord(word) {
    if (!word) return null;
    const upperWord = word.toUpperCase();
    
    // Check if word was already used
    if (usedWords.has(upperWord)) {
        return {
            isValid: false,
            message: 'Word already found!',
            elements: null,
            alreadyUsed: true
        };
    }
    
    // Find all possible element combinations
    const combinations = findElementCombinations(upperWord);
    
    // Find a valid combination that makes the complete word
    const validCombo = combinations.find(combo => {
        const combinedSymbols = combo.map(el => el.symbol.toUpperCase()).join('');
        return combinedSymbols === upperWord;
    });
    
    // If we can't make it from elements, return invalid
    if (!validCombo) {
        return {
            isValid: false,
            message: 'Cannot be made from periodic table elements',
            elements: null
        };
    }
    
    // Check if it's a valid dictionary word
    if (!dictionary.isValidWord(word.toLowerCase())) {
        return {
            isValid: false,
            message: 'Valid elements but not a valid English word',
            elements: validCombo // Show which elements were found
        };
    }
    
    // Word is valid both as elements and in dictionary
    const score = calculateScore(validCombo);
    
    // Add to used words set
    usedWords.add(upperWord);
    
    return {
        isValid: true,
        message: 'Valid word!',
        elements: validCombo,
        score: score
    };
}

// Calculate score for a word
function calculateScore(elements) {
    return elements.reduce((total, element) => total + element.number, 0);
}

// Update score display
function updateScore(points) {
    currentScore += points;
    document.getElementById('score').textContent = `Score: ${currentScore}`;
}

// Timer functions
function updateTimer() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startTimer() {
    timer = setInterval(() => {
        timeRemaining--;
        updateTimer();
        
        if (timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

// Game state functions
async function startGame() {
    // Show loading message
    document.getElementById('loading-message').style.display = 'block';
    
    // Load dictionary if not already loaded
    if (!dictionary.loaded) {
        await dictionary.loadDictionary();
    }
    
    // Hide loading message
    document.getElementById('loading-message').style.display = 'none';
    
    // Reset game state
    currentScore = 0;
    timeRemaining = 90;
    isGameActive = true;
    usedWords.clear(); // Clear used words at start of game
    
    // Clear input field and word breakdown
    document.getElementById('word-input').value = '';
    document.getElementById('word-breakdown').innerHTML = '';
    
    updateScore(0);
    updateTimer();
    startTimer();
    createPeriodicTable();
    showScreen('game-screen');
}

function endGame() {
    isGameActive = false;
    clearInterval(timer);
    
    // Check for high score
    const finalScore = currentScore;
    document.getElementById('final-score').textContent = `Final Score: ${finalScore}`;
    
    if (isHighScore(finalScore)) {
        promptForPlayerName(finalScore);
    }
    
    showScreen('end-screen');
}

// Screen management
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    document.getElementById(screenId).classList.add('active');
}

// Leaderboard functions
function isHighScore(score) {
    return leaderboard.length < 3 || score > leaderboard[leaderboard.length - 1].score;
}

function updateLeaderboard(playerName, score) {
    leaderboard.push({ playerName, score });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 3) {
        leaderboard.pop();
    }
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard-entries');
    leaderboardDiv.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = `leaderboard-entry rank-${index + 1}`;
        
        const rankHtml = `<div class="rank">${index + 1}</div>`;
        const avatarHtml = `
            <div class="player-avatar">
                <svg viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
            </div>`;
        const nameHtml = `<div class="player-name">${entry.playerName}</div>`;
        const scoreHtml = `<div class="player-score">${entry.score}</div>`;
        
        entryDiv.innerHTML = rankHtml + avatarHtml + nameHtml + scoreHtml;
        leaderboardDiv.appendChild(entryDiv);
    });
}

function promptForPlayerName(score) {
    const playerName = prompt('You got a high score! Enter your name:');
    if (playerName) {
        updateLeaderboard(playerName, score);
    }
}

// Create periodic table display
function createPeriodicTable() {
    const container = document.getElementById('periodic-table');
    container.innerHTML = '';
    
    // Create and position elements
    Object.entries(periodicTable).forEach(([symbol, element]) => {
        const elementCard = document.createElement('div');
        elementCard.className = 'element-card';
        
        // Set grid position using CSS custom properties
        elementCard.style.setProperty('--group', element.group);
        elementCard.style.setProperty('--period', element.period);
        
        // Add data attributes for positioning and category
        elementCard.setAttribute('data-period', element.period);
        elementCard.setAttribute('data-group', element.group);
        
        // Add element category
        const category = getElementCategory(element);
        if (category) {
            elementCard.setAttribute('data-category', category);
        }
        
        elementCard.innerHTML = `
            <div class="element-number">${element.number}</div>
            <div class="element-symbol">${symbol}</div>
            <div class="element-name">${element.name}</div>
        `;
        
        container.appendChild(elementCard);
    });
}

// Helper function to determine element category
function getElementCategory(element) {
    const { group, period, number } = element;
    
    // Main groups
    if (group === 1 && period <= 7) return 'alkali-metal';
    if (group === 2) return 'alkaline-earth';
    if (group >= 3 && group <= 12 && period <= 7) return 'transition-metal';
    
    // Post-transition metals
    if ([13,14,15,16].includes(group) && period >= 3) {
        if ([13,14,15,16].includes(number)) return 'metalloid';
        return 'post-transition';
    }
    
    // Other categories
    if ([5,14,32,33,51,52].includes(number)) return 'metalloid';
    if (group === 18) return 'noble-gas';
    if (period === 8) return 'lanthanide';
    if (period === 9) return 'actinide';
    if ([1,6,7,8,9,15,16,17].includes(number) || group === 17) return 'nonmetal';
    
    return '';
}

// Update the word breakdown display
function updateWordBreakdown(result) {
    const breakdownDiv = document.getElementById('word-breakdown');
    
    if (!result.isValid) {
        let message = result.message;
        // If we have elements but not a valid word, show the breakdown anyway
        if (result.elements) {
            const breakdown = result.elements.map(el => 
                `${el.symbol} (${el.name}: ${el.number})`
            ).join(' + ');
            message += '<br>Elements found: ' + breakdown;
        }
        
        // Use orange color for already used words, red for other invalid cases
        const color = result.alreadyUsed ? '#f39c12' : '#e74c3c';
        breakdownDiv.innerHTML = `<span style="color: ${color};">${message}</span>`;
        return;
    }
    
    // For valid words, show the breakdown with points
    const breakdown = result.elements.map(el => 
        `${el.symbol} (${el.name}: ${el.number})`
    ).join(' + ');
    
    const totalPoints = result.score;
    
    breakdownDiv.innerHTML = `
        <span style="color: #27ae60;">✓ Valid word! (${totalPoints} points)</span><br>
        ${breakdown}
    `;
    
    // Briefly highlight the word breakdown
    breakdownDiv.style.backgroundColor = '#eafaf1';
    setTimeout(() => {
        breakdownDiv.style.backgroundColor = '#f8f9fa';
    }, 500);
}

// Handle word submission
function handleWordSubmit() {
    const wordInput = document.getElementById('word-input');
    const word = wordInput.value.trim();
    
    if (!word) return;
    
    const result = validateWord(word);
    if (result.isValid) {
        updateScore(result.score);
    }
    updateWordBreakdown(result);
    wordInput.value = '';
    wordInput.focus();
}

// Verify periodic table data is loaded correctly
console.log('Periodic Table Data:', {
    'F': periodicTable['F'],
    'LI': periodicTable['LI'],
    'C': periodicTable['C'],
    'K': periodicTable['K']
}); 