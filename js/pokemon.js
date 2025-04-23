/**
 * Pokemon API Service
 * This file contains functions for fetching and manipulating Pokemon data from the PokeAPI
 */

// API Base URL
const API_BASE_URL = 'https://pokeapi.co/api/v2';

// Total number of Pokemon in the API (as of Gen 9)
const TOTAL_POKEMON = 1008;

/**
 * Fetch a random Pokemon from the PokeAPI
 * @returns {Promise<Object>} Pokemon data
 */
async function fetchRandomPokemon() {
  try {
    // Generate a random ID between 1 and TOTAL_POKEMON
    const randomId = Math.floor(Math.random() * TOTAL_POKEMON) + 1;

    // Fetch the Pokemon data
    const response = await fetch(`${API_BASE_URL}/pokemon/${randomId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch Pokemon: ${response.status}`);
    }

    const data = await response.json();

    // Process the data into a more usable format
    return processPokemonData(data);
  } catch (error) {
    console.error('Error fetching random Pokemon:', error);
    return null;
  }
}

/**
 * Fetch multiple random Pokemon at once
 * @param {number} count - Number of Pokemon to fetch
 * @returns {Promise<Array<Object>>} Array of Pokemon data
 */
async function fetchMultipleRandomPokemon(count) {
  try {
    // Create an array of promises for fetching random Pokemon
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(fetchRandomPokemon());
    }
    // Wait for all promises to resolve
    const pokemonList = await Promise.all(promises);

    // Filter out any null responses
    return pokemonList.filter(pokemon => pokemon !== null);
  } catch (error) {
    console.error('Error fetching multiple Pokemon:', error);
    return [];
  }
}

/**
 * Process the raw Pokemon data into a more usable format
 * @param {Object} data - Raw Pokemon data from the API
 * @returns {Object} Processed Pokemon data
 */
function processPokemonData(data) {
  return {
    id: data.id,
    name: capitalizeFirstLetter(data.name),
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    types: data.types.map(type => type.type.name),
    height: data.height / 10, // Convert to meters
    weight: data.weight / 10, // Convert to kilograms
    abilities: data.abilities.map(ability => capitalizeFirstLetter(ability.ability.name)),
    stats: {
      hp: findStat(data.stats, 'hp'),
      attack: findStat(data.stats, 'attack'),
      defense: findStat(data.stats, 'defense'),
      speed: findStat(data.stats, 'speed')
    },
    speciesUrl: data.species.url
  };
}

/**
 * Find a specific stat from the stats array
 * @param {Array<Object>} stats - Stats array from the API
 * @param {string} statName - Name of the stat to find
 * @returns {number} Stat value
 */
function findStat(stats, statName) {
  const stat = stats.find(s => s.stat.name === statName);
  return stat ? stat.base_stat : 0;
}

/**
 * Capitalize the first letter of a string
 * @param {string} string - String to capitalize
 * @returns {string} Capitalized string
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.replace('-', ' ').slice(1);
}

// Export the functions for use in app.js
export const PokemonService = {
  fetchRandomPokemon,
  fetchMultipleRandomPokemon
};