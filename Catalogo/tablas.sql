DROP TABLE IF EXISTS Carrito;
DROP TABLE IF EXISTS catalogo;

CREATE TABLE catalogo(
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo VARCHAR(70) NOT NULL,
  nombre VARCHAR(70) NOT NULL,
  imagen VARCHAR(200) NOT NULL,
  precio INT NOT NULL,
  descripcion VARCHAR(125)
);

CREATE TABLE Carrito(
  id_producto INT NOT NULL,
  id_usuario INT NOT NULL,
  nombre_producto VARCHAR(70),
  total INT NOT NULL,
  cantidad INT NOT NULL,
  FOREIGN KEY(id_producto) REFERENCES catalogo(id)
);

INSERT INTO catalogo(tipo, nombre, imagen, precio, descripcion)
VALUES ('Arreglo',
  'Arreglo floral de rosas y claveles',
  'http://hablemosdeflores.com/wp-content/uploads/2017/04/significado-de-los-claveles-rosas-7.jpg?fbclid=IwAR1teBXE5AsTY7KjZx2yJuZDZhb7JKfHGrAM1d71GVmlVhAUtfhUPdY24fU',
  '5000',
  'Un hermoso y elegante arreglo floral de rosas y claveles');
