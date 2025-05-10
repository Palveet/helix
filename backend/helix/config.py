class Config:
    # SQLALCHEMY_DATABASE_URI = 'sqlite:///helix.db'  # Simple local SQLite DB
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:palveet@localhost/helix_db'

