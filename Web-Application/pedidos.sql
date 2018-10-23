DROP DATABASE IF EXISTS pedidos;
CREATE DATABASE pedidos;

\c pedidos;

CREATE TABLE pedido (
  ID SERIAL PRIMARY KEY,
  detalle VARCHAR,
  fecha VARCHAR
);

INSERT INTO pedido (detalle, fecha)
  VALUES ('2 arreglos de 5000', 'Para el 09/09/2019');
