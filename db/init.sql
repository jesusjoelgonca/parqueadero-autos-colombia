-- Parqueadero Autos Colombia - SQLite
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    cedula TEXT,
    telefono TEXT,
    email TEXT,
    login TEXT UNIQUE,
    password_hash TEXT,
    rol TEXT CHECK(rol IN ('Propietario','Operador','Administrador')) DEFAULT 'Propietario',
    fecha_registro TEXT DEFAULT (datetime('now','localtime')),
    activo INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS vehiculo (
    id_vehiculo INTEGER PRIMARY KEY AUTOINCREMENT,
    placa TEXT NOT NULL UNIQUE,
    tipo_vehiculo TEXT CHECK(tipo_vehiculo IN ('Carro','Moto')) NOT NULL,
    marca TEXT,
    color TEXT,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS celda (
    id_celda INTEGER PRIMARY KEY AUTOINCREMENT,
    numero_celda TEXT NOT NULL UNIQUE,
    tipo_celda TEXT CHECK(tipo_celda IN ('Carro','Moto')) NOT NULL,
    estado TEXT CHECK(estado IN ('Disponible','Ocupada','Inactiva')) DEFAULT 'Disponible'
);

CREATE TABLE IF NOT EXISTS registro_entrada_salida (
    id_registro INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_entrada TEXT NOT NULL,
    hora_entrada TEXT NOT NULL,
    fecha_salida TEXT,
    hora_salida TEXT,
    tiempo_permanencia TEXT,
    id_vehiculo INTEGER NOT NULL,
    id_celda INTEGER NOT NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculo(id_vehiculo),
    FOREIGN KEY (id_celda) REFERENCES celda(id_celda)
);

CREATE INDEX IF NOT EXISTS idx_registro_fecha_salida ON registro_entrada_salida(fecha_salida);
CREATE INDEX IF NOT EXISTS idx_vehiculo_placa ON vehiculo(placa);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_cedula ON usuario(cedula) WHERE cedula IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuario_email ON usuario(email) WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS log_auditoria (
    id_auditoria INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha_hora TEXT DEFAULT (datetime('now','localtime')),
    accion TEXT NOT NULL,
    id_usuario_afectado INTEGER,
    id_usuario_actor INTEGER NOT NULL,
    detalles TEXT,
    FOREIGN KEY (id_usuario_afectado) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_usuario_actor) REFERENCES usuario(id_usuario)
);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON log_auditoria(fecha_hora);

-- Seed: operador y administrador - password_hash se asigna en database.ts
INSERT OR IGNORE INTO usuario (nombre, cedula, email, login, password_hash, rol) 
VALUES ('Operador', '1000000', 'operador@autoscolombia.com', 'operador', NULL, 'Operador');
INSERT OR IGNORE INTO usuario (nombre, cedula, email, login, password_hash, rol) 
VALUES ('Administrador', '2000000', 'admin@autoscolombia.com', 'admin', NULL, 'Administrador');

-- Celdas ejemplo: A1-A6 (Carro), B1-B6 (Moto)
INSERT OR IGNORE INTO celda (numero_celda, tipo_celda) VALUES ('A1','Carro'),('A2','Carro'),('A3','Carro'),('A4','Carro'),('A5','Carro'),('A6','Carro');
INSERT OR IGNORE INTO celda (numero_celda, tipo_celda) VALUES ('B1','Moto'),('B2','Moto'),('B3','Moto'),('B4','Moto'),('B5','Moto'),('B6','Moto');
