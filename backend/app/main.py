from fastapi import FastAPI

from app.api.adventures import router as adventures_router

app = FastAPI(
    title="Ruta Viva AI API",
    description="Backend de Ruta Viva AI",
    version="1.0.0",
)

app.include_router(adventures_router)


@app.get("/")
def root():
    return {
        "message": "Ruta Viva AI API funcionando",
        "status": "ok",
    }