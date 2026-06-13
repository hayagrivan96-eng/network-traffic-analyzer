import requests

COMMON_VENDORS = {
    "00:1A:2B": "TP-Link Technologies",
    "00:2B:3C": "Cisco Systems",
    "34:5E:6F": "Dell Inc.",
    "56:78:9A": "Apple Inc.",
    "78:9A:BC": "Supermicro",
    "90:AB:CD": "Intel Corporation",
    "BC:DE:F0": "Hewlett Packard",
    "D8:3B:BF": "Ubiquiti Networks",
    "FC:FB:FB": "Ubiquiti Networks",
    "48:8F:5A": "Espressif Inc (IoT)"
}

def lookup_mac_vendor(mac_address):
    if not mac_address:
        return "Unknown Vendor"
        
    cleaned_mac = mac_address.replace("-", ":").upper()
    prefix = cleaned_mac[:8] # e.g. "00:1A:2B"
    
    # Try local cache
    if prefix in COMMON_VENDORS:
        return COMMON_VENDORS[prefix]
        
    # Online API fallback (MAC OUI lookup)
    try:
        url = f"https://api.macvendors.com/{cleaned_mac}"
        response = requests.get(url, timeout=2)
        if response.status_code == 200:
            return response.text.strip()
    except Exception:
        pass
        
    return "Unknown Device Vendor"
