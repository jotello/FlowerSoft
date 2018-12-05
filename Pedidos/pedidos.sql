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
	ID SERIAL PRIMARY KEY,
	rut VARCHAR,
	nombre VARCHAR,
	email VARCHAR,
	password VARCHAR
);

CREATE TABLE PedidoxUsuario(
	ID_PEDIDO INT REFERENCES Pedido(ID) ,
	ID_USUARIO INT REFERENCES Usuario(ID),
  fecha_pedido datetime default CURRENT_TIMESTAMP, 
	PRIMARY KEY (ID_PEDIDO, ID_USUARIO)
);

CREATE TABLE PedidoxProducto(
	ID_PEDIDO INT REFERENCES Pedido(ID),
	ID_PRODUCTO INT REFERENCES Producto(ID),
  total int,
  cantidad int, 
  nombre_producto VARCHAR, 
	PRIMARY KEY(ID_PEDIDO, ID_PRODUCTO)
);

INSERT INTO Usuario (rut, nombre, email, password)
  VALUES ('19241676-0', 'Beatriz Sanchez', 'bsanchez@gmail.com', 'holamundo123');



