import { GoogleGenAI } from "@google/genai";
import { AIResponse, ScenarioType, TravelPlan } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateTravelPlans = async (
  destination: string,
  scenarios: ScenarioType[],
  userLocation?: { lat: number; lng: number }
): Promise<AIResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set the API_KEY environment variable.");
  }

  const model = "gemini-2.5-flash"; // Using 2.5 Flash for speed and Search grounding
  
  const scenarioText = scenarios.length > 0 ? scenarios.join(", ") : "general sightseeing";

  const prompt = `
    I need you to plan a trip to ${destination}.
    The user is specifically interested in these scenarios: ${scenarioText}.
    
    Please generate 3 DISTINCT travel plans (e.g., "Budget-Friendly", "Luxury/Comfort", "Adventure/Deep-Dive").
    
    For each plan, you MUST calculate estimated costs (Currency: CNY or local appropriate) including:
    - Big transportation (getting there from a major hub)
    - Local transport (taxi/rental)
    - Accommodation
    - Food
    - Tickets/Entry fees
    
    You MUST identify critical alerts (Visa requirements, Border control warnings, Safety warnings) for a general international traveler or local traveler depending on context.
    
    You MUST plan specific "Check-in" spots for the selected scenarios (e.g. best place for ${scenarioText}).
    
    OUTPUT FORMAT:
    You must return a valid JSON object wrapped in a code block \`\`\`json ... \`\`\`.
    The structure must match this interface:
    {
      "plans": [
        {
          "id": "plan_1",
          "title": "Title of the plan",
          "description": "Short summary",
          "tags": ["Budget", "Hiking", etc],
          "duration": "e.g. 5 Days 4 Nights",
          "scenicHighlights": ["Name of spot for Sunrise", "Name of spot for Stars"],
          "cost": {
            "transportation": 1000,
            "localTransport": 200,
            "accommodation": 1500,
            "food": 800,
            "tickets": 300,
            "total": 3800,
            "currency": "CNY"
          },
          "alerts": ["Visa required for non-locals", "High altitude sickness warning"],
          "itinerary": [
            {
              "day": 1,
              "summary": "Arrival and acclimatization",
              "activities": [
                { "time": "10:00", "location": "Airport", "description": "Arrive and take taxi", "type": "transport" },
                { "time": "18:00", "location": "Sunset Point", "description": "Watch the sunset", "type": "scenic" }
              ]
            }
          ]
        }
      ] // ... 3 plans total
    }

    Use Google Search and Google Maps to find REAL locations, REAL prices, and REAL visa info.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: userLocation ? {
            retrievalConfig: {
                latLng: {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                }
            }
        } : undefined
      }
    });

    const text = response.text || "";
    
    // Extract JSON from code block
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    let parsedData: { plans: TravelPlan[] } = { plans: [] };
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        parsedData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from AI response", e);
        throw new Error("Received malformed data from AI. Please try again.");
      }
    } else {
        // Fallback: try to parse the raw text if no code blocks (rare but possible)
        try {
            parsedData = JSON.parse(text);
        } catch(e) {
             throw new Error("Could not generate a structured plan. Please try again.");
        }
    }

    // Extract grounding sources
    const groundingSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri || '#' };
        return null;
      })
      .filter((item: any) => item !== null) || [];

    // Filter unique sources
    const uniqueSources = Array.from(new Set(groundingSources.map((s: any) => s.uri)))
        .map(uri => groundingSources.find((s: any) => s.uri === uri));

    return {
      plans: parsedData.plans,
      groundingSources: uniqueSources as any
    };

  } catch (error) {
    console.error("Gemini Service Error:", error);
    throw error;
  }
};