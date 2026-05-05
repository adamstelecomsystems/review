import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { star, answers, businessName, businessType } = await req.json();

    const starLabel = ['', 'very poor', 'poor', 'average', 'good', 'excellent'][star];
    const answersText = Object.entries(answers as Record<string, string>)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const prompt = `You are helping a customer write a Google review for "${businessName}" (${businessType || 'local business'}).

The customer rated their experience ${star} out of 5 stars (${starLabel}).
${answersText ? `Their feedback details: ${answersText}` : ''}

Generate exactly 3 different Google review messages that:
- Match the ${star}-star sentiment honestly and authentically
- Sound like a real human wrote them (not AI)
- Are 2-4 sentences each
- Vary in tone, vocabulary and structure from each other
- Reference specific details from the feedback if provided
- For 1-2 stars: honest about issues but constructive, not aggressive
- For 3 stars: balanced, fair
- For 4-5 stars: positive and enthusiastic

Return ONLY a JSON array of 3 strings, no other text:
["review 1", "review 2", "review 3"]`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/```json\n?|\n?```/g, '').trim();
    const reviews = JSON.parse(cleaned);

    return NextResponse.json({ reviews, ai: true });
  } catch (err) {
    console.error('Gemini error:', err);
    return NextResponse.json({ error: 'Failed to generate' }, { status: 500 });
  }
}
