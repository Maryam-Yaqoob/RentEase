"""
Seed script to populate database with sample data.
Run this after database initialization to test the application.

Usage:
    python seed_data.py
"""

from database import SessionLocal, init_db
from models.user import User, UserRole
from models.property import Property, PropertyStatus
from models.application import Application, ApplicationStatus
from utils.jwt_handler import hash_password


def seed_data():
    """Populate database with sample data"""
    
    # Initialize database tables
    print("Initializing database...")
    init_db()
    
    # Create database session
    db = SessionLocal()
    
    try:
        print("Seeding data...")
        
        # Create sample users
        print("Creating users...")
        
        # Landlords
        landlord1 = User(
            full_name="Jane Smith",
            email="landlord1@test.com",
            password_hash=hash_password("password123"),
            role=UserRole.LANDLORD
        )
        
        landlord2 = User(
            full_name="Mike Johnson",
            email="landlord2@test.com",
            password_hash=hash_password("password123"),
            role=UserRole.LANDLORD
        )
        
        # Tenants
        tenant1 = User(
            full_name="John Doe",
            email="tenant1@test.com",
            password_hash=hash_password("password123"),
            role=UserRole.TENANT
        )
        
        tenant2 = User(
            full_name="Sarah Williams",
            email="tenant2@test.com",
            password_hash=hash_password("password123"),
            role=UserRole.TENANT
        )
        
        db.add_all([landlord1, landlord2, tenant1, tenant2])
        db.commit()
        db.refresh(landlord1)
        db.refresh(landlord2)
        db.refresh(tenant1)
        db.refresh(tenant2)
        
        print(f"✓ Created {landlord1.full_name} (Landlord)")
        print(f"✓ Created {landlord2.full_name} (Landlord)")
        print(f"✓ Created {tenant1.full_name} (Tenant)")
        print(f"✓ Created {tenant2.full_name} (Tenant)")
        
        # Create sample properties
        print("\nCreating properties...")
        
        properties = [
            Property(
                landlord_id=landlord1.id,
                title="Modern 2BR Apartment Downtown",
                description="Stunning 2-bedroom apartment in the heart of downtown. Features include hardwood floors, stainless steel appliances, and floor-to-ceiling windows with city views.",
                rent_price=1200.00,
                location="New York, NY",
                status=PropertyStatus.AVAILABLE
            ),
            Property(
                landlord_id=landlord1.id,
                title="Cozy Studio Near Campus",
                description="Perfect for students! Cozy studio apartment within walking distance to university. Includes utilities and WiFi.",
                rent_price=850.00,
                location="Boston, MA",
                status=PropertyStatus.AVAILABLE
            ),
            Property(
                landlord_id=landlord1.id,
                title="Luxury Penthouse Suite",
                description="Exclusive penthouse with panoramic views, private terrace, and state-of-the-art amenities. Premium living at its finest.",
                rent_price=2500.00,
                location="San Francisco, CA",
                status=PropertyStatus.AVAILABLE
            ),
            Property(
                landlord_id=landlord2.id,
                title="Family Home in Suburbs",
                description="Spacious 3-bedroom house with large backyard, perfect for families. Quiet neighborhood with excellent schools nearby.",
                rent_price=1800.00,
                location="Austin, TX",
                status=PropertyStatus.AVAILABLE
            ),
            Property(
                landlord_id=landlord2.id,
                title="Beach House with Ocean View",
                description="Wake up to the sound of waves! Beautiful beach house with direct ocean access, 2 bedrooms, modern kitchen.",
                rent_price=2200.00,
                location="Miami, FL",
                status=PropertyStatus.AVAILABLE
            ),
            Property(
                landlord_id=landlord2.id,
                title="Downtown Loft",
                description="Industrial-style loft in converted warehouse. High ceilings, exposed brick, and modern finishes.",
                rent_price=1500.00,
                location="Seattle, WA",
                status=PropertyStatus.OCCUPIED
            ),
        ]
        
        db.add_all(properties)
        db.commit()
        
        for prop in properties:
            db.refresh(prop)
            print(f"✓ Created property: {prop.title} (${prop.rent_price}/mo)")
        
        # Create sample applications
        print("\nCreating applications...")
        
        applications = [
            Application(
                property_id=properties[0].id,
                tenant_id=tenant1.id,
                message="I'm very interested in this apartment. I work downtown and this location is perfect for me. I have excellent references and stable employment.",
                status=ApplicationStatus.PENDING
            ),
            Application(
                property_id=properties[1].id,
                tenant_id=tenant1.id,
                message="As a graduate student, this studio is ideal for my needs. I'm quiet, responsible, and take great care of my living space.",
                status=ApplicationStatus.APPROVED
            ),
            Application(
                property_id=properties[3].id,
                tenant_id=tenant2.id,
                message="My family and I are relocating to Austin. We have two children and are looking for a safe, family-friendly home. We're non-smokers with no pets.",
                status=ApplicationStatus.PENDING
            ),
            Application(
                property_id=properties[4].id,
                tenant_id=tenant2.id,
                message="I work remotely and would love to live by the beach. I can provide proof of income and references from previous landlords.",
                status=ApplicationStatus.REJECTED
            ),
        ]
        
        db.add_all(applications)
        db.commit()
        
        for app in applications:
            print(f"✓ Created application: Tenant {app.tenant_id} → Property {app.property_id} ({app.status.value})")
        
        print("\n" + "="*60)
        print("✅ Database seeded successfully!")
        print("="*60)
        
        print("\n📝 Sample Login Credentials:")
        print("\nLandlords:")
        print("  Email: landlord1@test.com | Password: password123")
        print("  Email: landlord2@test.com | Password: password123")
        print("\nTenants:")
        print("  Email: tenant1@test.com | Password: password123")
        print("  Email: tenant2@test.com | Password: password123")
        
        print("\n📊 Database Summary:")
        print(f"  Users: {db.query(User).count()}")
        print(f"  Properties: {db.query(Property).count()}")
        print(f"  Applications: {db.query(Application).count()}")
        
    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
