// Function to get current date and time
async function getDateTime() {
  try {
    const response = await fetch('/api/datetime'); // Assuming a /api/datetime endpoint exists
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    document.getElementById('datetime').textContent = `Current Date and Time: ${data.datetime}`;
  } catch (error) {
    console.error('Error fetching date and time:', error);
    document.getElementById('datetime').textContent = 'Could not fetch date and time.';
  }
}

// Function to get weather data (assuming /api/weather endpoint)
async function getWeather() {
  const locationInput = document.getElementById('locationInput');
  const location = locationInput.value.trim();
  if (!location) {
    alert('Please enter a location.');
    return;
  }

  try {
    const response = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const weatherData = await response.json();
    console.log('Weather Data:', weatherData);

    const weatherDiv = document.getElementById('weather');
    weatherDiv.innerHTML = `
      <h3>Weather in ${weatherData.location}</h3>
      <p>Temperature: ${weatherData.temperature}°C</p>
      <p>Condition: ${weatherData.condition}</p>
    `;
  } catch (error) {
    console.error('Error fetching weather:', error);
    document.getElementById('weather').textContent = 'Could not fetch weather data.';
  }
}

// Function to get symbols data (from existing script)
async function getSymbols() {
  try {
    const response = await fetch('/api/symbols');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const symbols = await response.json();
    console.log('Symbols:', symbols);

    const weatherSymbolsDiv = document.getElementById('weatherSymbols');
    if (weatherSymbolsDiv) {
      for (const [key, value] of Object.entries(symbols.weather)) {
        weatherSymbolsDiv.innerHTML += `<p>${key}: ${value}</p>`;
      }
    }

    const zodiacSymbolsDiv = document.getElementById('zodiacSymbols');
    if (zodiacSymbolsDiv) {
      for (const [key, value] of Object.entries(symbols.zodiac)) {
        zodiacSymbolsDiv.innerHTML += `<p>${key}: ${value}</p>`;
      }
    }

    const moonPhaseSymbolsDiv = document.getElementById('moonPhaseSymbols');
    if (moonPhaseSymbolsDiv) {
      for (const [key, value] of Object.entries(symbols.moonPhases)) {
        moonPhaseSymbolsDiv.innerHTML += `<p>${key}: ${value}</p>`;
      }
    }

    const retrogradeSymbolDiv = document.getElementById('retrogradeSymbol');
    if (retrogradeSymbolDiv) {
      retrogradeSymbolDiv.innerHTML = `<p>℞</p>`;
    }

  } catch (error) {
    console.error('Error fetching symbols:', error);
  }
}

// Function to get astrology data (from existing script)
async function getAstrologyData() {
  try {
    const response = await fetch('/api/astrology');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const astrologyData = await response.json();
    console.log('Astrology Data:', astrologyData);

    const planetaryTable = document.getElementById('planetaryTable');
    const rows = planetaryTable.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const planetCell = row.querySelector('.planetary-cell');
      if (!planetCell) return; // Skip if the cell is not found

      const planetName = planetCell.textContent;
      let status = 'Direct';
      let rowClass = '';

      // Extract planet name for retrograde check (handle cases like "Sol ☉")
      const planetKey = planetName.split(' ')[0].toLowerCase();

      if (planetName === 'Sol ☉') {
        status = astrologyData.eclipseType || 'N/A';
      } else if (planetName === 'Luna ☽') {
        status = astrologyData.moonPhase;
      } else {
        if (astrologyData.planetsRetrograde && astrologyData.planetsRetrograde[planetKey]) {
          status = 'Retrograde';
          rowClass = 'retrograde';
        }
      }

      const statusCell = row.querySelector('.retrograde-status');
      if (statusCell) {
        statusCell.textContent = status;
        row.className = `planetary-row ${rowClass}`;
      }
    });

  } catch (error) {
    console.error('Error fetching astrology data:', error);
  }
}

// Function to get astronomy data from Python backend
async function getAstronomyDataFromPython() {
  const latitudeInput = document.getElementById('latitudeInput');
  const longitudeInput = document.getElementById('longitudeInput');

  const latitude = latitudeInput.value.trim();
  const longitude = longitudeInput.value.trim();

  if (!latitude || !longitude) {
    alert('Please enter both latitude and longitude.');
    return;
  }

  try {
    console.log("Fetching astronomy data..."); // Added for debugging
    const response = await fetch(`/api/astronomy_data?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const astronomyData = await response.json();
    console.log('Astronomy Data from Python:', astronomyData);

    // Update the HTML with the astronomy data
    document.getElementById('sunAzimuth').textContent = astronomyData.sun_azimuth !== undefined ? astronomyData.sun_azimuth.toFixed(2) : 'N/A';
    document.getElementById('sunAltitude').textContent = astronomyData.sun_altitude !== undefined ? astronomyData.sun_altitude.toFixed(2) : 'N/A';
    document.getElementById('moonPhaseAngle').textContent = astronomyData.moon_phase_angle !== undefined ? astronomyData.moon_phase_angle.toFixed(2) : 'N/A';
    document.getElementById('moonAzimuth').textContent = astronomyData.moon_azimuth !== undefined ? astronomyData.moon_azimuth.toFixed(2) : 'N/A';
    document.getElementById('moonAltitude').textContent = astronomyData.moon_altitude !== undefined ? astronomyData.moon_altitude.toFixed(2) : 'N/A';

    // Update Moon Phase in planetaryTable
    const moonPhaseAngle = astronomyData.moon_phase_angle;
    if (moonPhaseAngle !== undefined) {
      const moonPhaseName = getMoonPhaseName(moonPhaseAngle);
      const lunaRow = document.getElementById('lunaHighlight');
      if (lunaRow) {
        const moonPhaseCell = lunaRow.querySelector('td:nth-child(3)'); // Third column is Moon Phase
        if (moonPhaseCell) {
          moonPhaseCell.textContent = moonPhaseName;
        }
      }
    }

  } catch (error) {
    console.error('Error fetching astronomy data from Python:', error);
    document.getElementById('sunAzimuth').textContent = 'Error';
    document.getElementById('sunAltitude').textContent = 'Error';
    document.getElementById('moonPhaseAngle').textContent = 'Error';
    document.getElementById('moonAzimuth').textContent = 'Error';
    document.getElementById('moonAltitude').textContent = 'Error';
  }
}

// Helper function to convert moon phase angle to a descriptive name
function getMoonPhaseName(angle) {
  if (angle >= 337.5 || angle < 22.5) {
    return 'New Moon';
  } else if (angle >= 22.5 && angle < 67.5) {
    return 'Waxing Crescent';
  } else if (angle >= 67.5 && angle < 112.5) {
    return 'First Quarter';
  } else if (angle >= 112.5 && angle < 157.5) {
    return 'Waxing Gibbous';
  } else if (angle >= 157.5 && angle < 202.5) {
    return 'Full Moon';
  } else if (angle >= 202.5 && angle < 247.5) {
    return 'Waning Gibbous';
  } else if (angle >= 247.5 && angle < 292.5) {
    return 'Third Quarter';
  } else if (angle >= 292.5 && angle < 337.5) {
    return 'Waning Crescent';
  }
  return 'N/A';
}

// Event Listeners
document.getElementById('getWeatherButton').addEventListener('click', getWeather);
document.getElementById('getAstronomyDataButton').addEventListener('click', () => {
  console.log("Button clicked!"); // Added for debugging
  getAstronomyDataFromPython();
});

document.getElementById('enterAppButton').addEventListener('click', () => {
  const splashLocationInput = document.getElementById('splashLocationInput');
  const location = splashLocationInput.value.trim();
  if (location) {
    localStorage.setItem('userLocation', location);
    document.getElementById('splash-page').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
    // Initialize main content data
    getDateTime();
    getSymbols();
    getAstrologyData();
    // Optionally, set the location input in the main content
    document.getElementById('locationInput').value = location;
    getWeather(); // Fetch weather for the entered location
  } else {
    alert('Please enter your location to proceed.');
  }
});

const splashLocationInput = document.getElementById('splashLocationInput');
const suggestionsList = document.getElementById('suggestionsList');

splashLocationInput.addEventListener('input', async () => {
  const query = splashLocationInput.value.trim();
  if (query.length > 2) { // Start searching after 2 characters
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      const data = await response.json();
      displaySuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      suggestionsList.innerHTML = '';
    }
  } else {
    suggestionsList.innerHTML = '';
  }
});

function displaySuggestions(suggestions) {
  suggestionsList.innerHTML = '';
  if (suggestions.length > 0) {
    suggestions.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.display_name;
      li.addEventListener('click', () => {
        splashLocationInput.value = item.display_name;
        suggestionsList.innerHTML = '';
      });
      suggestionsList.appendChild(li);
    });
  }
}

// Initial data loading (only if splash page is bypassed or after entering location)
if (localStorage.getItem('userLocation')) {
  document.getElementById('splash-page').style.display = 'none';
  document.getElementById('main-content').style.display = 'block';
  getDateTime();
  getSymbols();
  getAstrologyData();
  document.getElementById('locationInput').value = localStorage.getItem('userLocation');
  getWeather();
} else {
  document.getElementById('splash-page').style.display = 'flex';
  document.getElementById('main-content').style.display = 'none';
}

document.getElementById('homeButton').addEventListener('click', () => {
  document.getElementById('main-content').style.display = 'none';
  document.getElementById('splash-page').style.display = 'flex';
  localStorage.removeItem('userLocation'); // Clear stored location
  document.getElementById('splashLocationInput').value = ''; // Clear splash input
  document.getElementById('suggestionsList').innerHTML = ''; // Clear suggestions
});

document.addEventListener('click', (event) => {
  console.log('Document clicked:', event.target);
});

// Dark Mode Toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Save user preference
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Apply saved theme on load
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
});
