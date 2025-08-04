John Everett - Interactive AI Portfolio
  This is the repository for my personal portfolio website, designed to showcase my skills in software engineering and data analysis. The site is a fully responsive, single-page application featuring a sleek, modern design and several interactive elements, including a     dynamic AI-powered assistant.

Live Demo: johneverett.com

Overview
  This portfolio goes beyond a static display of projects. It serves as a live demonstration of my abilities by integrating Google's Gemini API through a secure serverless backend. The centerpiece is an interactive AI guide that roams the page, providing helpful tips      and answering user questions based on my resume and the content of the site.

Key Features
  Interactive AI Guide: A floating ball that acts as a site guide, providing helpful tips and responding to user interactions.

  AI-Powered Skills Match: Visitors can paste or upload a job description, and the AI assistant will generate a summary explaining how my skills and experience align with the role.

  Resume-Based Q&A: The AI can answer specific questions about my professional background, with its knowledge grounded in the content of my resume to prevent inaccurate responses.

  Secure Backend: All calls to the Gemini API are proxied through a Netlify serverless function, ensuring that the API key is never exposed on the client side.

  Dynamic UI: The site includes several engaging UI elements, such as a cursor-following glow effect and an off-screen pointer to track the AI guide.

  Fully Responsive: The layout and all interactive features are designed to work seamlessly on desktop and mobile devices.

  Tech Stack
Frontend
  HTML5

  Tailwind CSS for styling

  JavaScript (ES6+) for all interactivity and client-side logic

  PDF.js for client-side reading of uploaded PDF files

Backend & API
  Netlify Functions: Serverless Node.js functions to securely handle API requests.

  Google Gemini API: Powers the AI assistant's text generation and Q&A capabilities.

  Formspree: Manages submissions from the contact form.

Local Setup
  To run this project locally, you will need to:

  Clone the repository.

  Create a Netlify account and link the project.

  Obtain a Google Gemini API key.

  Add the API key as an environment variable in your Netlify site settings named GEMINI_API_KEY.

  Install the Netlify CLI and run netlify dev to start the local development server, which will include the serverless function environment.
