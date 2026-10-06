import httpx

from app.core.config import settings


class AIService:
    def __init__(self) -> None:
        self.base_url = settings.ai_base_url
        self.api_key = settings.ai_api_key
        self.model = settings.ai_model

    async def generate_adventure(self, prompt: str) -> str:
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
                        "You are the AI game master for Ruta Viva AI. "
                        "Create outdoor adventures that encourage users "
                        "to explore the real world."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=60.0,
            )

        response.raise_for_status()

        data = response.json()

        return data["choices"][0]["message"]["content"]


ai_service = AIService()