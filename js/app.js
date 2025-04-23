/**
 * Main Application Logic - Memory Game Version
 * This file contains the main functionality for the Pokemon Memory Game
 */
import { PokemonService } from './pokemon.js';

// DOM Elements
const cardGrid = document.getElementById('card-grid');
const loadingSpinner = document.getElementById('loading-spinner');

// Constants
const CARD_COUNT = 12;
const TOTAL_PAIRS = 6;

// Application State
let cards = [];
let firstSelectedCard = null;
let secondSelectedCard = null;
let isProcessingPair = false;
let matchedPairs = 0;

// Debug flag - set to true to simulate slower loading
const DEBUG_SHOW_SPINNER = true;
const LOADING_DELAY = 1000; // 1 second delay

/**
 * Initialize the application
 */
async function initApp() {
  // Show loading spinner
  showLoading();

  // Hide the card grid initially
  cardGrid.classList.add('hidden');

  // Create card elements
  createCardElements();

  // Fetch initial Pokemon data
  await fetchAndAssignPokemon();

  // Set up event listeners
  setupEventListeners();

  // Hide loading spinner and show cards
  hideLoading();
  cardGrid.classList.remove('hidden');
}

/**
 * Create card elements in the grid
 */
function createCardElements() {
  // Clear existing cards
  cardGrid.innerHTML = '';
  cards = [];

  // Create new cards
  for (let i = 0; i < CARD_COUNT; i++) {
    const card = createCardElement(i);
    cardGrid.appendChild(card);
    cards.push(card);
  }
}

/**
 * Create a single card element
 * @param {number} index - Card index
 * @returns {HTMLElement} Card element
 */
function createCardElement(index) {
  // Create card elements
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = index;

  const cardInner = document.createElement('div');
  cardInner.className = 'card-inner';

  const cardFront = document.createElement('div');
  cardFront.className = 'card-front';

  const cardBack = document.createElement('div');
  cardBack.className = 'card-back';

  // Add Pokeball image to front
  const pokeballImg = document.createElement('img');
  pokeballImg.src = '/assets/pokeball.png';
  pokeballImg.alt = 'red and white Pokéball';
  pokeballImg.className = 'pokeball-img';
  cardFront.appendChild(pokeballImg);

  // Assemble card
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  card.appendChild(cardInner);

  return card;
}

/**
 * Fetch and assign Pokemon to cards
 */
async function fetchAndAssignPokemon() {
  try {
    // Fetch 6 unique Pokémon instead of 12
    const pokemonList = await PokemonService.fetchMultipleRandomPokemon(6);

    // Create pairs by duplicating each Pokémon
    const pokemonPairs = [];
    pokemonList.forEach(pokemon => {
      // Add two copies of each Pokémon for matching pairs
      // Using spread operator to create a shallow copy
      pokemonPairs.push({ ...pokemon });
      pokemonPairs.push({ ...pokemon });
    });

    // Shuffle the pairs using Fisher-Yates algorithm
    const shuffledPairs = shuffleArray(pokemonPairs);

    // If debug flag is on, add artificial delay to show the spinner
    if (DEBUG_SHOW_SPINNER) {
      await new Promise(resolve => setTimeout(resolve, LOADING_DELAY));
    }

    // Assign Pokémon to cards with error checking
    for (let i = 0; i < Math.min(CARD_COUNT, shuffledPairs.length); i++) {
      if (cards[i] && shuffledPairs[i]) {
        assignPokemonToCard(cards[i], shuffledPairs[i]);
      }
    }
  } catch (error) {
    console.error('Error fetching and assigning Pokemon:', error);
    // User-friendly error handling
    showErrorMessage('Failed to load Pokémon. Please try refreshing the page.');
  }
}

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array copy
 */
function shuffleArray(array) {
  // Create a deep copy of the array to avoid modifying the original
  const arrayCopy = structuredClone(array);

  // Fisher-Yates algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }

  return arrayCopy;
}

/**
 * Assign a Pokemon to a card
 * @param {HTMLElement} card - Card element
 * @param {Object} pokemon - Pokemon data
 */
function assignPokemonToCard(card, pokemon) {
  if (!card || !pokemon) {
    return;
  }

  // Store Pokemon data in card dataset
  card.dataset.pokemon = JSON.stringify(pokemon);

  // Get card back element
  const cardBack = card.querySelector('.card-back');

  // Clear existing content
  cardBack.innerHTML = '';

  // Create Pokemon elements
  const pokemonImg = document.createElement('img');
  pokemonImg.src = pokemon.sprite;
  pokemonImg.alt = pokemon.name;
  pokemonImg.className = 'pokemon-img';

  const pokemonName = document.createElement('h2');
  pokemonName.textContent = pokemon.name;
  pokemonName.className = 'pokemon-name';

  const pokemonTypes = document.createElement('div');
  pokemonTypes.className = 'pokemon-types';

  // Add type badges
  pokemon.types.forEach(type => {
    const typeBadge = document.createElement('span');
    typeBadge.textContent = type;
    typeBadge.className = `type-badge ${type}`;
    pokemonTypes.appendChild(typeBadge);
  });

  // Create stats section
  const pokemonStats = document.createElement('div');
  pokemonStats.className = 'pokemon-stats';

  // Add height stat
  const heightStat = document.createElement('div');
  heightStat.className = 'stat';
  heightStat.innerHTML = `<span>Height</span><span class="stat-value">${pokemon.height}m</span>`;

  // Add weight stat
  const weightStat = document.createElement('div');
  weightStat.className = 'stat';
  weightStat.innerHTML = `<span>Weight</span><span class="stat-value">${pokemon.weight}kg</span>`;

  // Add abilities count
  const abilitiesStat = document.createElement('div');
  abilitiesStat.className = 'stat';
  abilitiesStat.innerHTML = '<span>Abilities</span>' +
    `<span class="stat-value">${pokemon.abilities.length}</span>`;

  // Assemble stats
  pokemonStats.appendChild(heightStat);
  pokemonStats.appendChild(weightStat);
  pokemonStats.appendChild(abilitiesStat);

  // Assemble card back
  cardBack.appendChild(pokemonImg);
  cardBack.appendChild(pokemonName);
  cardBack.appendChild(pokemonTypes);
  cardBack.appendChild(pokemonStats);
}

/**
 * Handle card click
 * @param {Event} event - Click event
 */
function handleCardClick(event) {
  // Find the clicked card using closest for better performance
  const card = event.target.closest('.card');

  // Early return for invalid clicks
  if (!card) {
    return; // Not a card or child of card
  }

  // Guard clauses for better readability
  if (card.classList.contains('flipped') || card.classList.contains('matched')) {
    return; // Already flipped or matched
  }

  // Prevent clicking during timeout/animation
  if (isProcessingPair) {
    return;
  }

  // Flip the card
  card.classList.add('flipped');

  // Track selections
  if (!firstSelectedCard) {
    // First card selection
    firstSelectedCard = card;
  } else if (firstSelectedCard !== card) {
    // Second card selection
    secondSelectedCard = card;

    // Check for a match
    checkForMatch();
  }
}

/**
 * Check if selected cards match
 */
function checkForMatch() {
  // Get Pokémon data from both cards with error handling
  let firstPokemonData, secondPokemonData;

  try {
    firstPokemonData = JSON.parse(firstSelectedCard.dataset.pokemon);
    secondPokemonData = JSON.parse(secondSelectedCard.dataset.pokemon);
  } catch (error) {
    console.error('Error parsing Pokémon data:', error);
    resetSelection();
    return;
  }

  // Guard clause if either data is missing
  if (!firstPokemonData || !secondPokemonData) {
    console.error('Missing Pokémon data');
    resetSelection();
    return;
  }

  // Compare Pokémon IDs to check for a match
  if (firstPokemonData.id === secondPokemonData.id) {
    handleMatch();
  } else {
    handleNonMatch();
  }
}

/**
 * Handle matching cards
 */
function handleMatch() {
  // Mark cards as matched
  firstSelectedCard.classList.add('matched');
  secondSelectedCard.classList.add('matched');

  // Increment match counter
  matchedPairs++;

  // Check if game is complete
  if (matchedPairs === TOTAL_PAIRS) {
    setTimeout(showGameComplete, 500);
  }

  // Reset selection for next turn
  resetSelection();
}

/**
 * Handle non-matching cards
 */
function handleNonMatch() {
  // Set processing flag to prevent further interaction during timeout
  isProcessingPair = true;

  // Flip cards back after a delay
  setTimeout(() => {
    firstSelectedCard.classList.remove('flipped');
    secondSelectedCard.classList.remove('flipped');

    // Reset selection after animation completes
    resetSelection();

    // Release the processing lock
    isProcessingPair = false;
  }, 1000); // 1 second delay
}

/**
 * Reset card selection state
 */
function resetSelection() {
  firstSelectedCard = null;
  secondSelectedCard = null;
}

/**
 * Show game completion message
 */
function showGameComplete() {
  // Create a container for the message
  const messageContainer = document.createElement('div');
  messageContainer.classList.add('completion-message');

  // Add the message content
  messageContainer.innerHTML = `
    <h2>Congratulations!</h2>
    <p>You found all the Pokémon pairs!</p>
    <button id="play-again">Play Again</button>
  `;

  // Add to the page
  document.querySelector('.container').appendChild(messageContainer);

  // Set up the play again button
  document.getElementById('play-again').addEventListener('click', () => {
    messageContainer.remove();
    resetGame();
  });
}

/**
 * Reset the game
 */
function resetGame() {
  // Reset game state
  firstSelectedCard = null;
  secondSelectedCard = null;
  isProcessingPair = false;
  matchedPairs = 0;

  // Reset the UI
  const matchedCards = document.querySelectorAll('.card.matched');
  matchedCards.forEach(card => card.classList.remove('matched'));

  const flippedCards = document.querySelectorAll('.card.flipped');
  flippedCards.forEach(card => card.classList.remove('flipped'));

  // Get new Pokémon and shuffle
  fetchAndAssignPokemon();
}

/**
 * Show error message
 * @param {string} message - Error message
 */
function showErrorMessage(message) {
  const errorContainer = document.createElement('div');
  errorContainer.className = 'error-message';
  errorContainer.textContent = message;

  // Add retry button
  const retryButton = document.createElement('button');
  retryButton.textContent = 'Try Again';
  retryButton.addEventListener('click', () => {
    errorContainer.remove();
    initApp();
  });

  errorContainer.appendChild(retryButton);
  document.querySelector('.container').appendChild(errorContainer);
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Card click event - using event delegation for all cards
  cardGrid.addEventListener('click', handleCardClick);
}

/**
 * Show loading spinner
 */
function showLoading() {
  loadingSpinner.classList.remove('hidden');
}

/**
 * Hide loading spinner
 */
function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);