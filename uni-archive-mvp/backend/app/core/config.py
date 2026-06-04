from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://uniarchive:uniarchive@localhost:5432/uniarchive"
    upload_dir: str = "uploads"
    max_upload_size_mb: int = 50

    # Authentication
    jwt_secret: str = "super_secret_jwt_key_for_development_only_change_in_prod"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Optional AI Study Assistant Config
    llm_provider: str = "gemini"
    gemini_api_key: str = ""
    groq_api_key: str = ""
    llm_model: str = "gemini-1.5-flash"
    llm_text_limit: int = 10000

    class Config:
        env_file = ".env"


settings = Settings()