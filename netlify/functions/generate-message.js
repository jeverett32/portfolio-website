// File location: netlify/functions/generate-message.js

// Built-in Node.js modules to read files from your repository.
const fs = require('fs');
const path = require('path');


exports.handler = async function (event) {
  // Only allow POST requests.
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // --- Step 1: Read your resume file ---
    // This securely reads the resume.txt file you added to this folder.
    const resumePath = path.resolve(__dirname, 'resume.txt');
    const resumeText = fs.readFileSync(resumePath, 'utf8');

    // --- Step 2: Determine the task (Skills Match or Q&A) ---
    const { taskType, jobDescription, question } = JSON.parse(event.body);

    // Securely get the API key you stored in Netlify's settings.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables.');
    }

    let finalPrompt;

    if (taskType === 'match') {
      // --- Prompt for the Skills Match task ---
      finalPrompt = `
        You are an AI assistant for John Everett's portfolio. Your task is to act as John and explain why he is a good fit for a job.
        Your knowledge is strictly limited to the content of his resume, provided below. Do not invent any information.
        Based on the resume and the provided job description, write a brief, first-person summary (2-4 sentences) explaining why his skills and background make him a great fit for this specific role.
        Focus only on the most relevant skills and experiences found in both the resume and the job description.

        My Resume:
        ---
        ${resumeText}
        ---

        Job Description:
        ---
        ${jobDescription}
        ---
      `;
    } else if (taskType === 'qa') {
      // --- Prompt for the Q&A task ---
      finalPrompt = `
        You are an AI assistant for John Everett's portfolio. Your task is to answer questions about John based ONLY on the information in his resume.
        Your knowledge is strictly limited to the content of his resume, provided below.
        If the answer is in the resume, answer it concisely from a first-person perspective (e.g., "I worked on...").
        If the answer cannot be found in the resume, you MUST respond with: "I don't have that specific information in my resume, but I'd be happy to discuss it further."
        Do not, under any circumstances, invent or infer information that is not explicitly stated in the resume.

        My Resume:
        ---
        ${resumeText}
        ---

        Question:
        ---
        ${question}
        ---
      `;
    } else {
      throw new Error('Invalid task type specified.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      throw new Error(`Gemini API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: text }),
    };

  } catch (error) {
    console.error('Error in Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
