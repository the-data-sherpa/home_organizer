import { NextRequest, NextResponse } from "next/server";

interface WttrWeather {
  current_condition: {
    temp_F: string;
    temp_C: string;
    weatherDesc: { value: string }[];
    weatherCode: string;
  }[];
  nearest_area: {
    areaName: { value: string }[];
  }[];
}

// GET /api/weather - Get current weather
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location") || "auto";

    // Use wttr.in for free weather data
    const url = location === "auto" 
      ? "https://wttr.in/?format=j1"
      : `https://wttr.in/${encodeURIComponent(location)}?format=j1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "HomeOrganizer/1.0",
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error("Weather API error");
    }

    const data: WttrWeather = await response.json();
    const current = data.current_condition[0];
    const area = data.nearest_area[0];

    const weather = {
      temp: parseInt(current.temp_F),
      tempC: parseInt(current.temp_C),
      condition: current.weatherDesc[0].value,
      icon: getWeatherIcon(current.weatherCode),
      location: area.areaName[0].value,
    };

    return NextResponse.json(weather);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather" },
      { status: 500 }
    );
  }
}

export function getWeatherIcon(code: string): string {
  const codeNum = parseInt(code);
  
  // Weather codes from wttr.in
  if (codeNum === 113) return "☀️"; // Sunny
  if (codeNum === 116) return "⛅"; // Partly cloudy
  if (codeNum === 119 || codeNum === 122) return "☁️"; // Cloudy
  if (codeNum >= 176 && codeNum <= 263) return "🌧️"; // Rain/drizzle
  if (codeNum >= 266 && codeNum <= 317) return "🌧️"; // Rain
  if (codeNum >= 320 && codeNum <= 395) return "❄️"; // Snow
  if (codeNum >= 200 && codeNum <= 232) return "⛈️"; // Thunderstorm
  if (codeNum === 143 || codeNum === 248 || codeNum === 260) return "🌫️"; // Fog
  
  return "🌤️"; // Default
}
