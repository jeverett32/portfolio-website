// File location: netlify/functions/generate-message.js

// This is a Node.js function that will run on Netlify's servers.
// It acts as a secure bridge between your website and the Google Gemini API.

exports.handler = async function (event) {
  // We only want to respond to POST requests from your website's form.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 1. Get the prompt that your website sent.
    const { prompt } = JSON.parse(event.body);

    // 2. Securely get the API key you stored in Netlify's settings.
    // process.env.GEMINI_API_KEY accesses the environment variable.
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // This is an important check in case the API key is missing.
      throw new Error('GEMINI_API_KEY not found in environment variables.');
    }

    // 3. Prepare the request to send to the actual Google Gemini API.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    // 4. Call the Google Gemini API.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // If Google's API returns an error, we'll pass it along.
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const result = await response.json();

    // Check for a valid response structure from Gemini.
    if (!result.candidates || !result.candidates[0] || !result.candidates[0].content.parts[0].text) {
        throw new Error('Invalid response structure from Gemini API.');
    }
    
    const text = result.candidates[0].content.parts[0].text;

    // 5. Send the generated text back to your website.
    return {
      statusCode: 200,
      body: JSON.stringify({ message: text }),
    };

  } catch (error) {
    // If anything goes wrong, send a detailed error message back.
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
