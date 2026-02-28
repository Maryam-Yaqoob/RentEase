"""
Database migration script to add new columns and tables for Phase 1 enhancements
Run this script to update the database schema without losing existing data
"""

from sqlalchemy import text
from database import engine
import sys


def run_migration():
    """Run database migration"""
    print("🔄 Starting database migration...")
    
    with engine.connect() as conn:
        try:
            # Start transaction
            trans = conn.begin()
            
            # ===== Update properties table =====
            print("📝 Updating properties table...")
            
            # Add new columns to properties table
            migration_queries = [
                # Location fields
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS city VARCHAR(100)",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS state VARCHAR(100)",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS address VARCHAR(255)",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20)",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'USA'",
                
                # Property characteristics
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_type VARCHAR(20)",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS bedrooms INTEGER",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS bathrooms DECIMAL(3,1)",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS area_sqft INTEGER",
                
                # Financial
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS deposit_amount DECIMAL(10,2)",
                
                # Availability
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_from DATE",
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS available_to DATE",
                
                # Metadata
                "ALTER TABLE properties ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP",
                
                # Create indexes for better search performance
                "CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city)",
                "CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state)",
                "CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type)",
                "CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms)",
                "CREATE INDEX IF NOT EXISTS idx_properties_rent_price ON properties(rent_price)",
            ]
            
            for query in migration_queries:
                conn.execute(text(query))
                print(f"✅ Executed: {query[:80]}...")
            
            # ===== Create bookings table =====
            print("\n📝 Creating bookings table...")
            
            create_bookings_table = """
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                tenant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                deposit_paid DECIMAL(10,2) DEFAULT 0,
                status VARCHAR(20) DEFAULT 'pending',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                confirmed_at TIMESTAMP,
                cancelled_at TIMESTAMP,
                CONSTRAINT check_dates CHECK (end_date > start_date),
                CONSTRAINT check_amounts CHECK (total_amount >= 0 AND deposit_paid >= 0)
            )
            """
            conn.execute(text(create_bookings_table))
            print("✅ Created bookings table")
            
            # Create indexes for bookings
            booking_indexes = [
                "CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON bookings(property_id)",
                "CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id)",
                "CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status)",
                "CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date)",
            ]
            
            for query in booking_indexes:
                conn.execute(text(query))
                print(f"✅ Executed: {query[:80]}...")
            
            # ===== Create favorites table =====
            print("\n📝 Creating favorites table...")
            
            create_favorites_table = """
            CREATE TABLE IF NOT EXISTS favorites (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_user_property UNIQUE (user_id, property_id)
            )
            """
            conn.execute(text(create_favorites_table))
            print("✅ Created favorites table")
            
            # Create indexes for favorites
            favorite_indexes = [
                "CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id)",
                "CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id)",
            ]
            
            for query in favorite_indexes:
                conn.execute(text(query))
                print(f"✅ Executed: {query[:80]}...")
            
            # Commit transaction
            trans.commit()
            print("\n✅ Database migration completed successfully!")
            print("\nNew features added:")
            print("  • Enhanced property fields (city, state, bedrooms, bathrooms, etc.)")
            print("  • Booking system with conflict detection")
            print("  • Favorites/wishlist system")
            print("  • Optimized indexes for search performance")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Migration failed: {str(e)}")
            sys.exit(1)


if __name__ == "__main__":
    print("=" * 60)
    print("RentEase Database Migration - Phase 1")
    print("=" * 60)
    
    response = input("\n⚠️  This will modify the database schema. Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        run_migration()
    else:
        print("Migration cancelled.")
