import json

control_points_details = {
    "HYW": {
        "name": "Heung Yuen Wai",
        "type": "Road",
        "hours": "7:00 AM - 10:00 PM",
        "description": "Newest control point, opened in 2023"
    },
    "HZM": {
        "name": "Hong Kong-Zhuhai-Macao Bridge",
        "type": "Road",
        "hours": "24 hours",
        "description": "Connects to western Pearl River Delta"
    },
    "LMC": {
        "name": "Lok Ma Chau",
        "type": "Road",
        "hours": "24 hours",
        "description": "For vehicles and buses"
    },
    "LSC": {
        "name": "Lok Ma Chau Spur Line",
        "type": "Rail",
        "hours": "6:30 AM - 10:30 PM",
        "description": "High passenger volume rail crossing"
    },
    "LWS": {
        "name": "Lo Wu",
        "type": "Rail",
        "hours": "6:30 AM - 12:00 AM",
        "description": "Major rail crossing, high passenger volume"
    },
    "MKT": {
        "name": "Man Kam To",
        "type": "Road",
        "hours": "7:00 AM - 10:00 PM",
        "description": "Shorter waiting times typically"
    },
    "SBC": {
        "name": "Shenzhen Bay",
        "type": "Road",
        "hours": "6:30 AM - 12:00 AM (passenger), 24 hours (goods)",
        "description": "One of the busiest control points"
    },
    "STK": {
        "name": "Sha Tau Kok",
        "type": "Road",
        "hours": "Suspended",
        "description": "Currently suspended until further notice"
    }
}

# Optional: export metadata to JSON file for frontend use
if __name__ == "__main__":
    with open("control_points_metadata.json", "w", encoding="utf-8") as f:
        json.dump(control_points_details, f, ensure_ascii=False, indent=2)
    print("Control point metadata exported to control_points_metadata.json")
