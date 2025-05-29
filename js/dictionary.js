// Dictionary functionality
class Dictionary {
    constructor() {
        this.words = new Set();
        this.loaded = false;
    }

    async loadDictionary() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/redbo/scrabble/master/dictionary.txt');
            const text = await response.text();
            this.words = new Set(text.split('\n').map(word => word.toUpperCase().trim()));
            this.loaded = true;
            console.log('Dictionary loaded successfully');
        } catch (error) {
            console.error('Error loading dictionary:', error);
            // Fallback to basic dictionary if loading fails
            this.words = new Set(['BACON', 'SCAN', 'HELP', 'COINS', 'BASIC', 'PANIC', 'NICE', 'CARE', 'RAIN', 'GAIN']);
            this.loaded = true;
        }
    }

    isValidWord(word) {
        return this.words.has(word.toUpperCase());
    }
}

// Create and export dictionary instance
const dictionary = new Dictionary(); 