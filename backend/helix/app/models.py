from app import db

class UserPreference(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), nullable=False)
    preference = db.Column(db.String(500), nullable=False)


class Sequence(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255), nullable=False)
    title = db.Column(db.String(255), nullable=False)  
    content = db.Column(db.Text, nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    name = db.Column(db.String(100))
    profession = db.Column(db.String(100))
    company = db.Column(db.String(100))
    location = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(20))