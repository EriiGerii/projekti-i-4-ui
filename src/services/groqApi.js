// src/services/groqApi.js

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Funksioni për të prerë tekstin në madhësi të sigurt
const truncateText = (text, maxLength = 3500) => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '\n\n[...Teksti është prerë për shkak të gjatësisë...]'
}

// PROMPTI I OPTIMIZUAR PËR GROQ
const getPrompt = (text) => {
  return `You are an AI study assistant. Based on the text below, generate a summary, a 5-question multiple choice quiz, and an escape room game.

Text: ${text}

Requirements:
- Summary: Max 150 words, only key points, use bullet points
- Quiz: 5 questions, each with 4 options (A/B/C/D) and correct answer
- Escape Room: Theme from content, 3 puzzles with 3 options each, success message

Output ONLY valid JSON. Use this EXACT structure:

{
  "summary": {
    "title": "short title",
    "keyPoints": ["point1", "point2", "point3"],
    "fullSummary": "summary text here"
  },
  "quiz": {
    "questions": [
      {
        "question": "question text",
        "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
        "correctAnswer": "A",
        "explanation": "why this is correct"
      }
    ]
  },
  "escapeRoom": {
    "theme": "theme name",
    "backstory": "one sentence story",
    "puzzles": [
      {
        "question": "puzzle question",
        "options": ["option1", "option2", "option3"],
        "correctAnswer": "option1"
      }
    ],
    "successMessage": "congratulations message"
  }
}`
}

export async function generateContentFromText(fullText) {
  // Prit tekstin nëse është shumë i gjatë
  const text = truncateText(fullText, 3500)
  
  const prompt = getPrompt(text)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'API request failed')
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Gjej JSON-in në përgjigje
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    } else {
      throw new Error('Could not parse JSON response')
    }
  } catch (error) {
    console.error('Groq API Error:', error)
    throw error
  }
}