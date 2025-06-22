import click
from flask import current_app
from . import db

@click.command('init-db')
def init_db_command():
    with current_app.open_resource('schema.sql') as f:
        connection = db.connect()
        with connection.cursor() as cursor:
            query = list(map(str.strip, f.read().decode('UTF-8').split(';')))
            for request in query:
                if request:
                    cursor.execute(request)
            connection.commit()
        click.echo('Database has been initialized')
