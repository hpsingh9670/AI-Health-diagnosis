"""Hospitals router: Nearby hospital search using Overpass API (OpenStreetMap)."""
from fastapi import APIRouter, Query
import requests
import math
from typing import List

router = APIRouter(prefix="/api/hospitals", tags=["Hospitals"])

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate straight-line distance between two GPS coordinates in km."""
    R = 6371  # Earth radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def estimate_travel_time(distance_km: float, mode: str = "car") -> str:
    """Estimate travel time given distance in km."""
    speeds = {"car": 40, "walking": 5}
    speed = speeds.get(mode, 40)
    minutes = (distance_km / speed) * 60
    if minutes < 60:
        return f"{int(minutes)} min"
    return f"{int(minutes // 60)}h {int(minutes % 60)}m"


def query_overpass(lat: float, lon: float, radius: int) -> List[dict]:
    """Query Overpass API for hospitals near given coordinates."""
    query = f"""
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:{radius},{lat},{lon});
      way["amenity"="hospital"](around:{radius},{lat},{lon});
      node["amenity"="clinic"](around:{radius},{lat},{lon});
      node["healthcare"="hospital"](around:{radius},{lat},{lon});
    );
    out center;
    """
    try:
        response = requests.post(OVERPASS_URL, data={"data": query}, timeout=15)
        response.raise_for_status()
        return response.json().get("elements", [])
    except Exception as e:
        print(f"Overpass API error: {e}")
        return []


def build_hospital_list(elements: list, user_lat: float, user_lon: float) -> List[dict]:
    """Build a structured hospital list from Overpass elements."""
    hospitals = []
    for el in elements:
        # Get coordinates
        if el["type"] == "node":
            h_lat, h_lon = el.get("lat"), el.get("lon")
        elif el["type"] == "way":
            center = el.get("center", {})
            h_lat, h_lon = center.get("lat"), center.get("lon")
        else:
            continue

        if not h_lat or not h_lon:
            continue

        tags = el.get("tags", {})
        name = tags.get("name") or tags.get("name:en") or "Hospital"
        if not name or name.lower() == "hospital":
            continue

        distance_km = haversine_distance(user_lat, user_lon, h_lat, h_lon)

        phone = tags.get("phone") or tags.get("contact:phone") or tags.get("telephone") or "N/A"
        emergency = tags.get("emergency") in ["yes", "true", "24/7"]
        website = tags.get("website") or tags.get("contact:website") or ""

        hospitals.append({
            "id": el["id"],
            "name": name,
            "latitude": h_lat,
            "longitude": h_lon,
            "distance_km": round(distance_km, 2),
            "distance_text": f"{round(distance_km, 1)} km",
            "travel_time_car": estimate_travel_time(distance_km, "car"),
            "travel_time_walking": estimate_travel_time(distance_km, "walking"),
            "phone": phone,
            "emergency": emergency,
            "rating": round(3.5 + (distance_km % 1.5), 1),   # Mock rating
            "type": tags.get("healthcare") or tags.get("amenity", "hospital"),
            "website": website,
            "maps_link": f"https://www.google.com/maps/dir/?api=1&destination={h_lat},{h_lon}",
        })

    # Sort by distance
    hospitals.sort(key=lambda x: x["distance_km"])
    return hospitals[:20]


@router.get("/nearby")
def get_nearby_hospitals(
    lat: float = Query(..., description="User latitude"),
    lon: float = Query(..., description="User longitude"),
    radius: int = Query(5000, description="Search radius in meters (max 10000)"),
):
    """
    Find hospitals and clinics near the user's GPS location.
    Uses OpenStreetMap Overpass API — no API key required.
    """
    radius = min(radius, 10000)  # Cap at 10 km
    elements = query_overpass(lat, lon, radius)

    if not elements:
        # Return mock data if Overpass fails (for testing/demo)
        return get_mock_hospitals(lat, lon)

    hospitals = build_hospital_list(elements, lat, lon)

    if not hospitals:
        return get_mock_hospitals(lat, lon)

    return {"hospitals": hospitals, "total": len(hospitals), "source": "OpenStreetMap"}


def get_mock_hospitals(lat: float, lon: float) -> dict:
    """Return mock hospital data when real data is unavailable."""
    mock = [
        {
            "id": 1, "name": "City General Hospital",
            "latitude": lat + 0.01, "longitude": lon + 0.01,
            "distance_km": 1.5, "distance_text": "1.5 km",
            "travel_time_car": "4 min", "travel_time_walking": "18 min",
            "phone": "+91-9876543210", "emergency": True, "rating": 4.2,
            "type": "hospital",
            "maps_link": f"https://www.google.com/maps/dir/?api=1&destination={lat+0.01},{lon+0.01}",
        },
        {
            "id": 2, "name": "Apollo Medical Center",
            "latitude": lat - 0.02, "longitude": lon + 0.015,
            "distance_km": 2.8, "distance_text": "2.8 km",
            "travel_time_car": "7 min", "travel_time_walking": "34 min",
            "phone": "+91-9876543211", "emergency": True, "rating": 4.5,
            "type": "hospital",
            "maps_link": f"https://www.google.com/maps/dir/?api=1&destination={lat-0.02},{lon+0.015}",
        },
        {
            "id": 3, "name": "Community Health Clinic",
            "latitude": lat + 0.025, "longitude": lon - 0.01,
            "distance_km": 3.2, "distance_text": "3.2 km",
            "travel_time_car": "8 min", "travel_time_walking": "38 min",
            "phone": "+91-9876543212", "emergency": False, "rating": 3.9,
            "type": "clinic",
            "maps_link": f"https://www.google.com/maps/dir/?api=1&destination={lat+0.025},{lon-0.01}",
        },
        {
            "id": 4, "name": "Fortis Healthcare",
            "latitude": lat - 0.03, "longitude": lon - 0.02,
            "distance_km": 4.1, "distance_text": "4.1 km",
            "travel_time_car": "10 min", "travel_time_walking": "49 min",
            "phone": "+91-9876543213", "emergency": True, "rating": 4.7,
            "type": "hospital",
            "maps_link": f"https://www.google.com/maps/dir/?api=1&destination={lat-0.03},{lon-0.02}",
        },
    ]
    return {"hospitals": mock, "total": len(mock), "source": "mock"}
