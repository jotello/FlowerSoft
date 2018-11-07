DROP DATABASE IF EXISTS pedidos;
CREATE DATABASE pedidos;

\c pedidos;

CREATE TABLE pedido (
  ID SERIAL PRIMARY KEY,
  total INT,
  detalle VARCHAR,
  fecha_entrega VARCHAR,
  ID_CLIENTE INT, 
  nombre_cliente VARCHAR
);

INSERT INTO pedido (total, detalle, fecha_entrega, ID_CLIENTE, nombre_cliente)
  VALUES (10000, '2 arreglos de 5000', 'Para el 09/09/2019', 1, 'Rosa Llanos');
