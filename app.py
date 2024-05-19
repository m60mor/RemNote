import os
from flask import Flask, request
from dotenv import load_dotenv
import psycopg2


LIST_USERS = (
    "SELECT * FROM users;"
)

ADD_USER = (
    "INSERT INTO users (username, password, email, date_created) VALUES (%s, %s, %s, %s);"
)

DELETE_USER = (
    "DELETE FROM users WHERE id = %s"
)

LIST_NOTES_USER = (
    "SELECT * FROM notes where user_id = %s;"
)

ADD_NOTE = (
    "INSERT INTO notes (user_id, title, content, date_added, date_remind) VALUES (%s, %s, %s, %s, %s);"
)

DELETE_NOTE = (
    "DELETE FROM notes WHERE user_id = %s and note_id = %s;"
)

load_dotenv()
url = os.getenv("DATABASE_URL")
connection = psycopg2.connect(dbname="db_remnote", user="postgres", password="1234", host=url, port=5432)

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        # DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/')
    def home():
        return 'a'

    # USERS
    @app.get('/users')
    def get_users():
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(LIST_USERS)
                data = cursor.fetchall()
        return data

    @app.post('/users/add')
    def add_user():
        data = request.get_json()
        username = data["username"]
        password = data["password"]
        email = data["email"]
        date_created = data["date_created"]
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(ADD_USER, (username, password, email, date_created))
        return data

    @app.delete('/users/delete')
    def delete_user():
        data = request.get_json()
        user_id = data["id"]
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(DELETE_USER, user_id)
        return data

    # NOTES
    @app.get('/notes/user')
    def get_notes():
        user_id = request.args.get("id")
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(LIST_NOTES_USER, user_id)
                data = cursor.fetchall()
        return data

    @app.post('/notes/add')
    def add_note():
        data = request.get_json()
        user_id= data["user_id"]
        title = data["title"]
        content = data["content"]
        date_added = data["date_added"]
        date_remind = data["date_remind"]
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(ADD_NOTE, (user_id, title, content, date_added, date_remind))
        return data

    @app.delete('/notes/delete')
    def delete_note():
        data = request.get_json()
        note_id = data["id"]
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(DELETE_NOTE, note_id)
        return data

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    return app


# if __name__ == '__main__':
#     print("A")

