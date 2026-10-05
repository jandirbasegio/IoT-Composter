CREATE DATABASE IF NOT EXISTS db_composteira
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE db_composteira;

CREATE TABLE IF NOT EXISTS leituras_sensores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  temperatura_ambiente DECIMAL(5,2) NOT NULL,
  umidade_ambiente DECIMAL(5,2) NOT NULL,
  temperatura_composteira DECIMAL(5,2) NOT NULL,
  gas_amonia_raw INT NOT NULL,
  data_hora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_data_hora (data_hora)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS dispositivos_alertas (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  expo_token VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_expo_token (expo_token)
) ENGINE=InnoDB;
