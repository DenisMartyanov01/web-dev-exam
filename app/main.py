from flask import render_template, request, session, redirect, url_for, flash, Blueprint
from flask_login import login_required, current_user 
import mysql.connector as connector
from .repository import Repository
from . import db
from functools import wraps
import os
import markdown
import bleach

repository = Repository(db)

bp = Blueprint('main', __name__)

ALLOWED_TAGS = ['a', 'b', 'i', 'u', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li']
ALLOWED_ATTRIBUTES = {'a': ['href', 'title']}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg'}

def check_moderator(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Пожалуйста, войдите в систему', 'error')
            return redirect(url_for('main'))
        if current_user.role < 3:
            return f(*args, **kwargs)
        else:
            flash('У вас недостаточно прав', 'error')
            return redirect(url_for('main'))
    return inner

def check_admin(f):
    @wraps(f)
    def inner(*args, **kwargs):
        if not current_user.is_authenticated:
            flash('Пожалуйста, войдите в систему', 'error')
            return redirect(url_for('main'))
        if current_user.role == 1:
            return f(*args, **kwargs)
        else:
            flash('У вас недостаточно прав', 'error')
            return redirect(url_for('main'))
    return inner


@bp.route('/')
def home():
    return redirect(url_for('main.main', index=0))

@bp.route('/<int:index>')
def main(index):
    data = repository.get_animals_data_by_range(index)
    photos = []
    for i in data:
        photos.append(repository.get_animal_photos(i["id"]))

    return render_template('main.html', title='Пользователи', data = data, photos = photos, index = index)


@bp.route('/<int:animal_id>/show', methods=['GET', 'POST'])
def show(animal_id):
    data = repository.get_animal_by_id(animal_id)
    photos = repository.get_animal_photos(animal_id)
    if current_user.is_authenticated and current_user.role == 3:
        adoptions = repository.get_animal_adoptions_by_user(animal_id, current_user.get_id())
    else:
        adoptions = repository.get_adoptions_by_animal(animal_id)
    data['description'] = markdown.markdown(data['description'])

    can_adopt = True
    if current_user.is_authenticated:
        for i in adoptions:
            if str(i["user_id"]) == str(current_user.get_id()):
                can_adopt = False
                break
    else:
        can_adopt = False

    if request.method == 'POST':
        form = request.form
        try:
            repository.create_adoption(form["contact"], animal_id, current_user.get_id())
            flash('Заявка была создана!', 'success')
            return redirect(url_for('main.show', animal_id = animal_id))
        except connector.errors.DatabaseError:
            flash('Произошла ошибка.', 'error')
            db.connect().rollback()
    return render_template('show.html', data=data, photos=photos, adoptions = adoptions, can_adopt=can_adopt)


@bp.route('/create', methods=['GET', 'POST'])
@login_required
@check_admin
def create():
    if request.method == 'POST':
        form = request.form

        description = bleach.linkify(
            bleach.clean(
                form["description"],
                tags=ALLOWED_TAGS + ['h1', 'h2', 'h3', 'h4', 'pre', 'code', 'blockquote'],
                attributes=ALLOWED_ATTRIBUTES
            )
        )

        try:
            repository.create_animal(form["name"], description, form["age"], form["genus"], form["gender"])
            flash('Животное было успешно добавлено', 'success')
        except connector.errors.DatabaseError:
            flash('Произошла ошибка при создании записи.', 'error')
            db.connect().rollback()

        an = repository.get_animal_by_params(form["name"], description, form["age"], form["genus"], form["gender"])
        if not an:
            flash('Произошла ошибка при создании записи.', 'error')
            db.connect().rollback()
            return render_template('create.html', title='Создание', data=form)


        id = an[0]

        photos = request.files.getlist('photos')  

        for file in photos:
            if file.filename == '':
                flash('Файл не выбран', 'error')
                db.connect().rollback()
                return render_template('create.html', title='Создание', data={})

            if file and allowed_file(file.filename):

                filename = f"{id}_{file.filename[0:255]}"
                save_path = url_for('images', filename = filename)
                file.save(os.path.dirname(os.path.abspath(__file__)) + save_path)
                filename2, file_extension = os.path.splitext(filename)
                repository.create_photo(filename2, file_extension[1:], id)
                flash('Фото загружено!', 'success')
            else:
                flash('Недопустимый формат файла', 'error')
        
        return redirect(url_for('main.show', animal_id = id))

    return render_template('create.html', title='Создание', data={})

@bp.route('/<int:animal_id>/edit', methods=['GET', 'POST'])
@login_required
@check_moderator
def edit(animal_id):
    data = repository.get_animal_by_id(animal_id)
    photos = repository.get_animal_photos(animal_id)

    if request.method == 'POST':
        form = request.form
        description = bleach.linkify(
            bleach.clean(
                form["description"],
                tags=ALLOWED_TAGS + ['h1', 'h2', 'h3', 'h4', 'pre', 'code', 'blockquote'],
                attributes=ALLOWED_ATTRIBUTES
            )
        )
        try: 
            repository.update_animal(animal_id, form["name"], description, form["age"], form["genus"], form["gender"])
            flash('Животное было успешно отредактировано', 'success')
            return redirect(url_for('main.show', animal_id = animal_id))
        except connector.errors.DatabaseError:
            flash('Произошла ошибка при изменении данных.', 'error')
            db.connect().rollback()
    return render_template('edit.html', title='Редактирование', data=data, photos=photos)

@bp.route('/<int:animal_id>/delete', methods=['GET', 'POST'])
@login_required
@check_admin
def delete(animal_id):
    try:
        for photo in repository.get_animal_photos(animal_id):
            save_path = url_for('images', filename = photo)
            os.remove(os.path.dirname(os.path.abspath(__file__)) + save_path)
        
        repository.delete_photos_by_animal(animal_id)
        repository.delete_adoptions_by_animal(animal_id)

        repository.delete_animal(animal_id)
        flash('Животное было успешно удалено', 'success')
    except connector.errors.DatabaseError:
        flash('Произошла ошибка при удалении данных.', 'error')
        db.connect().rollback()
    return redirect(url_for('main'))
        

@bp.route('/<int:animal_id>/accept/<int:adoption_id>', methods=['GET', 'POST'])
@login_required
@check_moderator
def accept(animal_id, adoption_id):
    try:
        repository.reject_adoptions_by_animal(animal_id)
        repository.accept_adoption(adoption_id)
        flash('Заявка принята', 'success')
    except connector.errors.DatabaseError:
        flash('Произошла ошибка.', 'error')
        db.connect().rollback()
    return redirect(url_for('main.show', animal_id = animal_id))

        
  
@bp.route('/<int:animal_id>/reject/<int:adoption_id>', methods=['GET', 'POST'])
@login_required
@check_moderator
def reject(animal_id, adoption_id):
    try:
        repository.reject_adoption(adoption_id)
        flash('Заявка отклонена', 'success')
    except connector.errors.DatabaseError:
        flash('Произошла ошибка.', 'error')
        db.connect().rollback()
    return redirect(url_for('main.show', animal_id = animal_id))

