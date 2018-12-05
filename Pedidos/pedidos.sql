DROP DATABASE IF EXISTS pedidos;
CREATE DATABASE pedidos;

\c pedidos;

CREATE TABLE Pedido (
  ID SERIAL PRIMARY KEY,
  total INT,
  detalle VARCHAR,
  fecha_entrega VARCHAR,
  ID_CLIENTE INT,
  nombre_cliente VARCHAR
);

CREATE TABLE Producto(
   ID SERIAL PRIMARY KEY,
   nombre VARCHAR,
   tipo VARCHAR,
   imagen VARCHAR,
   precio INT,
   descripcion VARCHAR
);

CREATE TABLE Usuario(
	ID INT PRIMARY KEY,
	rut VARCHAR,
	nombre VARCHAR,
  apellido VARCHAR,
  rol VARCHAR,
	email VARCHAR,
	password VARCHAR
);

CREATE TABLE PedidoxUsuario(
	ID_PEDIDO INT REFERENCES Pedido(ID) ,
	ID_USUARIO INT REFERENCES Usuario(ID),
	PRIMARY KEY (ID_PEDIDO, ID_USUARIO)
);

CREATE TABLE PedidoxProducto(
	ID_PEDIDO INT REFERENCES Pedido(ID),
	ID_PRODUCTO INT REFERENCES Producto(ID),
	PRIMARY KEY(ID_PEDIDO, ID_PRODUCTO)
);

INSERT INTO Usuario (ID, rut, nombre, apellido, rol, email, password)
  VALUES ('1', '18.297.512-5', 'Max', 'Bombin', 'admin', 'max@gmail.com', '$2a$10$OXIxBEC8wfQ/dspUT3yDDOM.GDOBWK3j.2oX2L8xZQXY1ZyGMH9Ru');

INSERT INTO Usuario (ID, rut, nombre, apellido, rol, email, password)
  VALUES ('2', '6.411.539-1', 'Juan', 'Sanchez', 'cliente', 'juan@gmail.com', '$2a$10$OXIxBEC8wfQ/dspUT3yDDOM.GDOBWK3j.2oX2L8xZQXY1ZyGMH9Ru');
