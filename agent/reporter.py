import requests
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class Reporter:
    def __init__(self, backend_url="http://localhost:8000"):
        self.backend_url = backend_url
        self.devices_endpoint = f"{backend_url}/api/devices"
        self.packets_endpoint = f"{backend_url}/api/packets"
        self.alerts_endpoint = f"{backend_url}/api/alerts"

    def report_devices(self, devices_list):
        try:
            # Send bulk updates to backend
            for dev in devices_list:
                # Post or patch each device
                dev_id = dev.get("id")
                # Using patch to upsert
                response = requests.patch(f"{self.devices_endpoint}/{dev_id}", json=dev, timeout=5)
                if response.status_code == 404:
                    # Device doesn't exist, create it via post
                    requests.post(self.devices_endpoint, json=dev, timeout=5)
            logging.info(f"Successfully reported {len(devices_list)} devices to backend.")
            return True
        except Exception as e:
            logging.error(f"Failed to report devices: {e}")
            return False

    def report_alerts(self, alert_data):
        try:
            response = requests.post(self.alerts_endpoint, json=alert_data, timeout=5)
            return response.status_code in [200, 201]
        except Exception as e:
            logging.error(f"Failed to report alert: {e}")
            return False

    def report_packets(self, packets_list):
        try:
            response = requests.post(f"{self.packets_endpoint}/log", json=packets_list, timeout=5)
            return response.status_code in [200, 201]
        except Exception as e:
            logging.error(f"Failed to report packets: {e}")
            return False
