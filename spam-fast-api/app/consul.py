import httpx
import os

from app.config import (
    CONSUL_URL,
    SERVICE_NAME,
    SERVICE_PORT,
)

def get_service_id():
    return f"{SERVICE_NAME}-{os.getenv('HOSTNAME')}"

async def register() -> None:
    # Każdy kontener ma unikalny HOSTNAME → używamy go jako adresu
    address = os.getenv("HOSTNAME")

    async with httpx.AsyncClient() as client:
        await client.put(
            f"{CONSUL_URL}/agent/service/register",
            json={
                "ID": get_service_id(),
                "Name": SERVICE_NAME,
                "Address": address,                     # 🔥 KLUCZOWE
                "Port": SERVICE_PORT,
                "Check": {
                    "HTTP": f"http://{address}:{SERVICE_PORT}/health",
                    "Interval": "10s",
                    "DeregisterCriticalServiceAfter": "1m",
                },
            },
        )

async def deregister() -> None:
    async with httpx.AsyncClient() as client:
        await client.put(
            f"{CONSUL_URL}/agent/service/deregister/{get_service_id()}"
        )
