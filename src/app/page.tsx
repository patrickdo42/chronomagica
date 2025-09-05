export default function Home() {
  return (
    <main>
      <div id="splash-page" className="splash-page">
        <button id="darkModeToggle" className="dark-mode-toggle">Toggle Dark Mode</button>
        <h1 className="app-heading">Welcome to Chronomagica</h1>
        <div className="location-input-splash">
          <input type="text" id="splashLocationInput" placeholder="Enter your location" />
          <button id="enterAppButton">Enter</button>
          <ul id="suggestionsList" className="suggestions-list"></ul>
        </div>
      </div>

      <div id="main-content" className="main-content" style={{ display: "none" }}>
        <button id="homeButton" className="home-button">Home</button>
        <h1 className="app-heading">Welcome to Chronomagica</h1>
        <button id="magicButton" className="lucky" style={{ fontSize: "2em" }}>Today's Energies</button>

        <div id="datetime"></div>
        <div id="weather"></div>
        <div className="weather-input">
          <input type="text" id="locationInput" placeholder="Enter city or zip code" />
          <button id="getWeatherButton">Get Weather</button>
        </div>

        <h2>Planetary Data</h2>
        <table id="planetaryTable" className="planetary-table">
          <thead>
            <tr>
              <th>Celestial Body</th>
              <th>Retrograde Status</th>
              <th>Moon Phase</th>
            </tr>
          </thead>
          <tbody>
            <tr id="solHighlight" className="planetary-row">
              <td className="planetary-cell">Sol ☉</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="lunaHighlight" className="planetary-row">
              <td className="planetary-cell">Luna ☽</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="mercuryHighlight" className="planetary-row">
              <td className="planetary-cell">Mercury ☿</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="venusHighlight" className="planetary-row">
              <td className="planetary-cell">Venus ♀</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="marsHighlight" className="planetary-row">
              <td className="planetary-cell">Mars ♂</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="jupiterHighlight" className="planetary-row">
              <td className="planetary-cell">Jupiter ♃</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="saturnHighlight" className="planetary-row">
              <td className="planetary-cell">Saturn ♄</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="uranusHighlight" className="planetary-row">
              <td className="planetary-cell">Uranus ♅</td>
              <td className="retrograde-status">Direct</td>
              <td>N/A</td>
            </tr>
            <tr id="neptuneHighlight" className="planetary-row">
              <td className="planetary-cell">Neptune ♆</td>
              <td className="retrograde-status">N/A</td>
              <td>New Moon</td>
            </tr>
            <tr id="plutoHighlight" className="planetary-row">
              <td className="planetary-cell">Pluto ⯓</td>
              <td className="retrograde-status">N/A</td>
              <td>N/A</td>
            </tr>
          </tbody>
        </table>

        <h2>Astronomical Data (by Location)</h2>
        <div className="location-input">
          <input type="number" id="latitudeInput" placeholder="Enter Latitude" step="0.0001" />
          <input type="number" id="longitudeInput" placeholder="Enter Longitude" step="0.0001" />
          <button id="getAstronomyDataButton">Get Astronomy Data</button>
        </div>
        <div id="astronomyData">
          <h3>Sun</h3>
          <p>Azimuth: <span id="sunAzimuth">N/A</span></p>
          <p>Altitude: <span id="sunAltitude">N/A</span></p>
          <h3>Moon</h3>
          <p>Phase Angle: <span id="moonPhaseAngle">N/A</span></p>
          <p>Azimuth: <span id="moonAzimuth">N/A</span></p>
          <p>Altitude: <span id="moonAltitude">N/A</span></p>
        </div>
      </div>
    </main>
  );
}
