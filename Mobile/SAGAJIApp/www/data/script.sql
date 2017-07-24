PRAGMA encoding = "UTF-8";

DROP TABLE IF EXISTS Credentials;
CREATE TABLE IF NOT EXISTS Credentials (login text primary key, password text, fullname text, email text, perfil text);
CREATE INDEX idx_credentials on Credentials (login);

DROP TABLE IF EXISTS Carteras;
CREATE TABLE IF NOT EXISTS Carteras (login text, cartera text);

DROP TABLE IF EXISTS Clientes;
CREATE TABLE IF NOT EXISTS Clientes (cartera text, nocliente text primary key, nombre text, rfc text, domfiscal text , telefono text, credito real);
CREATE INDEX idx_clients on Clientes (cartera, nocliente);

DROP TABLE IF EXISTS Domicilios;
CREATE TABLE IF NOT EXISTS Domicilios (id integer,nocliente text not null, domentrega text);
CREATE INDEX idx_domicilios on Domicilios (id, nocliente);

DROP TABLE IF EXISTS Productos;
CREATE TABLE IF NOT EXISTS Productos (codigo text primary key collate nocase, descripcion text collate nocase, precio text, unidad text, linea text);
CREATE INDEX idx_products on Productos (codigo, descripcion);

DROP TABLE IF EXISTS Existencias;
CREATE TABLE IF NOT EXISTS Existencias (codigo text, almacen text, existencia integer);
CREATE INDEX idx_products on Existencias (codigo, almacen);

DROP TABLE IF EXISTS Equivalencias;
CREATE TABLE IF NOT EXISTS Equivalencias (codigo text, codigoequiv text );
CREATE INDEX idx_equivalencias on Equivalencias (codigo, codigoequiv);

DROP TABLE IF EXISTS Pedidos;
CREATE TABLE IF NOT EXISTS Pedidos (id text primary key, nocliente text, login text , pedido text, register text, status integer);
CREATE INDEX idx_pedidos on Pedidos (id);

DROP TABLE IF EXISTS Devoluciones;
CREATE TABLE IF NOT EXISTS Devoluciones (nocliente text not null, folio_kepler integer, Status text, Total integer, plazo integer, Fec.Factura integer, Fec.Vencimiento integer);
CREATE INDEX idx_devoluciones on Devoluciones (nocliente, folio_kepler);

.mode csv
.separator "\t"

.import credentials.txt Credentials
select count(*) from Credentials;

.import carteras.txt Carteras
select count(*) from Carteras;

.import clientes.txt Clientes
select count(*) from Clientes;

.import domicilios.txt Domicilios
select count(*) from Domicilios;

.import productos.txt Productos
select count(*) from Productos;

.import existencias.txt Existencias
select count(*) from Existencias;

.import equivalencias.txt Equivalencias
select count(*) from Equivalencias;

.import devoluciones.txt Devoluciones
select count(*) from Devoluciones;


