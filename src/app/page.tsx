"use client";

import { useEffect, useMemo, useState } from "react";
import { useNow } from "@/components/Clock";
import * as Astronomy from "@/components/astronomy";

interface PlanetaryHour {
  hour: number;
  planet: string;
  // Human-readable strings for display
  startTime: string;
  endTime: string;
  // Machine-friendly times for logic/highlighting
  startDate: Date;
  endDate: Date;
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


interface ObserverCoords {
  latitude: number;
  longitude: number;
  height: number;
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
// 0 = new, 90 = first quarter, 180 = full, 270 = third quarter.
const NEW_MOON_THRESHOLD = 0.03;
const FULL_MOON_THRESHOLD = 0.97;
const QUARTER_LOWER_THRESHOLD = 0.45;
const QUARTER_UPPER_THRESHOLD = 0.55;

const getMoonPhaseName = (elongation: number, fraction: number): string => {
  const normalized = ((elongation % 360) + 360) % 360;
  const waxing = normalized <= 180;
  const clampedFraction = Math.min(Math.max(fraction, 0), 1);

  if (clampedFraction <= NEW_MOON_THRESHOLD) return "New Moon";
  if (clampedFraction >= FULL_MOON_THRESHOLD) return "Full Moon";

  if (
    clampedFraction >= QUARTER_LOWER_THRESHOLD &&
    clampedFraction <= QUARTER_UPPER_THRESHOLD
  ) {
    return waxing ? "First Quarter" : "Third Quarter";
  }

  if (clampedFraction > QUARTER_UPPER_THRESHOLD) {
    return waxing ? "Waxing Gibbous" : "Waning Gibbous";
  }

  return waxing ? "Waxing Crescent" : "Waning Crescent";
};

const DEFAULT_OBSERVER: ObserverCoords = {
  latitude: 41.8781,
  longitude: -87.6298,
  height: 180,
};

export default function Home() {
  const [planetaryHours, setPlanetaryHours] = useState<PlanetaryHour[]>([]);
  const [sunriseTime, setSunriseTime] = useState<Date | null>(null);
  const [sunsetTime, setSunsetTime] = useState<Date | null>(null);
  const [nextSunriseTime, setNextSunriseTime] = useState<Date | null>(null);
  const [planetData, setPlanetData] = useState<PlanetInfo[]>([]);
  const [moonPhase, setMoonPhase] = useState<string | null>(null);
  const [observer, setObserver] = useState<ObserverCoords>(DEFAULT_OBSERVER);
  const [usingDeviceLocation, setUsingDeviceLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  const now = useNow(1000);
  const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

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

  const formatCoordinate = (value: number, positive: string, negative: string) =>
    `${Math.abs(value).toFixed(2)} deg ${value >= 0 ? positive : negative}`;

  const locationLabel = useMemo(() => {
    if (isLocating) {
      return "Detecting location...";
    }

    const latitudeLabel = formatCoordinate(observer.latitude, "N", "S");
    const longitudeLabel = formatCoordinate(observer.longitude, "E", "W");

    if (usingDeviceLocation && !locationError) {
      return `${latitudeLabel}, ${longitudeLabel}`;
    }

    if (locationError) {
      return `Default location - ${latitudeLabel}, ${longitudeLabel}`;
    }

    return `${latitudeLabel}, ${longitudeLabel}`;
  }, [
    observer.latitude,
    observer.longitude,
    usingDeviceLocation,
    locationError,
    isLocating,
  ]);

  const locationTitle = useMemo(() => {
    if (isLocating) {
      return "Detecting device location";
    }

    if (usingDeviceLocation && !locationError) {
      return "Location detected from this device";
    }

    if (locationError) {
      return `Using default coordinates: ${locationError}`;
    }

    return "Using default coordinates";
  }, [isLocating, usingDeviceLocation, locationError]);

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
    nextSunrise: Date,
    startingPlanet: string,
    locale?: string,
    timeZone?: string,
  ): PlanetaryHour[] => {
    const hours: PlanetaryHour[] = [];
    const dayDuration = sunset.getTime() - sunrise.getTime();
    const nightDuration = nextSunrise.getTime() - sunset.getTime();

    if (dayDuration <= 0 || nightDuration <= 0) {
      return hours;
    }

    const dayHourLength = dayDuration / 12;
    const nightHourLength = nightDuration / 12;

    const planetOrder = [...CHALDEAN_ORDER];
    let startIndex = planetOrder.indexOf(startingPlanet);
    if (startIndex === -1) startIndex = 0;

    const getPlanetForHour = (hourIndex: number) =>
      planetOrder[(startIndex + hourIndex) % planetOrder.length];

    const formatLocale = locale ?? undefined;
    const formatOptions: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      ...(timeZone ? { timeZone } : {}),
    };

    for (let i = 0; i < 12; i++) {
      const hourStartTime = new Date(sunrise.getTime() + i * dayHourLength);
      const hourEndTime = new Date(sunrise.getTime() + (i + 1) * dayHourLength);
      const planet = getPlanetForHour(i);
      hours.push({
        hour: i + 1,
        planet,
        startTime: hourStartTime.toLocaleTimeString(formatLocale, formatOptions),
        endTime: hourEndTime.toLocaleTimeString(formatLocale, formatOptions),
        startDate: hourStartTime,
        endDate: hourEndTime,
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
        startTime: hourStartTime.toLocaleTimeString(formatLocale, formatOptions),
        endTime: hourEndTime.toLocaleTimeString(formatLocale, formatOptions),
        startDate: hourStartTime,
        endDate: hourEndTime,
        symbol: PLANET_SYMBOLS[planet] || "",
        color: "",
      });
    }

    return hours;
  };

  useEffect(() => {
    let active = true;

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation not supported");
      setUsingDeviceLocation(false);
      setIsLocating(false);
      setObserver(DEFAULT_OBSERVER);
      return () => {
        active = false;
      };
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!active) return;
        const { latitude, longitude, altitude } = position.coords;
        const height =
          typeof altitude === "number" && Number.isFinite(altitude)
            ? altitude
            : DEFAULT_OBSERVER.height;
        setObserver({
          latitude,
          longitude,
          height,
        });
        setUsingDeviceLocation(true);
        setLocationError(null);
        setIsLocating(false);
      },
      (error) => {
        if (!active) return;
        setUsingDeviceLocation(false);
        setLocationError(error.message || "Geolocation unavailable");
        setObserver(DEFAULT_OBSERVER);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 300_000,
      },
    );

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let canceled = false;
    const fetchSunriseSunset = async () => {
      const coords = observer;

      const nowLocal = new Date();
      const midnight = new Date(nowLocal);
      midnight.setHours(0, 0, 0, 0);
      const midday = new Date(midnight.getTime() + 12 * 3600_000);
      const tomorrowMidnight = new Date(midnight.getTime() + 24 * 3600_000);

      const baseQuery = `latitude=${coords.latitude}&longitude=${coords.longitude}&height=${coords.height}&body=Sol`;

      try {
        const [sunriseRes, sunsetRes, nextSunriseRes] = await Promise.all([
          fetch(
            `/api/sunrise-sunset?${baseQuery}&date=${midnight.toISOString()}&direction=1`,
          ),
          fetch(
            `/api/sunrise-sunset?${baseQuery}&date=${midday.toISOString()}&direction=-1`,
          ),
          fetch(
            `/api/sunrise-sunset?${baseQuery}&date=${tomorrowMidnight.toISOString()}&direction=1`,
          ),
        ]);

        if (!sunriseRes.ok || !sunsetRes.ok || !nextSunriseRes.ok) {
          throw new Error("Failed to fetch sun events");
        }

        const [sunriseData, sunsetData, nextSunriseData] = await Promise.all([
          sunriseRes.json(),
          sunsetRes.json(),
          nextSunriseRes.json(),
        ]);

        if (canceled) return;

        setSunriseTime(sunriseData.time ? new Date(sunriseData.time) : null);
        setSunsetTime(sunsetData.time ? new Date(sunsetData.time) : null);
        setNextSunriseTime(
          nextSunriseData.time ? new Date(nextSunriseData.time) : null,
        );
      } catch (error) {
        if (!canceled) {
          console.error("Sunrise/sunset fetch failed", error);
          setSunriseTime(null);
          setSunsetTime(null);
          setNextSunriseTime(null);
        }
      }
    };
    fetchSunriseSunset();
    return () => {
      canceled = true;
    };
  }, [dayKey, observer]);

  useEffect(() => {
    const nowLocal = new Date();
    const astronomyTime = Astronomy.MakeTime(nowLocal);
    const elong = Astronomy.MoonPhase(astronomyTime);
    let moonPhaseName = "";
    try {
      const illumination = Astronomy.Illumination(
        (Astronomy as any).Body.Moon,
        astronomyTime,
      );
      moonPhaseName = getMoonPhaseName(elong, illumination.phase_fraction);
    } catch (err) {
      console.warn("Moon illumination calc failed", err);
      moonPhaseName = getMoonPhaseName(elong, 0);
    }
    setMoonPhase(moonPhaseName);

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
    if (sunriseTime && sunsetTime && nextSunriseTime) {
      const startingPlanet = getStartingPlanet(getDayOfWeek(sunriseTime));
      const { locale: resolvedLocale, timeZone } = Intl.DateTimeFormat().resolvedOptions();
      setPlanetaryHours(
        calculatePlanetaryHours(
          sunriseTime,
          sunsetTime,
          nextSunriseTime,
          startingPlanet,
          resolvedLocale,
          timeZone,
        ),
      );
    }
  }, [sunriseTime, sunsetTime, nextSunriseTime]);

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
          <p className="header-location" aria-live="polite" title={locationTitle}>{locationLabel}</p>
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
                    <span className="moon-phase">{moonPhase ?? ""}</span>
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
            {(() => {
              const showNightBlock =
                planetaryHours.length >= 13 && sunriseTime && sunsetTime
                  ? now.getTime() < sunriseTime.getTime() ||
                    now.getTime() >= sunsetTime.getTime()
                  : false;
              const visible = showNightBlock
                ? planetaryHours.slice(12, 24)
                : planetaryHours.slice(0, 12);
              return visible.map((ph) => {
                const isCurrent =
                  ph.startDate && ph.endDate
                    ? now >= ph.startDate && now < ph.endDate
                    : false;
                const rowClassNames = [
                  isCurrent ? "current" : "",
                  isCurrent ? `${ph.planet.toLowerCase()}-highlight` : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr key={ph.hour} className={rowClassNames}>
                    <td>{ph.hour}</td>
                    <td>
                      {ph.startTime} - {ph.endTime}
                    </td>
                    <td>
                      {ph.planet}{" "}
                      <span
                        dangerouslySetInnerHTML={{
                          __html: PLANET_SYMBOLS[ph.planet] || "",
                        }}
                      />
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <p className="lucky" style={{ textAlign: "center", fontSize: "1.4rem", marginTop: 16 }}>
        Today is lucky.
      </p>
    </main>
  );
}

