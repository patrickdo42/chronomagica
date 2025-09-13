"use client";

import { useEffect, useMemo, useState } from "react";
import { useNow } from "@/components/Clock";
import * as Astronomy from "@/components/astronomy";

interface PlanetaryHour {
  hour: number;
  planet: string;
  startTime: string;
  endTime: string;
  symbol: string;
  color: string;
}

interface PlanetInfo {
  name: string;
  symbol: string;
  zodiac: string;
  zodiacSymbol: string;
  isRetrograde: boolean;
  highlightClass: string;
}

const CHALDEAN_ORDER = [
  "Saturn",
  "Jupiter",
  "Mars",
  "Sol",
  "Venus",
  "Mercury",
  "Luna",
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sol: "&#9737;",
  Luna: "&#9789;",
  Mars: "&#9794;",
  Mercury: "&#9791;",
  Jupiter: "&#9795;",
  Venus: "&#9792;",
  Saturn: "&#9796;",
  Uranus: "&#9797;",
  Neptune: "&#9798;",
  Pluto: "&#9935;",
};

const ZODIAC_SIGNS: string[] = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "&#9800;",
  Taurus: "&#9801;",
  Gemini: "&#9802;",
  Cancer: "&#9803;",
  Leo: "&#9804;",
  Virgo: "&#9805;",
  Libra: "&#9806;",
  Scorpio: "&#9807;",
  Sagittarius: "&#9808;",
  Capricorn: "&#9809;",
  Aquarius: "&#9810;",
  Pisces: "&#9811;",
};

const getZodiacSign = (
  eclipticLongitude: number,
): { name: string; symbol: string } => {
  const index = Math.floor(eclipticLongitude / 30);
  const name = ZODIAC_SIGNS[index % 12];
  const symbol = ZODIAC_SYMBOLS[name];
  return { name, symbol };
};

// Astronomy.MoonPhase returns elongation in degrees [0,360):
// 0=new, 90=first quarter, 180=full, 270=third quarter.
const getMoonPhaseName = (elongation: number): string => {
  const x = ((elongation % 360) + 360) % 360;
  if (x < 22.5) return "New Moon";
  if (x < 67.5) return "Waxing Crescent";
  if (x < 112.5) return "First Quarter";
  if (x < 157.5) return "Waxing Gibbous";
  if (x < 202.5) return "Full Moon";
  if (x < 247.5) return "Waning Gibbous";
  if (x < 292.5) return "Third Quarter";
  if (x < 337.5) return "Waning Crescent";
  return "New Moon";
};

export default function Home() {
  const [planetaryHours, setPlanetaryHours] = useState<PlanetaryHour[]>([]);
  const [sunriseTime, setSunriseTime] = useState<Date | null>(null);
  const [sunsetTime, setSunsetTime] = useState<Date | null>(null);
  const [planetData, setPlanetData] = useState<PlanetInfo[]>([]);
  const [moonPhase, setMoonPhase] = useState<string | null>(null);

  const now = useNow(1000);

  // Formatters for local date/time using system locale/time zone
  const headerDateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const headerTimeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    [],
  );

  const getDayOfWeek = (date: Date): number => date.getDay();

  const getStartingPlanet = (dayOfWeek: number): string => {
    const dayToPlanetMap: Record<number, string> = {
      0: "Sol",
      1: "Luna",
      2: "Mars",
      3: "Mercury",
      4: "Jupiter",
      5: "Venus",
      6: "Saturn",
    };
    return dayToPlanetMap[dayOfWeek];
  };

  const calculatePlanetaryHours = (
    sunrise: Date,
    sunset: Date,
    startingPlanet: string,
    locale?: string,
    timeZone?: string,
  ): PlanetaryHour[] => {
    const hours: PlanetaryHour[] = [];
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const nightDuration = sunrise.getTime() + 24 * 3600_000 - sunset.getTime();

    const dayHourLength = dayDuration / 12;
    const nightHourLength = nightDuration / 12;

    const planetOrder = [...CHALDEAN_ORDER];
    let startIndex = planetOrder.indexOf(startingPlanet);
    if (startIndex === -1) startIndex = 0;

    const getPlanetForHour = (hourIndex: number) =>
      planetOrder[(startIndex + hourIndex) % planetOrder.length];

    for (let i = 0; i < 12; i++) {
      const hourStartTime = new Date(sunrise.getTime() + i * dayHourLength);
      const hourEndTime = new Date(sunrise.getTime() + (i + 1) * dayHourLength);
      const planet = getPlanetForHour(i);
      hours.push({
        hour: i + 1,
        planet,
        startTime: hourStartTime.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone,
        }),
        endTime: hourEndTime.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone,
        }),
        symbol: PLANET_SYMBOLS[planet] || "",
        color: "",
      });
    }

    for (let i = 0; i < 12; i++) {
      const hourStartTime = new Date(sunset.getTime() + i * nightHourLength);
      const hourEndTime = new Date(sunset.getTime() + (i + 1) * nightHourLength);
      const planet = getPlanetForHour(i + 12);
      hours.push({
        hour: i + 13,
        planet,
        startTime: hourStartTime.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone,
        }),
        endTime: hourEndTime.toLocaleTimeString(locale, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone,
        }),
        symbol: PLANET_SYMBOLS[planet] || "",
        color: "",
      });
    }

    return hours;
  };

  useEffect(() => {
    const fetchSunriseSunset = async () => {
      const dateString = now.toISOString();
      const observer = {
        latitude: 41.8781,
        longitude: -87.6298,
        height: 180,
      };

      const sunriseRes = await fetch(
        `/api/sunrise-sunset?latitude=${observer.latitude}&longitude=${observer.longitude}&height=${observer.height}&body=Sol&date=${dateString}&direction=1`,
      );
      const sunriseData = await sunriseRes.json();
      const sunsetRes = await fetch(
        `/api/sunrise-sunset?latitude=${observer.latitude}&longitude=${observer.longitude}&height=${observer.height}&body=Sol&date=${dateString}&direction=-1`,
      );
      const sunsetData = await sunsetRes.json();

      if (sunriseData.time) setSunriseTime(new Date(sunriseData.time));
      if (sunsetData.time) setSunsetTime(new Date(sunsetData.time));
    };
    fetchSunriseSunset();
  }, [now]);

  useEffect(() => {
    const nowLocal = new Date();
    const astronomyTime = Astronomy.MakeTime(nowLocal);
    const elong = Astronomy.MoonPhase(astronomyTime);
    setMoonPhase(getMoonPhaseName(elong));

    const planetsToFetch = [
      "Sol",
      "Luna",
      "Mercury",
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
    ];

    const toBody = (name: string): any => {
      if (name === "Sol") return (Astronomy as any).Body.Sun;
      if (name === "Luna") return (Astronomy as any).Body.Moon;
      return (Astronomy as any).Body[name];
    };

    const run = async () => {
      const fetched: PlanetInfo[] = [];
      for (const planetName of planetsToFetch) {
        let isRetrograde = false;
        try {
          if (planetName !== "Sol" && planetName !== "Luna") {
            const retrogradeRes = await fetch(
              `/api/planet-retrograde?body=${planetName}&date=${nowLocal.toISOString()}`,
            );
            if (retrogradeRes.ok) {
              const retrogradeData = await retrogradeRes.json();
              isRetrograde = !!retrogradeData.isRetrograde;
            }
          }
        } catch (err) {
          console.warn("Retrograde fetch failed", planetName, err);
        }

        let zodiacName = "";
        let zodiacSymbol = "";
        try {
          const body = toBody(planetName);
          const geoVector = Astronomy.GeoVector(body, astronomyTime, true);
          const ecliptic = Astronomy.Ecliptic(geoVector);
          const z = getZodiacSign(ecliptic.elon);
          zodiacName = z.name;
          zodiacSymbol = z.symbol;
        } catch (err) {
          console.warn("Zodiac calc failed", planetName, err);
        }

        fetched.push({
          name: planetName,
          symbol: PLANET_SYMBOLS[planetName] || "",
          zodiac: zodiacName || "",
          zodiacSymbol: zodiacSymbol || "",
          isRetrograde,
          highlightClass: `${planetName.toLowerCase()}-highlight`,
        });
      }
      setPlanetData(fetched);
    };

    run();
  }, []);

  useEffect(() => {
    if (sunriseTime && sunsetTime) {
      const startingPlanet = getStartingPlanet(getDayOfWeek(now));
      setPlanetaryHours(
        calculatePlanetaryHours(sunriseTime, sunsetTime, startingPlanet),
      );
    }
  }, [now, sunriseTime, sunsetTime]);

  return (
    <main className="page-container">
      <h1 className="energies-title">Today&#8217;s Energies</h1>
      <div className="header-section">
        <div className="header-left">
          <p className="header-date">
            <time dateTime={now.toISOString()} suppressHydrationWarning aria-live="polite">
              {headerDateFmt.format(now)}
            </time>
          </p>
          <p className="header-location">Metairie, LA</p>
        </div>
        <div className="header-right">
          <p className="header-time">
            <time dateTime={now.toISOString()} suppressHydrationWarning aria-live="polite">
              {headerTimeFmt.format(now)}
            </time>
          </p>
          <p className="header-weather"></p>
        </div>
      </div>

      <div className="content-section">
        <table className="planetary-info-table" aria-label="Planetary Information">
          <tbody>
            {planetData.map((planet) => (
              <tr key={planet.name} className={planet.highlightClass}>
                <td>
                  {planet.name} <span dangerouslySetInnerHTML={{ __html: planet.symbol }} />
                </td>
                <td>
                  {planet.name === "Luna" ? (
                    <span>{moonPhase ?? ""}</span>
                  ) : planet.isRetrograde ? (
                    <span className="retrograde-text">Retrograde</span>
                  ) : (
                    ""
                  )}
                </td>
                <td className="zodiac-name">{planet.zodiac}</td>
                <td className="zodiac-pill">
                  <span
                    className="zodiac-badge"
                    dangerouslySetInnerHTML={{ __html: planet.zodiacSymbol }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table className="hours-table" aria-label="Planetary hours">
          <tbody>
            {planetaryHours.slice(0, 12).map((ph) => (
              <tr key={ph.hour} className={ph.hour === 7 ? "current" : ""}>
                <td>{ph.hour}</td>
                <td>
                  {ph.startTime} - {ph.endTime}
                </td>
                <td>
                  {ph.planet} <span dangerouslySetInnerHTML={{ __html: PLANET_SYMBOLS[ph.planet] || "" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lucky" style={{ textAlign: "center", fontSize: "1.4rem", marginTop: 16 }}>
        Today is lucky.
      </p>
    </main>
  );
}

