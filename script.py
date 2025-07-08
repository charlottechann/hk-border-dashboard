import requests
import json
from datetime import datetime

# Test the real-time API endpoints
residents_api = "https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeR.json"
visitors_api = "https://secure1.info.gov.hk/immd/mobileapps/2bb9ae17/data/CPQueueTimeV.json"

print("Testing Hong Kong Immigration Department Real-Time API")
print("=" * 60)

# Test residents API
try:
    response_r = requests.get(residents_api, timeout=10)
    if response_r.status_code == 200:
        residents_data = response_r.json()
        print("✅ RESIDENTS API - Successfully retrieved data")
        print(f"Status Code: {response_r.status_code}")
        print(f"Response Time: {response_r.elapsed.total_seconds():.2f} seconds")
        print(f"Data retrieved at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\nSample Data Structure:")
        print(json.dumps(residents_data, indent=2)[:500] + "..." if len(str(residents_data)) > 500 else json.dumps(residents_data, indent=2))
    else:
        print(f"❌ RESIDENTS API - Failed with status code: {response_r.status_code}")
except Exception as e:
    print(f"❌ RESIDENTS API - Error: {str(e)}")

print("\n" + "=" * 60)

# Test visitors API
try:
    response_v = requests.get(visitors_api, timeout=10)
    if response_v.status_code == 200:
        visitors_data = response_v.json()
        print("✅ VISITORS API - Successfully retrieved data")
        print(f"Status Code: {response_v.status_code}")
        print(f"Response Time: {response_v.elapsed.total_seconds():.2f} seconds")
        print(f"Data retrieved at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("\nSample Data Structure:")
        print(json.dumps(visitors_data, indent=2)[:500] + "..." if len(str(visitors_data)) > 500 else json.dumps(visitors_data, indent=2))
    else:
        print(f"❌ VISITORS API - Failed with status code: {response_v.status_code}")
except Exception as e:
    print(f"❌ VISITORS API - Error: {str(e)}")

# Status code meanings
print("\n" + "=" * 60)
print("STATUS CODE MEANINGS:")
print("0 = Normal (Residents: <15 mins, Visitors: <30 mins)")
print("1 = Busy (Residents: <30 mins, Visitors: <45 mins)")
print("2 = Very Busy (Residents: 30+ mins, Visitors: 45+ mins)")
print("4 = System Under Maintenance")
print("99 = Non Service Hours")

# Control point codes
print("\n" + "=" * 60)
print("CONTROL POINT CODES:")
control_points = {
    "HYW": "Heung Yuen Wai",
    "HZM": "Hong Kong-Zhuhai-Macao Bridge",
    "LMC": "Lok Ma Chau",
    "LSC": "Lok Ma Chau Spur Line",
    "LWS": "Lo Wu",
    "MKT": "Man Kam To",
    "SBC": "Shenzhen Bay",
    "STK": "Sha Tau Kok"
}

for code, name in control_points.items():
    print(f"{code}: {name}")