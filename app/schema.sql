

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS animal;
DROP TABLE IF EXISTS photo;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS adoption;

CREATE TABLE animal (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  description VARCHAR(255) NOT NULL,
  age INT NOT NULL,
  genus VARCHAR(45) NOT NULL,
  gender VARCHAR(45) NOT NULL,
  status VARCHAR(45) NOT NULL,
  PRIMARY KEY (id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  description VARCHAR(225) NOT NULL,
  PRIMARY KEY (id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


CREATE TABLE user (
  id INT NOT NULL AUTO_INCREMENT,
  login VARCHAR(255) NOT NULL,
  password VARCHAR(256) NOT NULL,
  surname VARCHAR(45) NOT NULL,
  name VARCHAR(45) NOT NULL,
  middlename VARCHAR(45) NULL DEFAULT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX role_id (role_id ASC) VISIBLE,
  CONSTRAINT user_ibfk_1
    FOREIGN KEY (role_id)
    REFERENCES role (id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


CREATE TABLE adoption (
  id INT NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL DEFAULT(CURDATE()),
  status VARCHAR(45) NOT NULL,
  contact VARCHAR(45) NOT NULL,
  animal_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX animal_id (animal_id ASC) VISIBLE,
  INDEX fk_adoption_user1_idx (user_id ASC) VISIBLE,
  CONSTRAINT adoption_ibfk_1
    FOREIGN KEY (animal_id)
    REFERENCES animal (id),
  CONSTRAINT fk_adoption_user1
    FOREIGN KEY (user_id)
    REFERENCES user (id)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;


CREATE TABLE photo (
  id INT NOT NULL AUTO_INCREMENT,
  filename VARCHAR(255) NOT NULL,
  MIME VARCHAR(45) NOT NULL,
  animal_id INT NOT NULL,
  PRIMARY KEY (id),
  INDEX animal_id (animal_id ASC) VISIBLE,
  CONSTRAINT photo_ibfk_1
    FOREIGN KEY (animal_id)
    REFERENCES animal (id))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO role (name, description) VALUES 
('admin', 'Администратор системы с полными правами'),
('moderator', 'Модератор с ограниченными правами'),
('user', 'Обычный пользователь');

INSERT INTO user (login, password, surname, name, middlename, role_id) VALUES 
('admin1', SHA2('123', 256), 'Иванов', 'Иван', 'Иванович', 1),
('moder1', SHA2('123', 256), 'Петров', 'Петр', 'Петрович', 2),
('user1', SHA2('123', 256), 'Сидоров', 'Сергей', NULL, 3),
('user2', SHA2('123', 256), 'Кузнецов', 'Алексей', 'Дмитриевич', 3),
('user3', SHA2('123', 256), 'Смирнова', 'Ольга', 'Игоревна', 3),
('user4', SHA2('123', 256), 'Васильев', 'Дмитрий', NULL, 3),
('user5', SHA2('123', 256), 'Николаева', 'Елена', 'Сергеевна', 3),
('user6', SHA2('123', 256), 'Федоров', 'Михаил', 'Александрович', 3),
('user7', SHA2('123', 256), 'Алексеева', 'Анна', NULL, 3),
('user8', SHA2('123', 256), 'Дмитриев', 'Артем', 'Владимирович', 3);

INSERT INTO animal (name, description, age, genus, gender, status) VALUES 
('Барсик', 'Дружелюбный кот, любит играть с мячиком', 12, 'Кот', 'Мужской', 'available'),
('Рекс', 'Спокойная собака, хорошо ладит с детьми', 24, 'Собака', 'Женский', 'available'),
('Зефир', 'Игривый щенок, любит бегать', 11, 'Собака', 'Мужской', 'adopted'),
('Луна', 'Ласковая кошка, приучена к лотку', 23, 'Кот', 'Женский', 'adoption'),
('Гром', 'Большой добрый пес, охраняет дом', 15, 'Собака', 'Мужской', 'available'),
('Чак', 'Маленький котенок, очень активный', 10, 'Кот', 'Мужской', 'available'),
('Тучка ', 'Спокойная взрослая кошка', 36, 'Кот', 'Женский', 'available'),
('Оскар', 'Молодая собака, обучена командам', 32, 'Собака', 'Женский', 'adopted'),
('Молли', 'Кот с красивыми глазами, любит спать', 34, 'Кот', 'Мужской', 'available'),
('Тор', 'Маленькая собака, подходит для квартиры', 23, 'Собака', 'Женский', 'adoption');

INSERT INTO `photo` VALUES 
(1,'1_cat1','jpg',1),
(2,'2_dog1','jpg',2),
(3,'3_puppy1','jpg',3),
(4,'4_cat2','jpg',4),
(5,'5_dog2','jpg',5),
(6,'6_kitten1','jpg',6),
(7,'7_cat3','jpg',7),
(8,'8_dog3','jpg',8),
(9,'9_cat4','jpg',9),
(10,'10_dog4','jpg',10),
(11,'1_cat2','jpg',1);


INSERT INTO adoption (status, contact, animal_id, user_id) VALUES 
('rejected_adopted ','ivanov@mail.com',3,4),
('pending ','petrov@mail.com',4,5),
('rejected_adopted ','sidorov@mail.com',8,6),
('pending ','kuznetsov@mail.com',10,7),
('pending ','smirnova@mail.com',10,8),
('acccepted ','kuznetsov@mail.com',3,9),
('pending ','smirnova@mail.com',4,10),
('acccepted ','alexeeva@mail.com',8,6);