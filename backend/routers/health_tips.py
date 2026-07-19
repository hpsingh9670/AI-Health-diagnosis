"""Health Tips router: personalized health recommendations."""
from fastapi import APIRouter, Depends
from auth import get_current_user
from typing import List, Optional
import random

router = APIRouter(prefix="/api/health-tips", tags=["Health Tips"])

# Static health tips database (would be personalized with ML in production)
ALL_TIPS = [
    {
        "id": 1, "category": "Hydration", "icon": "💧",
        "title": "Stay Hydrated",
        "content": "Drink 8-10 glasses of water daily. Proper hydration boosts energy, aids digestion, and maintains kidney health.",
        "tags": ["general", "nutrition"],
    },
    {
        "id": 2, "category": "Exercise", "icon": "🏃",
        "title": "Daily Movement",
        "content": "Aim for 30 minutes of moderate exercise 5 days a week. Walking, cycling, or swimming are excellent low-impact options.",
        "tags": ["general", "fitness"],
    },
    {
        "id": 3, "category": "Sleep", "icon": "😴",
        "title": "Quality Sleep",
        "content": "Adults need 7-9 hours of quality sleep per night. Maintain a consistent sleep schedule and avoid screens before bedtime.",
        "tags": ["general", "mental-health"],
    },
    {
        "id": 4, "category": "Nutrition", "icon": "🥗",
        "title": "Balanced Diet",
        "content": "Include a variety of fruits, vegetables, lean proteins, and whole grains. Limit processed foods, sugar, and saturated fats.",
        "tags": ["general", "nutrition"],
    },
    {
        "id": 5, "category": "Mental Health", "icon": "🧘",
        "title": "Stress Management",
        "content": "Practice mindfulness, meditation, or deep breathing for 10-15 minutes daily. Chronic stress weakens immunity and affects heart health.",
        "tags": ["mental-health", "general"],
    },
    {
        "id": 6, "category": "Prevention", "icon": "🩺",
        "title": "Regular Checkups",
        "content": "Schedule annual physical exams and age-appropriate screenings. Early detection saves lives.",
        "tags": ["prevention", "general"],
    },
    {
        "id": 7, "category": "Diabetes", "icon": "🩸",
        "title": "Blood Sugar Management",
        "content": "Monitor blood glucose regularly. Choose low-glycemic foods, stay active, and avoid sugary drinks.",
        "tags": ["diabetes", "chronic"],
    },
    {
        "id": 8, "category": "Heart Health", "icon": "❤️",
        "title": "Heart-Healthy Habits",
        "content": "Reduce sodium intake, quit smoking, exercise regularly, and maintain a healthy weight to protect your heart.",
        "tags": ["heart", "chronic"],
    },
    {
        "id": 9, "category": "Immunity", "icon": "🛡️",
        "title": "Boost Your Immunity",
        "content": "Get adequate sleep, eat immune-boosting foods (citrus, garlic, ginger), exercise, and manage stress.",
        "tags": ["immunity", "general"],
    },
    {
        "id": 10, "category": "Eye Health", "icon": "👁️",
        "title": "Protect Your Vision",
        "content": "Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. Wear UV-protective sunglasses.",
        "tags": ["general", "digital-health"],
    },
    {
        "id": 11, "category": "Hygiene", "icon": "🧼",
        "title": "Hand Hygiene",
        "content": "Wash hands thoroughly for at least 20 seconds with soap and water, especially before eating and after using the restroom.",
        "tags": ["prevention", "hygiene"],
    },
    {
        "id": 12, "category": "Dental Health", "icon": "🦷",
        "title": "Oral Health",
        "content": "Brush teeth twice daily, floss daily, and visit your dentist every 6 months. Poor oral health is linked to heart disease.",
        "tags": ["dental", "general"],
    },
    {
        "id": 13, "category": "Posture", "icon": "🪑",
        "title": "Good Posture",
        "content": "Sit up straight, use ergonomic furniture, and take breaks every 45 minutes if you have a desk job. Stretch regularly.",
        "tags": ["musculoskeletal", "digital-health"],
    },
    {
        "id": 14, "category": "Skin Care", "icon": "☀️",
        "title": "Sun Protection",
        "content": "Use SPF 30+ sunscreen daily, wear protective clothing, and avoid sun exposure between 10 AM and 4 PM.",
        "tags": ["skin", "prevention"],
    },
    {
        "id": 15, "category": "Breathing", "icon": "🫁",
        "title": "Deep Breathing",
        "content": "Practice diaphragmatic breathing: inhale for 4 counts, hold for 4, exhale for 6. This reduces stress and improves lung capacity.",
        "tags": ["mental-health", "respiratory"],
    },
]

SEASONAL_TIPS = {
    "summer": {
        "title": "Beat the Summer Heat",
        "content": "Stay indoors during peak hours (11AM-4PM). Drink ORS solutions if sweating heavily. Wear light, breathable clothing.",
        "icon": "☀️",
    },
    "monsoon": {
        "title": "Monsoon Health Alert",
        "content": "Avoid stagnant water (dengue/malaria risk). Drink boiled water. Keep surroundings clean to prevent waterborne diseases.",
        "icon": "🌧️",
    },
    "winter": {
        "title": "Winter Wellness",
        "content": "Layer up to prevent hypothermia. Stay active indoors. Get your flu vaccination. Vitamin D supplements may be needed.",
        "icon": "❄️",
    },
}


@router.get("/")
def get_health_tips(
    category: str = None,
    current_user: dict = Depends(get_current_user),
):
    """Get health tips, optionally filtered by category."""
    tips = ALL_TIPS
    if category:
        tips = [t for t in tips if category.lower() in [tag.lower() for tag in t["tags"]]]

    # Shuffle for variety
    random.shuffle(tips)
    return {
        "tips": tips[:9],
        "seasonal": random.choice(list(SEASONAL_TIPS.values())),
        "total": len(tips),
    }


@router.get("/categories")
def get_categories():
    """Get all available tip categories."""
    categories = list(set(tag for tip in ALL_TIPS for tag in tip["tags"]))
    return {"categories": sorted(categories)}
