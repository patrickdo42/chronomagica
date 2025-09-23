"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useNow } from "@/components/Clock";
import * as Astronomy from "@/components/astronomy";
import { getDailyLuck } from "@/utils/moonLogic";

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

const PLANET_COLORS: Record<string, string> = {
  Sol: "#ffd071",
  Luna: "#d1d1d1",
  Mercury: "#fff59c",
  Venus: "#95f3ad",
  Mars: "#ffc5c5",
  Jupiter: "#9fdcff",
  Saturn: "#a5a5a5",
  Uranus: "#c9bcff",
  Neptune: "#f9b6ff",
  Pluto: "#e5baa5",
};

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
  Pluto: "&#11219;",
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
  Aries: "♈︎",
  Taurus: "♉︎",
  Gemini: "♊︎",
  Cancer: "♋︎",
  Leo: "♌︎",
  Virgo: "♍︎",
  Libra: "♎︎",
  Scorpio: "♏︎",
  Sagittarius: "♐︎",
  Capricorn: "♑︎",
  Aquarius: "♒︎",
  Pisces: "♓︎",
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
  const [sunFetchTrigger, setSunFetchTrigger] = useState(0);
  const [observer, setObserver] = useState<ObserverCoords>(DEFAULT_OBSERVER);
  const [usingDeviceLocation, setUsingDeviceLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [dailyLuck, setDailyLuck] = useState<'lucky' | 'unlucky' | 'neutral' | null>(null);
  const [clientLocale, setClientLocale] = useState<string | undefined>(undefined);
  const [clientTimeZone, setClientTimeZone] = useState<string | undefined>(undefined);

  const now = useNow(1000);
  const sunRefreshRequested = useRef(false);
  const dayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const resolved = Intl.DateTimeFormat().resolvedOptions();
    setClientLocale(resolved.locale);
    setClientTimeZone(resolved.timeZone);
  }, []);

  // Formatters for local date/time using system locale/time zone
  const headerDateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(clientLocale ?? undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: clientTimeZone ?? undefined,
      }),
    [clientLocale, clientTimeZone],
  );

  const headerTimeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(clientLocale ?? undefined, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: clientTimeZone ?? undefined,
      }),
    [clientLocale, clientTimeZone],
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
        color: PLANET_COLORS[planet] || "",
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
        color: PLANET_COLORS[planet] || "",
      });
    }

    return hours;
  };

  useEffect(() => {
    let active = true;
    let watchId: number | null = null;
    let hadSuccessfulFix = false;

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation not supported");
      setUsingDeviceLocation(false);
      setIsLocating(false);
      setObserver(DEFAULT_OBSERVER);
      return () => {
        active = false;
      };
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 300_000,
    };

    const handleSuccess = (position: GeolocationPosition) => {
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
      hadSuccessfulFix = true;
    };

    const handleError = (error: GeolocationPositionError) => {
      if (!active) return;
      if (hadSuccessfulFix) {
        console.warn("Geolocation update failed after initial fix", error);
        return;
      }
      setUsingDeviceLocation(false);
      setLocationError(error.message || "Geolocation unavailable");
      setObserver(DEFAULT_OBSERVER);
      setIsLocating(false);
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, options);
    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      active = false;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (isLocating) {
      return;
    }

    let canceled = false;
    const fetchSunriseSunset = async () => {
      const coords = observer;

      const nowLocal = new Date();
      const sunriseSearchDate = new Date(nowLocal.getFullYear(), nowLocal.getMonth(), nowLocal.getDate(), 0, 0, 0, 0);

      const baseQuery = `latitude=${coords.latitude}&longitude=${coords.longitude}&height=${coords.height}&body=Sol`;

      try {
        const sunriseRes = await fetch(
          `/api/sunrise-sunset?${baseQuery}&date=${sunriseSearchDate.toISOString()}&direction=1`,
        );

        if (!sunriseRes.ok) {
          throw new Error("Failed to fetch sunrise event");
        }

        const sunriseData = await sunriseRes.json();
        const sunriseDate = sunriseData.time ? new Date(sunriseData.time) : null;

        if (canceled) return;

        let sunsetDate: Date | null = null;
        let nextSunriseDate: Date | null = null;

        if (sunriseDate) {
          const sunsetSearchDate = new Date(sunriseDate.getTime() + 60 * 60_000);
          const nextSunriseSearchDate = new Date(sunriseDate.getTime() + 18 * 3600_000);

          const [sunsetRes, nextSunriseRes] = await Promise.all([
            fetch(
              `/api/sunrise-sunset?${baseQuery}&date=${sunsetSearchDate.toISOString()}&direction=-1`,
            ),
            fetch(
              `/api/sunrise-sunset?${baseQuery}&date=${nextSunriseSearchDate.toISOString()}&direction=1`,
            ),
          ]);

          if (!sunsetRes.ok || !nextSunriseRes.ok) {
            throw new Error("Failed to fetch sunset or next sunrise events");
          }

          const [sunsetData, nextSunriseData] = await Promise.all([
            sunsetRes.json(),
            nextSunriseRes.json(),
          ]);

          sunsetDate = sunsetData.time ? new Date(sunsetData.time) : null;
          nextSunriseDate = nextSunriseData.time ? new Date(nextSunriseData.time) : null;
        }

        if (canceled) return;

        setSunriseTime(sunriseDate);
        setSunsetTime(sunsetDate);
        setNextSunriseTime(nextSunriseDate);
        sunRefreshRequested.current = false;
      } catch (error) {
        if (!canceled) {
          console.error("Sunrise/sunset fetch failed", error);
          setSunriseTime(null);
          setSunsetTime(null);
          setNextSunriseTime(null);
          sunRefreshRequested.current = false;
        }
      }
    };
    fetchSunriseSunset();
    return () => {
      canceled = true;
    };
  }, [dayKey, isLocating, observer, sunFetchTrigger]);

  useEffect(() => {
    if (!nextSunriseTime) {
      sunRefreshRequested.current = false;
      return;
    }

    if (now.getTime() >= nextSunriseTime.getTime()) {
      if (!sunRefreshRequested.current) {
        sunRefreshRequested.current = true;
        setSunFetchTrigger((value) => value + 1);
      }
    } else {
      sunRefreshRequested.current = false;
    }
  }, [now, nextSunriseTime]);

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
  }, [now]);

  useEffect(() => {
    setDailyLuck(getDailyLuck(now));
  }, [now]);

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
                    <span className="retrograde-text">Retrograde ℞</span>
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
          <thead>
            <tr>
              <th colSpan={3} className="hours-table-header-symbol">
                {(() => {
                  const showNightBlock =
                    planetaryHours.length >= 13 && sunriseTime && sunsetTime
                      ? now.getTime() < sunriseTime.getTime() ||
                        now.getTime() >= sunsetTime.getTime()
                      : false;
                  return showNightBlock ? "☾" : "☀";
                })()}
              </th>
            </tr>
          </thead>
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
                const highlightClass = `${ph.planet.toLowerCase()}-highlight`;
                const rowClassNames = [highlightClass, isCurrent ? "current" : ""]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <tr key={ph.hour} className={rowClassNames} aria-current={isCurrent ? "true" : undefined}>
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

      {dailyLuck && (
        <p className={`daily-luck-text ${dailyLuck}`} style={{ textAlign: "center", fontSize: "1.4rem", marginTop: 16 }}>
          Today is {dailyLuck}.
        </p>
      )}
    </main>
  );
}
