from functools import wraps
from flask import Blueprint, request, render_template, url_for, flash, redirect, session
from flask_login import LoginManager, UserMixin, current_user, login_user, logout_user, login_required
from .repository import Repository
from . import db

repostiory = Repository(db)

bp = Blueprint('auth', __name__, url_prefix='/auth')

login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = 'Авторизируйтесь для доступа'
login_manager.login_message_category = 'warning'

class User(UserMixin):
    def __init__(self, user_id, user_name, role):
        self.id = user_id
        self.login = user_name
        self.role = role

    def get_id(self):
        return super().get_id()

@login_manager.user_loader
def load_user(user_id):
    user = repostiory.get_user_by_id(user_id)
    if user is not None:
        return User(user_id, user['login'], user["role_id"])
    return None

@bp.route('/login', methods=['POST', 'GET'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main'))
    
    if request.method == 'POST':
        login_input = request.form.get('login')
        password_input = request.form.get('password')
        remember_me = request.form.get('remember_me') == 'on'
        if login_input and password_input:
            user = repostiory.get_by_username_and_password(login_input, password_input)
            
            if user is not None:
                login_user(User(user['id'], user['login'], user["role_id"]), remember=remember_me)
                flash('Вы успешно авторизовались', 'success')
                if request.args.get('next'):
                    return redirect(request.args['next'])
                return redirect(url_for('main'))
            flash('Не удалось войти. Неверный логин или пароль.', 'warning')
            return render_template('auth/login.html', title='Войти')
    return render_template('auth/login.html', title='Войти')

@bp.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('main'))
