-- MySQL dump 10.13  Distrib 8.0.19, for osx10.14 (x86_64)
--
-- Host: 127.0.0.1    Database: world
-- ------------------------------------------------------
-- Server version	8.0.19-debug

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @old_autocommit=@@autocommit;

--
-- Current Database: `world`
--

/*!40000 DROP DATABASE IF EXISTS `world`*/;

CREATE DATABASE `coches` DEFAULT CHARACTER SET utf8mb4;

USE `coches`;

-- Crear una tabla llamada "Coches" para almacenar información de coches
CREATE TABLE coche (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Marca VARCHAR(50),
    Modelo VARCHAR(50),
    Any INT,
    Color VARCHAR(20),
    Precio INT
);

-- Insertar algunos datos de ejemplo
INSERT INTO coche (Marca, Modelo, Any, Color, Precio)
VALUES ('Toyota', 'Corolla', 2020, 'Rojo', 18000);

INSERT INTO coche (Marca, Modelo, any, Color, Precio)
VALUES ('Honda', 'Civic', 2019, 'Azul', 17000);

INSERT INTO coche (Marca, Modelo, Any, Color, Precio)
VALUES ('Ford', 'F-150', 2021, 'Negro', 28000);
