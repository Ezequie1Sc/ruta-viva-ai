from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ai_api_key: str
    ai_base_url: str
    ai_model: str = "Qwen/Qwen3-4B"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


settings = Settings()