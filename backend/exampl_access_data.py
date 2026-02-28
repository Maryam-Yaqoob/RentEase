db = SessionLocal()  # Create connection

# Read data
users = db.query(User).all()

# Use relationships (automatic access)
prop = db.query(Property).first()
landlord = prop.landlord  # No extra query needed!

db.close()  # Close connection