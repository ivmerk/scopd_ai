import { schema } from '@osd/config-schema/target/out';
import { IRouter } from '../../../../core/server';
import { Logger } from '../../../../core/server';

// ВАЖНО: Укажите здесь ваш ключ.
// В идеале его нужно вынести в конфиг, но для простоты оставим здесь.
const OPENAI_API_KEY = 'sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface RouteDependencies {
  logger: Logger;
}

export function defineRoutes(router: IRouter, deps: RouteDependencies) {
  router.post(
    {
      path: '/api/scopd-ai/ask',
      validate: {
        body: schema.object({
          fullPrompt: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        const { fullPrompt } = request.body;

        // 1. Формируем тело запроса вручную
        const requestBody = {
          model: "gpt-4o", // или "gpt-3.5-turbo", если нужно дешевле
          messages: [
            {
              role: "system",
              content: "You are a senior SecOps analyst using Wazuh. Analyze the data provided by the user. Be concise, technical, and format output in Markdown."
            },
            {
              role: "user",
              content: fullPrompt
            }
          ],
          temperature: 0.7
        };

        // 2. Используем нативный fetch (встроен в Node.js 18+)
        // Если TypeScript ругается на fetch, можно использовать (global as any).fetch
        const apiRes = await fetch(OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify(requestBody)
        });

        // 3. Обработка ошибок от OpenAI (например, неверный ключ или лимиты)
        if (!apiRes.ok) {
          const errorData = await apiRes.text(); // Читаем текст ошибки
          console.error('OpenAI Error:', errorData);
          return response.customError({
            statusCode: apiRes.status,
            body: `OpenAI API Error: ${errorData}`
          });
        }

        // 4. Парсим успешный ответ
        const data: any = await apiRes.json();
        const aiMessage = data.choices?.[0]?.message?.content || "No response generated.";

        return response.ok({
          body: { answer: aiMessage }
        });

      } catch (error) {
        console.error('Server Error:', error);
        return response.customError({
          statusCode: 500,
          body: `Internal Plugin Error: ${error.message}`
        });
      }
    }
  );
}
