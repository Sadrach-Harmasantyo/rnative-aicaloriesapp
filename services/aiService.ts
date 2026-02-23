
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserData } from "./userService";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("EXPO_PUBLIC_GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const generateFitnessPlan = async (userData: UserData) => {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    You are an expert fitness and nutrition coach.
    Based on the following user profile, generate a personalized fitness and nutrition plan.
    
    User Profile:
    - Gender: ${userData.gender}
    - Age: (calculate from ${userData.birthDate?.year})
    - Height: ${userData.height} cm
    - Weight: ${userData.weight} kg
    - Goal: ${userData.goal}
    - Workout Frequency: ${userData.workoutFrequency}
    
    Proivde the response in strict JSON format with the following structure:
    {
      "dailyCalories": number,
      "macros": {
        "protein": number (grams),
        "carbs": number (grams),
        "fats": number (grams)
      },
      "waterIntake": string (e.g., "2-3 liters"),
      "fitnessTips": ["tip1", "tip2", "tip3"],
      "workoutPlan": "Brief summary of recommended workout routine"
    }
    
    Do not include any markdown formatting like \`\`\`json. Just return the raw JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up if markdown is included despite instructions
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating fitness plan:", error);
    throw error;
  }
};

export const analyzeFoodImage = async (base64Image: string) => {
  // gemini-1.5-flash supports multimodality (image + text)
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const prompt = `
    You are an expert nutritionist AI. 
    Analyze this image and identify the primary food or dish shown.
    Estimate the standard serving size, calories, and macronutrients.
    
    If the image is completely unrecognizable as food, do your best guess or identify the objects, but still follow the strict JSON structure.
    
    Provide the response in STRICT JSON format EXACTLY like this structure:
    {
      "foodName": "String (e.g. Apple, Pepperoni Pizza, Grilled Chicken)",
      "calories": Number (e.g. 95),
      "protein": Number (e.g. 0.5),
      "carbs": Number (e.g. 25),
      "fat": Number (e.g. 0.3),
      "servingSize": "String (e.g. 1 medium (182g), 1 slice (100g))"
    }
    
    Do not include any markdown formatting like \`\`\`json. Just return the raw JSON string.
    `;

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();

    // Clean up if markdown is included despite instructions
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error analyzing food image:", error);
    throw error;
  }
};

export const generateWeeklyBentoInsights = async (userData: UserData, weeklyLogs: any[]) => {
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const safeWeight = userData.weight || "Unknown";
  const safeGoal = userData.goal || "General Health";

  // Calculate weekly totals
  let totalConsumedCal = 0;
  let totalBurnedCal = 0;
  let totalWaterGlasses = 0;

  weeklyLogs.forEach(log => {
    totalConsumedCal += log?.caloriesConsumed || 0;
    totalBurnedCal += log?.caloriesBurned || 0;
    totalWaterGlasses += log?.waterConsumed || 0;
  });

  const avgConsumedCal = weeklyLogs.length > 0 ? Math.round(totalConsumedCal / weeklyLogs.length) : 0;
  const avgBurnedCal = weeklyLogs.length > 0 ? Math.round(totalBurnedCal / weeklyLogs.length) : 0;
  const avgWaterMl = weeklyLogs.length > 0 ? Math.round((totalWaterGlasses * 250) / weeklyLogs.length) : 0;

  const prompt = `
    You are an expert, highly motivational AI fitness coach.
    Based on the following actual user data aggregated over the CURRENT WEEK, generate personalized, short, punchy insights to be displayed in a Bento Grid UI.

    User Profile:
    - Weight: ${safeWeight} kg
    - Main Goal: ${safeGoal}
    
    This Week's Progress (Averages per day):
    - Avg Calories Consumed: ${avgConsumedCal} kcal/day (Total: ${totalConsumedCal})
    - Avg Calories Burned: ${avgBurnedCal} kcal/day (Total: ${totalBurnedCal})
    - Avg Water Logged: ${avgWaterMl} ml/day (Total: ${totalWaterGlasses * 250} ml)

    Analyze their performance THIS WEEK and provide structural feedback. Be extremely concise (max 2 short sentences per field).
    
    Provide the response in STRICT JSON format with EXACTLY this structure:
    {
      "motivation": "String (A punchy, highly motivating short sentence reflecting their WEEKLY effort)",
      "nutritionTip": "String (A specific, actionable tip based on their WEEKLY calories/water average)",
      "activityRecommendation": "String (A brief, practical physical activity recommendation for the upcoming days)",
      "overallScore": Number (An integer from 1 to 100 representing how well they are doing THIS WEEK based on their stats)
    }

    Do not include any markdown formatting like \`\`\`json. Just return the raw JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating weekly Bento insights:", error);
    throw error;
  }
};
