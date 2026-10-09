import httpx

from app.core.config import settings


class AIService:
    def __init__(self) -> None:
        self.base_url = "https://openrouter.ai/api/v1"
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model

    async def select_adventure(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Eres el selector inteligente de Ruta Viva AI. "
                        "Elige una aventura exclusivamente entre las "
                        "candidatas proporcionadas. No inventes IDs. "
                        'Responde solo JSON: {"adventure_id": "id"}'
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "temperature": 0,
            "max_tokens": 80,
        }

        timeout = httpx.Timeout(8.0, connect=5.0)

        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
            )

        response.raise_for_status()
        data = response.json()

        return data["choices"][0]["message"]["content"]


ai_service = AIService()