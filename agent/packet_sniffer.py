import logging
import time
import random
from datetime import datetime

try:
    from scapy.all import sniff, IP, TCP, UDP
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class PacketSniffer:
    def __init__(self, reporter, interface="eth0"):
        self.reporter = reporter
        self.interface = interface
        self.running = False

    def packet_callback(self, pkt):
        if not pkt.haslayer(IP):
            return

        ip_layer = pkt[IP]
        protocol = "TCP" if pkt.haslayer(TCP) else "UDP" if pkt.haslayer(UDP) else "Other"
        
        port = 0
        if protocol == "TCP" and pkt.haslayer(TCP):
            port = pkt[TCP].dport
        elif protocol == "UDP" and pkt.haslayer(UDP):
            port = pkt[UDP].dport

        packet_entry = {
            "id": f"p-{random.randint(1000, 9999)}",
            "src": ip_layer.src,
            "dst": ip_layer.dst,
            "srcDevice": "Local Host",
            "dstDevice": "Remote Host",
            "protocol": protocol,
            "port": port,
            "size": len(pkt),
            "latency": random.randint(5, 50),
            "status": "delivered",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "route": ["Local Host", "Switch", "Router", "Internet"]
        }
        
        # Report immediately
        self.reporter.report_packets([packet_entry])

    def start_sniffing(self):
        self.running = True
        if not SCAPY_AVAILABLE:
            logging.warning("Scapy is not installed. Running sniffer simulation.")
            self._simulate_sniffing()
            return

        try:
            logging.info(f"Starting Scapy packet capture on interface: {self.interface}")
            sniff(iface=self.interface, prn=self.packet_callback, store=0, stop_filter=lambda p: not self.running)
        except Exception as e:
            logging.error(f"Failed to start raw capture: {e}. Falling back to simulation.")
            self._simulate_sniffing()

    def stop_sniffing(self):
        self.running = False
        logging.info("Packet sniffing stopped.")

    def _simulate_sniffing(self):
        protocols = ["TCP", "UDP", "ICMP", "DNS"]
        ports = [80, 443, 53, 22, 445]
        ips = ["192.168.1.10", "192.168.1.20", "8.8.8.8", "52.96.88.12", "192.168.1.1"]

        while self.running:
            time.sleep(random.uniform(0.5, 2.0))
            packet_entry = {
                "id": f"p-{random.randint(1000, 9999)}",
                "src": random.choice(ips),
                "dst": random.choice(ips),
                "srcDevice": "Local Host",
                "dstDevice": "Remote Host",
                "protocol": random.choice(protocols),
                "port": random.choice(ports),
                "size": random.randint(64, 1500),
                "latency": random.randint(1, 40),
                "status": "delivered",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "route": ["Local Host", "Switch", "Router", "Internet"]
            }
            self.reporter.report_packets([packet_entry])
