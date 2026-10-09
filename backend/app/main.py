
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.adventures import router as adventures_router


app = FastAPI(
    title="Ruta Viva AI API",
    description="Backend de Ruta Viva AI",
    version="1.0.0",
)


# Dominios permitidos para conectarse al backend
origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
    "https://ruta-viva-ai-hbdn.vercel.app",
]


# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Rutas de la API
app.include_router(adventures_router)


@app.get("/")
def root():
    return {
        "message": "Ruta Viva AI API funcionando",
        "status": "ok",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ruta-viva-ai",
    }
