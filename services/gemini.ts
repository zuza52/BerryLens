// services/gemini.ts
// Сервис для работы с Gemini Vision API

export interface BerryAnalysis {
  name: string;
  nameRu: string;
  confidence: number;
  edible: boolean;
  description: string;
  taste: string;
  nutrition: string;
  warning?: string;
  season: string;
  emoji: string;
}

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const PROMPT = `Ты эксперт-ботаник. Посмотри на фотографию и определи, что изображено.

Если на фото есть ягоды, фрукты или их части — верни JSON следующего формата:
{
  "name": "English name",
  "nameRu": "Название на русском",
  "confidence": 95,
  "edible": true,
  "description": "Краткое описание (1-2 предложения)",
  "taste": "Вкусовые характеристики",
  "nutrition": "Основные витамины и польза",
  "warning": "Предупреждение если ягода ядовита или есть нюансы (null если нет)",
  "season": "Сезон созревания",
  "emoji": "🍓"
}

Если на фото НЕТ ягод или фруктов — верни:
{
  "name": "not_found",
  "nameRu": "Ягоды не обнаружены",
  "confidence": 0,
  "edible": false,
  "description": "На фотографии не удалось обнаружить ягоды или фрукты. Попробуй сфотографировать ближе.",
  "taste": "",
  "nutrition": "",
  "warning": null,
  "season": "",
  "emoji": "🔍"
}

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown блоков и пояснений.`;

export async function analyzeImage(
  base64Image: string,
  apiKey: string
): Promise<BerryAnalysis> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: PROMPT,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 400 && error?.error?.message?.includes('API_KEY')) {
      throw new Error('Неверный API ключ. Проверьте ключ в настройках.');
    }
    throw new Error(`Ошибка API: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Пустой ответ от Gemini API');
  }

  // Убираем возможные markdown блоки
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as BerryAnalysis;
  } catch {
    throw new Error('Не удалось разобрать ответ от Gemini');
  }
}
