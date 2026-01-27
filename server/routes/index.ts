import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { schema } from '@osd/config-schema/target/out';
import { IRouter } from '../../../../core/server';
import { Logger } from '../../../../core/server';
import { ScopdAiPluginConfig } from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface RouteDependencies {
  logger: Logger;
  config$: Observable<ScopdAiPluginConfig>;
}

export function defineRoutes(router: IRouter, deps: RouteDependencies) {
  // Route to save the token persistently
  router.post(
    {
      path: '/api/scopd-ai/token',
      validate: {
        body: schema.object({
         token: schema.string(),
        }),
      },
   },
  async (context, request, response) => {
     try {
        console.log(request.body.token);
       return response.ok({ body: { success: true } });
      } catch (error) {
        return response.internalError({ body: `Failed to save token: ${error.message}` });
      }
   }
  );
  router.post(
    {
      path: '/api/scopd-ai/ask',
      validate: {
        body: schema.object({
          fullPrompt: schema.string(),
          model: schema.string(),
        }),
      },
    },
    async (context, request, response) => {
      try {
        // Add validation check for request body
        if (!request.body) {
          return response.badRequest({
            body: 'Request body is required'
          });
        }

        const { fullPrompt, model } = request.body as { fullPrompt: string; model: string };

        // Ensure fullPrompt is provided
        if (!fullPrompt) {
          return response.badRequest({
            body: 'fullPrompt is required in the request body'
          });
        }
        const config = await deps.config$.pipe(first()).toPromise();
        if (!config || !config.openAiKey) {
          return response.customError({
            statusCode: 500,
            body: 'OpenAI API key is not configured in opensearch_dashboards.yml',
          });
        }

        // Format the request for OpenAI
        const requestBody = {
          model: model,
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
            'Authorization': `Bearer ${config.openAiKey}`
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
