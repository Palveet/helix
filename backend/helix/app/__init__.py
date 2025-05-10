from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('config.Config')
CORS(app)
db = SQLAlchemy(app)
socketio = SocketIO(
    app, 
    cors_allowed_origins="*",
    async_mode='eventlet',  # Use eventlet for better performance
    ping_timeout=10,
    ping_interval=5,
    logger=True,
    engineio_logger=True
) 

from app import routes, models, auth_routes