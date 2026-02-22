import Base64 from 'crypto-js/enc-base64';
import hmacSHA1 from 'crypto-js/hmac-sha1';

// Environment variables for OAuth 1.0 Basic
const CONSUMER_KEY = process.env.EXPO_PUBLIC_CONSUMERKEY_FATSECRET;
const CONSUMER_SECRET = process.env.EXPO_PUBLIC_CONSUMERSECRET_FATSECRET;

// OAuth 1.0 strictly requires specific character encodings that JS encodeURIComponent ignores
// Specifically: ! * ' ( )
const oauthEncode = (str: string) => {
    return encodeURIComponent(str)
        .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())
        .replace(/\+/g, '%20');
};

export interface FatSecretFood {
    food_id: string;
    food_name: string;
    food_description: string;
    food_url: string;
    food_type: string;
}

export interface FoodSearchResult {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    servingSize: string;
    original: FatSecretFood;
}

/**
 * Searches the FatSecret food database using pure REST API OAuth 1.0 Core signing
 * @param query The search term
 * @param maxResults Maximum number of results to return (default 5)
 */
export const searchFoods = async (query: string, maxResults: number = 5): Promise<FoodSearchResult[]> => {
    if (!query || query.trim().length === 0) return [];

    if (!CONSUMER_KEY || !CONSUMER_SECRET) {
        console.error("FatSecret OAuth 1.0 credentials missing (EXPO_PUBLIC_CONSUMERKEY_FATSECRET or EXPO_PUBLIC_CONSUMERSECRET_FATSECRET).");
        return [];
    }

    try {
        const httpMethod = 'GET';
        // Base API URL
        const url = 'https://platform.fatsecret.com/rest/server.api';

        // Define all parameters required for the OAuth Signature Base String
        const params: Record<string, string> = {
            format: 'json',
            max_results: maxResults.toString(),
            method: 'foods.search',
            oauth_consumer_key: CONSUMER_KEY,
            oauth_nonce: Math.random().toString(36).substring(2),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_version: '1.0',
            search_expression: query,
        };

        console.log("FatSecret Auth Debug -> Consumer Key Valid:", !!CONSUMER_KEY);

        // 1. Sort parameters alphabetically by key naturally 
        const sortedKeys = Object.keys(params).sort();

        // 2. Construct canonical parameter string
        const paramStrings = sortedKeys.map(key =>
            `${oauthEncode(key)}=${oauthEncode(params[key])}`
        );
        const normalizedParameters = paramStrings.join('&');

        // 3. Construct the Signature Base String
        const signatureBaseString = [
            oauthEncode(httpMethod),
            oauthEncode(url),
            oauthEncode(normalizedParameters)
        ].join('&');

        // 4. Calculate HMAC-SHA1 Signature using Consumer Secret
        // Note: & at the end stands for the empty token secret since this is a 2-legged OAuth call.
        const signingKey = `${oauthEncode(CONSUMER_SECRET)}&`;
        const signatureHash = hmacSHA1(signatureBaseString, signingKey);
        const signature = Base64.stringify(signatureHash);

        // 5. Append Signature to parameters 
        params['oauth_signature'] = signature;

        // 6. Build final network URL (re-sorting strictly required by some server endpoints)
        const finalQueryString = Object.keys(params)
            .sort()
            .map(key => `${oauthEncode(key)}=${oauthEncode(params[key])}`)
            .join('&');

        const finalUrl = `${url}?${finalQueryString}`;

        console.log("Final OAuth URL:", finalUrl);

        const response = await fetch(finalUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`FatSecret Search API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();

        // Catch gracefully if API returns an error object inside 200 OK (common FatSecret pattern)
        if (data.error) {
            throw new Error(`FatSecret Logic Error: ${data.error.message}`);
        }

        const results = data?.foods?.food;
        if (!results) return [];

        // FatSecret returns a single object instead of an array if there's only exactly 1 result match
        const foodArray: FatSecretFood[] = Array.isArray(results) ? results : [results];

        // Parse out the details we actually need to render UI cleanly
        const parsedResults: FoodSearchResult[] = foodArray.map(food => {
            let calories = 0;
            let protein = 0;
            let carbs = 0;
            let fat = 0;
            let servingSize = "Unknown serving";

            // Description format is usually: "Per 100g - Calories: 52kcal | Fat: 0.17g | Carbs: 13.81g | Protein: 0.26g"
            if (food.food_description) {
                // Extract serving size block cleanly
                const servingMatch = food.food_description.split('-');
                if (servingMatch.length > 0) {
                    servingSize = servingMatch[0].replace('Per ', '').trim();
                }

                // regex extract numeric metrics
                const calMatch = food.food_description.match(/Calories:\s*(\d+)kcal/i);
                if (calMatch && calMatch[1]) {
                    calories = parseInt(calMatch[1], 10);
                }

                const fatMatch = food.food_description.match(/Fat:\s*([0-9.]+)g/i);
                if (fatMatch && fatMatch[1]) fat = parseFloat(fatMatch[1]);

                const carbMatch = food.food_description.match(/Carbs:\s*([0-9.]+)g/i);
                if (carbMatch && carbMatch[1]) carbs = parseFloat(carbMatch[1]);

                const proteinMatch = food.food_description.match(/Protein:\s*([0-9.]+)g/i);
                if (proteinMatch && proteinMatch[1]) protein = parseFloat(proteinMatch[1]);
            }

            return {
                calories,
                protein,
                carbs,
                fat,
                servingSize,
                original: food
            };
        });

        return parsedResults;

    } catch (error) {
        console.error("Search API Error:", error);
        return [];
    }
};
