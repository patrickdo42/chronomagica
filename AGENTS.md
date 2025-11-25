# Goal
I need you to completely create a new webapp from scratch. The instruciton section is my explanation of what the app should do.

# Chronomagica — Overview

Chronomagica is a one page webapp that displays astrologcal and planetary information for users to have a particular set of information all available in one place. The UI should look exactly like the images provided in both light and dark mode themes. This should be easily accessible on mobile. The webapp pulls the user's location data to accurately calculate the moon phases, planetary hour changes, if a day is considered lucky, neutral, and unlucky based off the calculation provided under the details section below. Keep the structure the same but feel free to use SHADCN components for a polished look. 

# Details

On Symbols ---
No conversion to emojis. Everything should display as the plain unicode symbols to keep things uniform.,
Symbols will always go after the word they're associate with, as shown in the visual example.,

The weather symbol:
☀ - Sunny or Clear
☁ - Cloudy


:white_sun_small_cloud:
Click to learn more
 - Partly Cloudy


:cloud_lightning:
Click to learn more
 - Thunderstorm


:cloud_rain:
Click to learn more
 - Raining


:cloud_snow:
Click to learn more
 - Snowing


:fog:
Click to learn more
 - Foggy

The planet symbols:
Sol - ☉
Luna - ☽︎
Mercury - ☿
Venus - ♀
Mars - ♂
Jupiter - ♃
Saturn - ♄
Uranus - ♅
Neptune - ♆
Pluto - ⯓

The zodiac symbols:
Aries - ♈︎ 
Taurus - ♉︎ 
Gemini - ♊︎ 
Cancer - ♋︎ 
Leo - ♌︎ 
Virgo - ♍︎ 
Libra - ♎︎ 
Scorpio - ♏︎ 
Sagittarius - ♐︎ 
Capricorn - ♑︎ 
Aquarius - ♒︎ 
Pisces - ♓︎

The moon phase symbols:
New Moon - 🌑︎
Waxing Crescent - 🌒︎
First Quarter - 🌓︎
Waxing Gibbous - 🌔︎
Full Moon - 🌕︎
Waning Gibbous - 🌖︎
Last Quarter - 🌗︎
Waning Crescent - 🌘︎

The retrograde symbol:
℞

On Colors ---
Light Mode Planetary Colors:
Sol - #ffd071
Luna - #d1d1d1
Mercury - #fff59c
Venus - #95f3ad
Mars - #ffc5c5
Jupiter - #9fdcff
Saturn - #a5a5a5
Uranus - #c9bcff
Neptune - #f9b6ff
Pluto - #e5baa5
Planetary hours table: White
I previously had this as a gray color. Make it white instead so it's uniform with how it's displayed on dark mode.

Dark Mode Planetary Colors:
Sol - #ac7403
Luna - #919191
Mercury - #918308
Venus - #004812
Mars - #7a0000
Jupiter - #00467f
Saturn - #1d1d1d
Uranus - #250076
Neptune - #7b0085
Pluto - #4f2916
Planetary hours table: Black

Sunrise hours unicode: ☀
Sunset hours unicode: ☾

Lucky Text: #009626
Unlucky Text: #ff0036
Neutral Text: #000
Location Logic ---
Current Date | Current Time
Current Location (Auto-detected but adjustable) | Current Weather

The date, time, and weather should all match the selected location. From the location, you may also need to pull information on things like sunrise and sunset and planetary positions for later.
Astrology Table Logic ---
Each row is set up as:
Planet Name | Planet Status | Planet Sign

The sun (labeled as Sol) should only have a status if there is a 'Solar Eclipse' or 'Lunar Eclipse'. It should also say if it's a Partial or Total Eclipse.

The moon (labeled as Luna) should always show the current moon phase for its status.

All other planets should ONLY have a status if it is currently Retrograde. If a planet is Retrograde, all text in the row should also be made red (using the HEX code provided).

# Tech
- Use TanStack Start. Use this website for information how to integrate it: https://tanstack.com/start/latest/docs/framework/react/quick-start
- VERY IMPORTANT: USE PNPM NOT NPM
- Use this library for astrology calculation: https://www.npmjs.com/package/astronomy-engine
- Use tailwind CSS for styling
- Use SHADCN UI for components