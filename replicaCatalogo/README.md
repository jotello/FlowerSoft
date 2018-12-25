##FLOWERSOFT - Catalogo Service

Requerimientos para el funcionamiento del servicio:

- instalar xampp desde: https://www.apachefriends.org/es/index.html
- activar apache y mysql
- crear tabla a traves de admin en mysql en el panel de control de xampp con la siguinte estructura:
	- entrar a bd mysql
	- crear tabla con el nombre de catalogo y atributos de tipo, nombre (ambos VARCHAR), id (autoincrement, primary key)y precio (INT)

Para iniciar el servicio:

`npm start` funcionara siempre y cuando este activado mysql y apache en el panel de control de xampp

El servicio esta en localhost:3004

La estructura de un Producto esta dada por:
-------------------------------------------
* id
* nombre
* tipo
* precio
* descripcion
* imagen
