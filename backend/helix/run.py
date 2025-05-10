from app import app, socketio
from app.auth_routes import auth_bp
app.register_blueprint(auth_bp)


if __name__ == '__main__':
    socketio.run(app, debug=True)
