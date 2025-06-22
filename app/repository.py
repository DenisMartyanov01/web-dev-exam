class Repository:
    def __init__(self, db_connector):
        self.db_connector = db_connector

    def get_user_by_id(self, user_id):
        with self.db_connector.connect().cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute('SELECT * FROM user WHERE id = %s', (user_id,))
            user = cursor.fetchone()
        return user
    
    def get_animal_by_id(self, animal_id):
        with self.db_connector.connect().cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute('SELECT * FROM animal WHERE id = %s;', (animal_id,))
            animal = cursor.fetchone()
        return animal

    def get_by_username_and_password(self, username, password):
        with self.db_connector.connect().cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute('SELECT * FROM user WHERE login = %s AND password = SHA2(%s, 256)', (username, password))
            user = cursor.fetchone()
        return user
    
    def get_animals_data_by_range(self, index):
        with self.db_connector.connect().cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute('SELECT *, (SELECT COUNT(*) FROM adoption WHERE animal_id = a.id) as count FROM animal a ORDER BY FIELD(status, \'available\', \'adoption\', \'adopted\'), id DESC LIMIT 5 OFFSET %s;', (index,))
            data = cursor.fetchall()
        return data
    
    def get_animal_photos(self, animal_id):
        with self.db_connector.connect().cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute('SELECT CONCAT(filename, ".", MIME) as filename FROM photo WHERE animal_id = %s;', (animal_id,))
            data = cursor.fetchall()

        photos = []
        for i in data:
            photos.append(i["filename"])

        return photos
    
    def create_animal(self, name, description, age, genus, gender):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('INSERT INTO animal (name, description, age, genus, gender, status) VALUES (%s, %s, %s, %s, %s, "available")', (name, description, age, genus, gender))
            connection.commit()
    
    def update_animal(self, animal_id, name, description, age, genus, gender):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('UPDATE animal SET name=%s, description = %s, age=%s, genus=%s, gender=%s WHERE id = %s',
                            ( name, description, age, genus, gender, animal_id))
            connection.commit()

    def delete_animal(self, animal_id):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM animal WHERE id = %s', (animal_id,))
            connection.commit()

    def delete_photos_by_animal(self, animal_id):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM photo WHERE animal_id = %s', (animal_id,))
            connection.commit()

    def delete_adoptions_by_animal(self, animal_id):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('DELETE FROM adoption WHERE animal_id = %s', (animal_id,))
            connection.commit()

    def get_adoptions_by_animal(self, animal_id):
        connection = self.db_connector.connect()
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute('SELECT adoption.id as id, user_id as user_id, date, status, contact, CONCAT(u.surname, \' \', u.name, \' \', COALESCE(u.middlename, "")) as name FROM adoption JOIN user u on user_id = u.id WHERE animal_id = %s ORDER BY id DESC', (animal_id,))
            data = cursor.fetchall()
        return data
    
    def get_animal_adoptions_by_user(self, animal_id, user_id):
        connection = self.db_connector.connect()
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute('SELECT adoption.id as id, user_id as user_id, date, status, contact, CONCAT(u.surname, \' \', u.name, \' \', COALESCE(u.middlename, "")) as name FROM adoption JOIN user u on user_id = u.id WHERE user_id = %s AND animal_id = %s ORDER BY date', (user_id, animal_id))
            data = cursor.fetchall()
        return data
    
    def reject_adoptions_by_animal(self, animal_id):
        connection = self.db_connector.connect()
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute('UPDATE adoption SET status = \'rejected_adopted\' WHERE animal_id = %s AND status = \'pending\'', (animal_id,))
            connection.commit()

    def reject_adoption(self, adoption_id):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('UPDATE adoption SET status = \"rejected\" WHERE id = %s', (adoption_id,))
            connection.commit()

    def create_adoption(self, contact, animal_id, user_id):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('INSERT INTO adoption (status, contact, animal_id, user_id) VALUES ("pending", %s, %s, %s)', (contact, animal_id, user_id))
            connection.commit()

    def accept_adoption(self, adoption_id):
        connection = self.db_connector.connect()
        with connection.cursor(dictionary=True) as cursor:
            cursor.execute('UPDATE adoption SET status = \'adopted\' WHERE id = %s', (adoption_id,))
            connection.commit()

    def get_animal_by_params(self, name, description, age, genus, gender):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('SELECT * FROM animal WHERE name = %s AND description = %s AND age = %s AND genus = %s AND gender = %s AND status = "available" LIMIT 1', (name, description, age, genus, gender))
            data = cursor.fetchone()
        return data
    
    def create_photo(self, filename, MIME, animal_id):
        connection = self.db_connector.connect()
        with connection.cursor() as cursor:
            cursor.execute('INSERT INTO photo (filename, MIME, animal_id) VALUES(%s, %s, %s)', (filename, MIME, animal_id))
            connection.commit()
    