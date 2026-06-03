from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql://uniarchive:uniarchive@localhost:5432/uniarchive"
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"

settings = Settings()