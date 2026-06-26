from fastapi import FastAPI

app = FastAPI(
    title="CloudOps 360",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "CloudOps 360 Backend Running"}