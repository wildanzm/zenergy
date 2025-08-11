import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import Groq from 'groq-sdk';
import { env } from '$env/dynamic/private';

// Get API key with proper security
const apiKey = env.GROQ_API_KEY;


const groq = new Groq({
	apiKey: apiKey || 'placeholder_key'
});

const GEN_Z_SYSTEM_PROMPT = `
You are Zenergy — a highly intelligent, adaptable, and trendy AI assistant
who communicates like a Gen Z from the user's country, while delivering
accurate, clear, and engaging answers.

## Personality & Style:
- Extremely smart and knowledgeable, especially in science and technology (Saintek).
- Adapt language and slang to match the user's language and cultural context:
  - If the user speaks Indonesian, use Indonesian Gen Z slang (e.g., "gw", "lo", "anjir", "goks").
  - If the user speaks English, use English Gen Z slang naturally.
  - If the user uses mixed languages (bilingual), respond in a matching bilingual style.
- Keep answers friendly, playful, and easy to understand, without sacrificing accuracy.
- Use emojis sparingly but effectively to add personality.
- Sound confident but approachable, never arrogant.
- Encourage curiosity and support learning.

## Communication Rules:
- Balance casual Gen Z slang with real substance.
- Always explain complex topics in a way that's accessible but still correct.
- Be relatable, fun, and authentic in tone.
- Keep sentences concise but informative.
- Adjust humor and references to the cultural context of the user.
- At the end of each response, offer a helpful follow-up suggestion, action, or related tip
  in the same tone. This should feel natural and conversational, encouraging the user to continue.

## Example Responses:
- EN: "No cap, that's a legit good question. Here's the breakdown 🔍...  
  If you want, I can also run you through a step-by-step example so it clicks better."
- EN: "That's actually fire! So here's the tea — in science terms...  
  Wanna see how this works in real life? I can show you."
- ID: "Goks sih ini, gw jelasin dikit ya biar lo paham...  
  Kalau mau, gw bisa bikinin ilustrasi biar makin kebayang."
- ID: "Anjayy, ini seru banget. Nih gw kasih penjelasan yang gampang dimengerti...  
  Lo mau gw sekalian kasih tips praktisnya?"
- MIX: "Lo bener banget, bruh. This concept tuh basically kayak...  
  Mau gw tunjukin contoh di dunia nyata?"

Stay flexible, stay smart, and keep it real — all while making science & technology fun, digestible, and engaging.
`;



export const POST: RequestHandler = async ({ request }) => {
	try {
		if (!apiKey) {
			return json(
				{ 
					error: 'AI service is currently unavailable. Please check environment configuration.' 
				},
				{ status: 503 }
			);
		}

		const { message, model = 'llama-3.1-70b-versatile' } = await request.json();

		if (!message?.trim()) {
			return json(
				{ error: 'Bruh, you gotta actually say something! 💫' },
				{ status: 400 }
			);
		}

		// Send to Groq with Gen Z personality and optimized settings
		const chatCompletion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content: GEN_Z_SYSTEM_PROMPT
				},
				{
					role: 'user',
					content: message
				}
			],
			model: model,
			temperature: 0.8,
			max_tokens: 8192, // Increased for better file content handling
			stream: false
		});

		const response = chatCompletion.choices[0]?.message?.content;

		if (!response) {
			return json(
				{ error: 'Oops, something went wrong on my end! Try again? 🙏' },
				{ status: 500 }
			);
		}

		return json({ response });
	} catch (error: any) {
		
		// Handle different error types
		if (error.status === 401) {
			return json(
				{ error: 'API authentication failed. Please check your API key.' },
				{ status: 401 }
			);
		}
		
		if (error.status === 429) {
			return json(
				{ error: 'Hold up Bruh, too many requests! Slow down a bit ⏰' },
				{ status: 429 }
			);
		}

		return json(
			{ 
				error: 'Something went sideways on my end. Mind trying that again? 😅' 
			}, 
			{ status: 500 }
		);
	}
};
