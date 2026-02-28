from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, tenant, landlord, booking, favorite
from config import settings

# Initialize FastAPI app
app = FastAPI(
    title="RentEase API",
    description="Digital Rental Platform API for Tenants and Landlords",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(tenant.router, prefix="/api")
app.include_router(landlord.router, prefix="/api")
app.include_router(booking.router, prefix="/api")
app.include_router(favorite.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    print("🚀 Starting RentEase API...")
    init_db()
    print("✅ Database initialized successfully!")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to RentEase API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
