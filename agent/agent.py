import time
import sys
import threading
import logging
from ping_sweep import run_ping_sweep
from arp_scanner import scan_subnet_scapy
from packet_sniffer import PacketSniffer
from reporter import Reporter

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class NetworkGuardianAgent:
    def __init__(self, subnet="192.168.1.0/24", interval=60, backend_url="http://localhost:8000"):
        self.subnet = subnet
        self.interval = interval
        self.reporter = Reporter(backend_url)
        self.sniffer = PacketSniffer(self.reporter)
        self.running = False

    def start(self):
        logging.info("Starting Network Guardian Pro Monitoring Agent...")
        self.running = True

        # 1. Start sniffer thread
        self.sniffer_thread = threading.Thread(target=self.sniffer.start_sniffing)
        self.sniffer_thread.daemon = True
        self.sniffer_thread.start()

        # 2. Start discovery loop
        self.discovery_thread = threading.Thread(target=self.run_discovery_loop)
        self.discovery_thread.daemon = True
        self.discovery_thread.start()

        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()

    def stop(self):
        logging.info("Stopping Network Guardian Pro Agent...")
        self.running = False
        self.sniffer.stop_sniffing()

    def run_discovery_loop(self):
        while self.running:
            try:
                # Run ICMP sweep to populate ARP cache
                run_ping_sweep(self.subnet)
                
                # Scan subnet via ARP
                discovered_devices = scan_subnet_scapy(self.subnet)
                
                # Report results
                if discovered_devices:
                    # format database model matching schema
                    payload = []
                    for dev in discovered_devices:
                        payload.append({
                            "id": f"d-{dev['mac'].replace(':', '')[-6:].lower()}",
                            "name": dev['hostname'] if dev['hostname'] != "unknown" else f"Node-{dev['ip'].split('.')[-1]}",
                            "hostname": dev['hostname'],
                            "ip": dev['ip'],
                            "mac": dev['mac'],
                            "vendor": dev['vendor'],
                            "type": "pc",
                            "status": "online",
                            "firstSeen": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            "lastSeen": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                            "riskLevel": "low",
                            "latency": 5.0,
                            "packetLoss": 0.0,
                            "bandwidth": {"up": 0.0, "down": 0.0},
                            "openPorts": [],
                            "os": "Unknown OS",
                            "trusted": False,
                            "notes": "Discovered by network agent sweep",
                            "connectedTo": []
                        })
                    self.reporter.report_devices(payload)
            except Exception as e:
                logging.error(f"Error in discovery loop: {e}")
                
            # Wait for interval
            time.sleep(self.interval)

if __name__ == "__main__":
    subnet = "192.168.1.0/24"
    if len(sys.argv) > 1:
        subnet = sys.argv[1]
        
    agent = NetworkGuardianAgent(subnet=subnet, interval=60)
    agent.start()
