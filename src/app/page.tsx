import { ClockDate, ClockTime } from "@/components/Clock";

export default function Home() {
  return (
    <main>
      <div id="main-content" className="main-content">
        <h1 className="energies-title">Today&#8217;s Energies</h1>

        <div id="datetime">
          <div>
            <ClockDate />
          </div>
          <div>Metairie, LA</div>
        </div>
        <div id="weather">
          <div>
            <ClockTime />
          </div>
          <div>90&#176; F, Partly Cloudy</div>
        </div>

        <table id="planetaryTable" className="planetary-table" aria-label="Planetary highlights">
          <thead>
            <tr>
              <th>Celestial Body</th>
              <th>Retrograde Status</th>
              <th>Sign</th>
              <th>Glyph</th>
            </tr>
          </thead>
          <tbody>
            <tr id="solHighlight" className="planetary-row">
              <td className="planetary-cell">Sol &#9737;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Cancer</td>
              <td className="sign-glyph">&#9803;</td>
            </tr>
            <tr id="lunaHighlight" className="planetary-row">
              <td className="planetary-cell">Luna &#9789;</td>
              <td className="retrograde-status">New Moon &#127761;</td>
              <td className="sign-text">Cancer</td>
              <td className="sign-glyph">&#9803;</td>
            </tr>
            <tr id="mercuryHighlight" className="planetary-row">
              <td className="planetary-cell">Mercury &#9791;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Cancer</td>
              <td className="sign-glyph">&#9803;</td>
            </tr>
            <tr id="venusHighlight" className="planetary-row">
              <td className="planetary-cell">Venus &#9792;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Taurus</td>
              <td className="sign-glyph">&#9801;</td>
            </tr>
            <tr id="marsHighlight" className="planetary-row">
              <td className="planetary-cell">Mars &#9794;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Virgo</td>
              <td className="sign-glyph">&#9805;</td>
            </tr>
            <tr id="jupiterHighlight" className="planetary-row">
              <td className="planetary-cell">Jupiter &#9795;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Cancer</td>
              <td className="sign-glyph">&#9803;</td>
            </tr>
            <tr id="saturnHighlight" className="planetary-row">
              <td className="planetary-cell">Saturn &#9796;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Aries</td>
              <td className="sign-glyph">&#9800;</td>
            </tr>
            <tr id="uranusHighlight" className="planetary-row">
              <td className="planetary-cell">Uranus &#9797;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Taurus</td>
              <td className="sign-glyph">&#9801;</td>
            </tr>
            <tr id="neptuneHighlight" className="planetary-row">
              <td className="planetary-cell">Neptune &#9798;</td>
              <td className="retrograde-status"></td>
              <td className="sign-text">Aries</td>
              <td className="sign-glyph">&#9800;</td>
            </tr>
            <tr id="plutoHighlight" className="planetary-row">
              <td className="planetary-cell">Pluto &#9799;</td>
              <td className="retrograde-status retrograde">Retrograde &#8478;</td>
              <td className="sign-text">Aquarius</td>
              <td className="sign-glyph">&#9810;</td>
            </tr>
          </tbody>
        </table>

        <table className="hours-table" aria-label="Planetary hours">
          <tbody>
            <tr>
              <td>1</td>
              <td>6:01 AM - 7:12 AM</td>
              <td>Mercury &#9791;</td>
            </tr>
            <tr>
              <td>2</td>
              <td>7:12 AM - 8:22 AM</td>
              <td>Luna &#9789;</td>
            </tr>
            <tr>
              <td>3</td>
              <td>8:22 AM - 9:32 AM</td>
              <td>Saturn &#9796;</td>
            </tr>
            <tr>
              <td>4</td>
              <td>9:32 AM - 10:43 AM</td>
              <td>Jupiter &#9795;</td>
            </tr>
            <tr>
              <td>5</td>
              <td>10:43 AM - 11:53 AM</td>
              <td>Mars &#9794;</td>
            </tr>
            <tr>
              <td>6</td>
              <td>11:43 AM - 1:03 PM</td>
              <td>Sol &#9737;</td>
            </tr>
            <tr className="current">
              <td>7</td>
              <td>1:03 PM - 2:14 PM</td>
              <td>Venus &#9792;</td>
            </tr>
            <tr>
              <td>8</td>
              <td>2:14 PM - 3:24 PM</td>
              <td>Mercury &#9791;</td>
            </tr>
            <tr>
              <td>9</td>
              <td>3:24 PM - 4:35 PM</td>
              <td>Luna &#9789;</td>
            </tr>
            <tr>
              <td>10</td>
              <td>4:35 PM - 5:45 PM</td>
              <td>Saturn &#9796;</td>
            </tr>
            <tr>
              <td>11</td>
              <td>5:45 PM - 6:55 PM</td>
              <td>Jupiter &#9795;</td>
            </tr>
            <tr>
              <td>12</td>
              <td>6:55 PM - 8:06 PM</td>
              <td>Mars &#9794;</td>
            </tr>
          </tbody>
        </table>

        <p className="lucky" style={{ textAlign: "center", fontSize: "1.4rem", marginTop: 16 }}>
          Today is lucky.
        </p>
      </div>
    </main>
  );
}
