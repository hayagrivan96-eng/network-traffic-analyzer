import sys
import subprocess
import re
import socket
import logging
from mac_lookup import lookup_mac_vendor

try:
    from scapy.all import ARP, Ether, srp
    SCAPY_AVAILABLE = True
except ImportError:
    SCAPY_AVAILABLE = False

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def scan_subnet_scapy(subnet="192.168.1.0/24"):
    if not SCAPY_AVAILABLE:
        logging.warning("Scapy is not installed. Falling back to OS ARP scan.")
        return scan_subnet_fallback()

    try:
        logging.info(f"Initiating Scapy ARP discovery scan on subnet: {subnet}")
        ether = Ether(dst="ff:ff:ff:ff:ff:ff")
        arp = ARP(pdst=subnet)
        ans, unans = srp(ether/arp, timeout=2, verbose=False)
        
        devices = []
        for sent, received in ans:
            ip = received.psrc
            mac = received.hwsrc.upper()
            vendor = lookup_mac_vendor(mac)
            
            # Resolve hostname
            try:
                hostname, _, _ = socket.gethostbyaddr(ip)
            except Exception:
                hostname = "unknown"

            devices.append({
                "ip": ip,
                "mac": mac,
                "vendor": vendor,
                "hostname": hostname,
                "status": "online"
            })
        return devices
    except Exception as e:
        logging.error(f"Scapy ARP scan failed (probably permissions): {e}")
        return scan_subnet_fallback()

def scan_subnet_fallback():
    logging.info("Initiating fallback OS ARP scan")
    devices = []
    
    try:
        # Determine OS command
        if sys.platform.startswith("win"):
            # Windows arp -a
            output = subprocess.check_output(["arp", "-a"]).decode("utf-8", errors="ignore")
            pattern = re.compile(r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\s+([0-9a-fA-F-]{17})\s+(\w+)")
            matches = pattern.findall(output)
            for ip, mac_raw, link_type in matches:
                # Format MAC: AA-BB-CC -> AA:BB:CC
                mac = mac_raw.replace("-", ":").upper()
                vendor = lookup_mac_vendor(mac)
                devices.append({
                    "ip": ip,
                    "mac": mac,
                    "vendor": vendor,
                    "hostname": "unknown",
                    "status": "online"
                })
        else:
            # Unix-like arp -a
            output = subprocess.check_output(["arp", "-a"]).decode("utf-8", errors="ignore")
            pattern = re.compile(r"\((.*?)\)\s+at\s+([0-9a-fA-F:]{17})")
            matches = pattern.findall(output)
            for ip, mac in matches:
                mac = mac.upper()
                vendor = lookup_mac_vendor(mac)
                devices.append({
                    "ip": ip,
                    "mac": mac,
                    "vendor": vendor,
                    "hostname": "unknown",
                    "status": "online"
                })
    except Exception as e:
        logging.error(f"Fallback OS ARP scan failed: {e}")
        
    return devices
