const express = require('express');
const app = express();
const port = 3001;
const path = require('path');

app.use(express.static(path.join(__dirname, '..', '..'))); // Serve static files from the root directory

app.get('/api/datetime', (req, res) => {
  const now = new Date();
  res.json({ datetime: now.toISOString() });
});

app.get('/api/weather', (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: 'Location is required.' });
  }
  // Placeholder weather data
  const weatherData = {
    location: location,
    temperature: Math.floor(Math.random() * 20) + 10, // Random temperature between 10 and 30
    condition: 'Partly Cloudy'
  };
  res.json(weatherData);
});

app.get('/api/symbols', (req, res) => {
  res.sendFile(path.join(__dirname, 'symbols.json'));
});

app.get('/api/astrology', (req, res) => {
  const symbols = require('./symbols.json');
  const moonPhases = Object.values(symbols.moonPhases);
  const randomMoonPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];

  const eclipseTypes = ['Solar Eclipse', 'Lunar Eclipse', null];
  const eclipseOptions = ['Partial', 'Total', null];
  let eclipseType = eclipseTypes[Math.floor(Math.random() * eclipseTypes.length)];
  let eclipse = null;
  if (eclipseType) {
    const eclipseOption = eclipseOptions[Math.floor(Math.random() * 2)];
    eclipse = `${eclipseOption} ${eclipseType}`;
  }

  const planetsRetrograde = {};
  for (const planet in symbols.currentConditions.planetsRetrograde) {
    planetsRetrograde[planet] = Math.random() < 0.5;
  }

  const astrologyData = {
    moonPhase: randomMoonPhase,
    eclipseType: eclipse,
    planetsRetrograde: planetsRetrograde
  };
  res.json(astrologyData);
});

const { spawn } = require('child_process');

app.get('/api/astronomy_data', (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Latitude and longitude are required.' });
  }

  const pythonProcess = spawn('python', ['src/backend/astronomy.py', latitude, longitude]);

  let dataString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python stderr: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.log(`Python script exited with code ${code}`);
      return res.status(500).json({ error: 'Failed to execute Python script' });
    }
    try {
      const astronomyData = JSON.parse(dataString);
      res.json(astronomyData);
    } catch (e) {
      console.error("Failed to parse json", e);
      res.status(500).json({ error: 'Failed to parse Python output' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
