import asyncio
import websockets
import json
import pandas as pd

# Read data from Excel file
def load_data():
    df = pd.read_csv('data.csv')
    return df.to_dict(orient='records')

async def send_data(websocket, path):
    while True:
        data = load_data()
        for row in data:
            await websocket.send(json.dumps(row))
            await asyncio.sleep(0.2)

async def main():
    async with websockets.serve(send_data, "localhost", 8765):
        print("WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    asyncio.run(main())
