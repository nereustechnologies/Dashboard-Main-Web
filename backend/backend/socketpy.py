import asyncio
import websockets
import json
import csv
import time
from pathlib import Path
import random

class CSVWebSocketStreamer:
    def __init__(self, csv_files, port=8765, loop_delay=0.1):
        self.csv_files = csv_files
        self.port = port
        self.loop_delay = loop_delay
        self.clients = set()
        self.sensor_data = {}
        self.server_start_time = time.time()

    def load_csv_data(self, file_path):
        data = []
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as file:
                reader = csv.DictReader(file)
                if reader.fieldnames:
                    reader.fieldnames = [field.strip() for field in reader.fieldnames]

                for row in reader:
                    converted_row = {}
                    for key, value in row.items():
                        key = key.strip()
                        try:
                            converted_row[key] = float(value) if value.strip() != '' else 0.0
                        except:
                            converted_row[key] = 0.0
                    data.append(converted_row)
            if data:
                print(f"Loaded {len(data)} samples from {file_path}")
        except FileNotFoundError:
            print(f"Warning: File {file_path} not found")
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
        return data

    def create_default_sample(self):
        return {
            'AX': 0.0, 'AY': 0.0, 'AZ': 9.8,
            'GX': 0.0, 'GY': 0.0, 'GZ': 0.0,
            'MX': 0.0, 'MY': 0.0, 'MZ': 0.0
        }

    def prepare_sample_data(self, sample_index):
        combined_data = {}
        required_sensors = [
            'left_thigh', 'left_shin',
            'right_thigh', 'right_shin'
        ]

        for sensor_name in required_sensors:
            sensor_samples = self.sensor_data.get(sensor_name)
            if sensor_samples:
                sample = sensor_samples[sample_index % len(sensor_samples)].copy()
                for key, value in sample.items():
                    if isinstance(value, (int, float)):
                        sample[key] = value + random.uniform(-0.5, 0.5)
            else:
                sample = self.create_default_sample()
                for key, value in sample.items():
                    sample[key] = value + random.uniform(-0.5, 0.5)
                if sample_index == 0:
                    print(f"Warning: Using default data for missing sensor '{sensor_name}'")

            # Group data by sensor
            sensor_data = {}
            for key, value in sample.items():
                sensor_data[f'{key}'] = value
            combined_data[sensor_name] = sensor_data

        combined_data['timestamp'] = int(time.time() - self.server_start_time)
        combined_data['sample_index'] = sample_index

        return combined_data

    async def register_client(self, websocket):
        self.clients.add(websocket)
        print(f"Client connected. Total clients: {len(self.clients)}")
        try:
            await websocket.wait_closed()
        finally:
            self.clients.remove(websocket)
            print(f"Client disconnected. Total clients: {len(self.clients)}")

    async def broadcast_data(self):
        for sensor_name, file_path in self.csv_files.items():
            self.sensor_data[sensor_name] = self.load_csv_data(file_path)

        max_samples = max(len(v) for v in self.sensor_data.values() if v)
        print(f"Starting data broadcast with {max_samples} samples")
        sample_index = 0

        while True:
            if self.clients:
                sample = self.prepare_sample_data(sample_index)
                sample['timestamp'] = int(time.time() - self.server_start_time)
                sample['sample_index'] = sample_index

                json_data = json.dumps(sample)
                disconnected = set()
                for client in self.clients.copy():
                    try:
                        await client.send(json_data)
                    except websockets.exceptions.ConnectionClosed:
                        disconnected.add(client)
                self.clients -= disconnected

                if sample_index % 50 == 0:
                    print(f"Broadcasted sample {sample_index + 1}")

                sample_index = (sample_index + 1) % max_samples

            await asyncio.sleep(self.loop_delay)

    async def start_server(self):
        print(f"WebSocket server starting on port {self.port}...")
        server = await websockets.serve(self.register_client, "localhost", self.port)
        broadcast_task = asyncio.create_task(self.broadcast_data())
        print("WebSocket server is running. Press Ctrl+C to stop.")
        try:
            await asyncio.gather(server.wait_closed(), broadcast_task)
        except KeyboardInterrupt:
            print("\nShutting down server...")
        finally:
            broadcast_task.cancel()
            server.close()
            await server.wait_closed()

def main():
    base_path = Path(__file__).parent
    csv_files_config = {
        'left_thigh': base_path / 'data_thigh_left.csv',
        'left_shin': base_path / 'data_shin_left.csv',
        'right_thigh': base_path / 'data_thigh_right.csv',
        'right_shin': base_path / 'data_shin_right.csv',
        'torso': base_path / 'data_torso.csv',
    }

    existing_files = {
        name: path for name, path in csv_files_config.items() if path.exists()
    }

    for name in csv_files_config:
        if name not in existing_files:
            print(f"Missing: {csv_files_config[name]} (will use default data for '{name}')")

    streamer = CSVWebSocketStreamer(
        csv_files=existing_files,
        port=8765,
        loop_delay=0.1
    )

    asyncio.run(streamer.start_server())

if __name__ == "__main__":
    main()
