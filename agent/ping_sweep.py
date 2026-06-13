import subprocess
import sys
import threading
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

def ping_host(ip):
    try:
        if sys.platform.startswith("win"):
            # Windows ping -n 1 -w 500
            subprocess.run(["ping", "-n", "1", "-w", "500", ip], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        else:
            # Linux ping -c 1 -W 1
            subprocess.run(["ping", "-c", "1", "-W", "1", ip], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def run_ping_sweep(subnet="192.168.1.0/24"):
    logging.info(f"Starting ping sweep on subnet: {subnet}")
    
    # Extract subnet prefix (handles /24 only for simple sweeps)
    parts = subnet.split(".")
    if len(parts) < 3:
        logging.error("Invalid subnet format. Only /24 subnets are currently supported.")
        return
        
    prefix = f"{parts[0]}.{parts[1]}.{parts[2]}."
    
    threads = []
    # Sweep IPs 1-254
    for i in range(1, 255):
        ip = f"{prefix}{i}"
        t = threading.Thread(target=ping_host, args=(ip,))
        t.start()
        threads.append(t)
        
    for t in threads:
        t.join()
        
    logging.info("Ping sweep complete.")
