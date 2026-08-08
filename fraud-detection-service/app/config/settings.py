from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "fraud-detection-service"
    APP_VERSION: str = "1.0.0"
    HOST: str = "0.0.0.0"
    PORT: int = 8086
    MODEL_VERSION: str = "stub-v0"
    LOG_LEVEL: str = "INFO"
    JWT_SECRET: str = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
