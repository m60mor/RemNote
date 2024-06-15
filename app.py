import os
from flask import Flask, request, make_response, jsonify, url_for, render_template
from dotenv import load_dotenv
from flask_cors import CORS
from flask_mail import Mail, Message
import psycopg2
from psycopg2 import Error
from itsdangerous import URLSafeTimedSerializer, SignatureExpired


REGISTER = (
    "INSERT INTO USERS (username, password, email, confirmed) VALUES (%s, %s, %s, false)"
)

LOGIN = (
    "SELECT id FROM users WHERE email=%s and username=%s and password=%s;"
)

CONFIRM_REGISTER = (
    "UPDATE USERS SET confirmed=true WHERE email=%s"
)

LIST_USERS = (
    "SELECT * FROM users;"
)

ADD_USER = (
    "INSERT INTO users (username, password, email, date_created, confirmed) VALUES (%s, %s, %s, %s, false);"
)

DELETE_USER = (
    "DELETE FROM users WHERE id = %s;"
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

EDIT_NOTE = (
    "UPDATE notes SET title = %s, content = %s, date_remind = %s WHERE user_id = %s and note_id = %s"
)

load_dotenv()
url = os.getenv("DATABASE_URL")
connection = psycopg2.connect(dbname="db_remnote", user="postgres", password="1234", host=url, port=5432)

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_USERNAME'] = ''
    app.config['MAIL_PASSWORD'] = ''
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USE_TLS'] = False
    CORS(app)

    server_email = ''
    # app.config.from_mapping(
    #     SECRET_KEY='dev',
    #     # DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    # )

    # if test_config is None:
    # else:
    #     app.config.from_mapping(test_config)
    #
    # try:
    #     os.makedirs(app.instance_path)
    # except OSError:
    #     pass

    app.config.from_pyfile('config.cfg')
    mail = Mail(app)
    s = URLSafeTimedSerializer('SecretKey')

    def _build_cors_preflight_response():
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "*")
        response.headers.add("Access-Control-Allow-Methods", "*")
        return response

    def _corsify_actual_response(response):
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response

    @app.route('/')
    def home():
        return 'a'

    @app.get('/users')
    def get_users():
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(LIST_USERS)
                data = cursor.fetchall()
        return data

    @app.post('/register')
    def register_user():
        data = request.get_json()
        if "username" in data and "email" in data and "password" in data:
            username = data["username"]
            password = data["password"]
            email = data["email"]
            token = s.dumps(email, salt='email-confirm')
            link = url_for('confirm_email', token=token, _external=True)
            html_content = render_template('confirmation_email.html', link=link)
            msg = Message('Confirm email', sender=server_email, recipients=[email], html=html_content)
            try:
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(REGISTER, (username, password, email))
                mail.send(msg)
                return jsonify({'message': 'Added user, confirmation email sent!'}), 200
            except Error as e:
                return jsonify({'message': str(e)}), 400
        else:
            return jsonify({'message': 'Missing values in request'}), 400

        return jsonify({'message': 'Invalid username or password'}), 401

    @app.get('/confirm_email/<token>')
    def confirm_email(token):
        try:
            email = s.loads(token, salt='email-confirm', max_age=300)
        except SignatureExpired:
            return '<h1>Token expired<h1>'
        try:
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(CONFIRM_REGISTER, (email, ))
            return jsonify({'message': 'Confirmed User!'}), 200
        except Error as e:
            return jsonify({'message': str(e)}), 400

    @app.post('/login')
    def login_user():
        data = request.get_json()
        if "username" in data and "email" in data and "password" in data:
            username = data["username"]
            password = data["password"]
            email = data["email"]
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(LOGIN, (email, username, password))
                    ret_data = cursor.fetchall()
            if ret_data:
                return ret_data
        else:
            return jsonify({'message': 'Missing values in request'}), 400

        return jsonify({'message': 'Invalid username or password'}), 401

    @app.post('/users/add')
    def add_user():
        data = request.get_json()
        if "username" in data and "email" in data and "password" in data and "date_created" in data:
            username = data["username"]
            password = data["password"]
            email = data["email"]
            date_created = data["date_created"]
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(ADD_USER, (username, password, email, date_created))
            return data
        else:
            return jsonify({'message': 'Missing values in request'}), 400

    @app.delete('/users/delete')
    def delete_user():
        data = request.get_json()
        if "id" in data:
            user_id = data["id"]
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(DELETE_USER, (user_id,))
            return data
        else:
            return jsonify({'message': 'Missing values in request'}), 400

    # NOTES
    @app.get('/notes/user')
    def get_notes():
        if request.headers.get('User-Id') is not None:
            user_id = request.headers.get('User-Id')
            with connection:
                with connection.cursor() as cursor:
                    cursor.execute(LIST_NOTES_USER, (user_id,))
                    data = cursor.fetchall()
            return data
        else:
            return jsonify({'Message': 'Missing token in header'}), 401

    @app.post('/notes/add')
    def add_note():
        if request.headers.get('User-Id') is not None:
            user_id = request.headers.get('User-Id')
            data = request.get_json()
            if "title" in data and "content" in data and "date_added" in data and "date_remind" in data:
                title = data["title"]
                content = data["content"]
                date_added = data["date_added"]
                date_remind = data["date_remind"]
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(ADD_NOTE, (user_id, title, content, date_added, date_remind))
                return data
            else:
                return jsonify({'message': 'Missing values in request'}), 400
        else:
            return jsonify({'Message': 'Missing token in header'}), 401

    @app.delete('/notes/delete')
    def delete_note():
        if request.headers.get('User-Id') is not None:
            user_id = request.headers.get('User-Id')
            data = request.get_json()
            if "note_id" in data:
                note_id = data["note_id"]
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(DELETE_NOTE, (user_id, note_id))
                return data
            else:
                return jsonify({'message': 'Missing values in request'}), 400
        else:
            return jsonify({'Message': 'Missing token in header'}), 401

    @app.put('/notes/edit')
    def change_note():
        if request.headers.get('User-Id') is not None:
            user_id = request.headers.get('User-Id')
            data = request.get_json()
            if "title" in data and "content" in data and "date_remind" in data:
                note_id = data["note_id"]
                title = data["title"]
                content = data["content"]
                date_remind = data["date_remind"]
                with connection:
                    with connection.cursor() as cursor:
                        cursor.execute(EDIT_NOTE, (title, content, date_remind, user_id, note_id))
                return data
            else:
                return jsonify({'message': 'Missing values in request'}), 400
        else:
            return jsonify({'Message': 'Missing token in header'}), 401

    @app.route('/hello')
    def hello():
        return 'Hello, World!'

    return app


# if __name__ == '__main__':
#     print("A")

