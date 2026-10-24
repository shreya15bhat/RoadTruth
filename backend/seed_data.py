"""
Seed RoadTruth SQLite database with coastal corridor traffic incidents and default accounts.
"""
import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app import app
from backend.models import db, User, Incident, IncidentVerification
from datetime import datetime, timezone, timedelta

def seed_database():
    with app.app_context():
        # 1. Seed demo user accounts
        if not User.query.filter_by(username="commuter").first():
            user1 = User(
                username="commuter",
                email="commuter@routewise.ai",
                role="citizen"
            )
            user1.set_password("password123")
            db.session.add(user1)

        if not User.query.filter_by(username="traffic_authority").first():
            user2 = User(
                username="traffic_authority",
                email="authority@routewise.ai",
                role="traffic_authority",
                badge_number="KA-MNG-408",
                agency="Mangaluru City Traffic Police"
            )
            user2.set_password("password123")
            db.session.add(user2)

        if not User.query.filter_by(username="employer_admin").first():
            user3 = User(
                username="employer_admin",
                email="employer@routewise.ai",
                role="citizen"
            )
            user3.set_password("password123")
            db.session.add(user3)

        # 2. Seed initial incidents if table is empty
        if Incident.query.count() == 0:
            now = datetime.now(timezone.utc)
            incidents_to_create = [
                {
                    "incident_type": "accident",
                    "description": "Multi-vehicle collision on flyover southbound lane. Heavy queue building.",
                    "location_name": "NH-66, Thokkottu Junction, Mangaluru",
                    "latitude": 12.8335,
                    "longitude": 74.8584,
                    "reporter_id": "commuter",
                    "severity": "critical",
                    "verification_status": "verified",
                    "trust_score": 0.95,
                    "baseline_duration_minutes": 28,
                    "estimated_clearance_time": now + timedelta(minutes=30),
                    "created_at": now - timedelta(minutes=28)
                },
                {
                    "incident_type": "roadwork",
                    "description": "Flyover expansion joint repair and asphalt resurfacing. Single file traffic flow.",
                    "location_name": "Kottara Chowki Flyover Underpass, Mangaluru",
                    "latitude": 12.9056,
                    "longitude": 74.8384,
                    "reporter_id": "traffic_authority",
                    "severity": "severe",
                    "verification_status": "verified",
                    "trust_score": 0.98,
                    "baseline_duration_minutes": 18,
                    "estimated_clearance_time": now + timedelta(hours=2),
                    "created_at": now - timedelta(minutes=75)
                },
                {
                    "incident_type": "weather",
                    "description": "Monsoon waterlogging & service road puddle causing 35 min slowdown.",
                    "location_name": "Pumpwell (Mahaveera Circle) Underpass, Mangaluru",
                    "latitude": 12.8622,
                    "longitude": 74.8637,
                    "reporter_id": "commuter",
                    "severity": "critical",
                    "verification_status": "pending",
                    "trust_score": 0.72,
                    "baseline_duration_minutes": 45,
                    "estimated_clearance_time": now + timedelta(minutes=45),
                    "created_at": now - timedelta(minutes=40)
                },
                {
                    "incident_type": "congestion",
                    "description": "Severe peak hour gridlock stretching to Kadri Park junction.",
                    "location_name": "Nanthoor Circle, NH-66 Corridor, Mangaluru",
                    "latitude": 12.8756,
                    "longitude": 74.8628,
                    "reporter_id": "commuter",
                    "severity": "moderate",
                    "verification_status": "verified",
                    "trust_score": 0.88,
                    "baseline_duration_minutes": 22,
                    "estimated_clearance_time": now + timedelta(minutes=25),
                    "created_at": now - timedelta(minutes=15)
                }
            ]

            for data in incidents_to_create:
                inc = Incident(**data)
                db.session.add(inc)

            db.session.commit()
            print(">> Seeded database with initial incidents and demo accounts successfully.")
        else:
            db.session.commit()
            print(">> Database already contains records. User accounts verified.")

if __name__ == "__main__":
    seed_database()
