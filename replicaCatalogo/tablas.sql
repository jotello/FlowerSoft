CREATE TABLE catalogo(
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(70) NOT NULL,
    nombre VARCHAR(70) NOT NULL,
    descripcion VARCHAR(150) NOT NULL,
    imagen VARCHAR(225) NOT NULL,
    precio INT NOT NULL
);

CREATE TABLE Usuario(
    id INT PRIMARY KEY,
    rut VARCHAR(20) NOT NULL,
    nombre VARCHAR(70) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE Carrito(
    id_usuario INT,
    id_producto INT,
    total INT,
    nombre_producto VARCHAR(70),
    cantidad INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_producto) REFERENCES catalogo(id) 
);

INSERT INTO Usuario (id, rut, nombre, email, password) VALUES (1, '18.297.512-5', 'Max', 
'max@gmail.com', '$2a$10$OXIxBEC8wfQ/dspUT3yDDOM.GDOBWK3j.2oX2L8xZQXY1ZyGMH9Ru');

INSERT INTO Usuario (id, rut, nombre, email, password) VALUES (2, '6.411.539-1', 'Juan', 
'juan@gmail.com', '$2a$10$OXIxBEC8wfQ/dspUT3yDDOM.GDOBWK3j.2oX2L8xZQXY1ZyGMH9Ru');


CREATE TABLE Cambios_Carrito (
	tipo_query 	VARCHAR(10),
    id_carrito INT,
    id_usuario INT,
    id_producto INT,
    total INT,
    nombre_producto VARCHAR(70),
    cantidad INT
);

CREATE TABLE Cambios_Catalogo(
    tipo_query VARCHAR(10),
    id_catalogo INT,
    tipo VARCHAR(70),
    nombre VARCHAR(70),
    descripcion VARCHAR(150),
    imagen VARCHAR(225),
    precio INT
);