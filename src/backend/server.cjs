const express = require('express');
const app = express();
const port = 3001;
const path = require('path');

app.use(express.static(path.join(__dirname, '..', '..'))); // Serve static files from the root directory

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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
