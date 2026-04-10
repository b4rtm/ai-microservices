import httpx

from app.config import (
    CONSUL_URL,
    SERVICE_ADDRESS,
    SERVICE_ID,
    SERVICE_NAME,
    SERVICE_PORT,
)


async def register() -> None:
    async with httpx.AsyncClient() as client:
        await client.put(
            f"{CONSUL_URL}/agent/service/register",
            json={
                "ID": SERVICE_ID,
                "Name": SERVICE_NAME,
                "Address": SERVICE_ADDRESS,
                "Port": SERVICE_PORT,
                "Check": {
                    "HTTP": f"http://{SERVICE_ADDRESS}:{SERVICE_PORT}/health",
                    "Interval": "10s",
                    "DeregisterCriticalServiceAfter": "1m",
                },
            },
        )


async def deregister() -> None:
    async with httpx.AsyncClient() as client:
        await client.put(f"{CONSUL_URL}/agent/service/deregister/{SERVICE_ID}")
