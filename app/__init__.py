from flask import Flask, session, request, send_from_directory
from .db import DBConnector
from flask_login import current_user 

db = DBConnector()

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_pyfile('config.py', silent=False)
    if test_config:
        app.config.from_mapping(test_config)

    db.init_app(app)

    from .cli import init_db_command
    app.cli.add_command(init_db_command)

    from . import auth
    app.register_blueprint(auth.bp)
    auth.login_manager.init_app(app)

    from . import main
    app.register_blueprint(main.bp, url_prefix='/main')
    app.route('/', endpoint='main')(main.home)

    @app.route('/images/<filename>')
    def images(filename):
        return send_from_directory('images', filename)
    return app