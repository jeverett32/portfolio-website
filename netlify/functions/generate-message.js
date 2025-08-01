// File location: netlify/functions/generate-message.js


const fs = require('fs');
const path = require('path');
// Add the pdf-parse library to read your PDF resume
const pdf = require('pdf-parse');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Read the static resume PDF file from the repository.
    const resumePath = path.resolve(__dirname, 'resume.pdf');
    const dataBuffer = fs.readFileSync(resumePath);
    const pdfData = await pdf(dataBuffer);
    const resumeText = pdfData.text;


    // Get all the data sent from the website.
    const { taskType, jobDescription, question, bio, skills } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables.');
    }

    // Combine all of John's info into one knowledge base.
    const fullContext = `
      My Resume:
      ---
      ${resumeText}
      ---
      My Bio from my website:
      ---
      ${bio}
      ---
      My skills from my website:
      ---
      ${skills}
      ---
    `;

    let finalPrompt;

    if (taskType === 'match') {
      // Prompt for the Skills Match task, now with the full context.
      finalPrompt = `
        You are an AI assistant for John Everett's portfolio. Your task is to act as John and explain why he is a good fit for a job.
        Your knowledge is strictly limited to the content of his resume and the provided bio and skills. Do not invent any information.
        Based on this complete context about me and the provided job description, write a brief, first-person summary (2-4 sentences) explaining why my skills and background make me a great fit for this specific role.

        My Complete Professional Context:
        ---
        ${fullContext}
        ---

        Job Description to Match Against:
        ---
        ${jobDescription}
        ---
      `;
    } else if (taskType === 'qa') {
      // Prompt for the Q&A task, now with the full context.
      finalPrompt = `
        You are an AI assistant for John Everett's portfolio. Your task is to answer questions about John based ONLY on the information in his resume, bio, and skills list.
        Your knowledge is strictly limited to this provided context.
        If the answer is in the context, answer it concisely from a first-person perspective (e.g., "I worked on...").
        If the answer cannot be found in the context, you MUST respond with: "I don't have that specific information in my resume or portfolio, but I'd be happy to discuss it further."
        You are allowed to make inferences to answer questions, but try as hard as you can not to invent information. For example, if someone asks where I am from, you can say Provo, because I go to school at BYU. Or if someone asks when I will graduate, you can make an inference based on my education in my resume

        My Complete Professional Context:
        ---
        ${fullContext}
        ---

        Question to Answer:
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
