# Parqueadero Autos Colombia

Sistema de información para la gestión de entradas, salidas y consultas de vehículos en el parqueadero **Autos Colombia**.

---

## Objetivo de la actividad

Aplicar los conceptos aprendidos en Ingeniería de Software en la realización del sistema de información del parqueadero "Autos Colombia".

---

## Descripción del proyecto

Aplicación web que permite a operadores y administradores:

- **Registrar entrada** de vehículos (carro o moto), asignando celda disponible.
- **Registrar salida** y calcular tiempo de permanencia.
- **Consultar vehículos estacionados** con filtro por tipo y paginación.
- **Buscar un vehículo por placa** para ver si está en el parqueadero.
- **Ver historial** de entradas y salidas con filtros por fechas y placa (acceso administrador).

La base de datos se inicializa con celdas tipo Carro (A1–A6) y tipo Moto (B1–B6). Las motos pueden usar también celdas de carro.

---

## Tecnologías

- **Backend:** Node.js, Express 5, TypeScript
- **Vistas:** EJS (motor de plantillas)
- **Base de datos:** SQLite (better-sqlite3)
- **Estilos:** Bootstrap 5
- **Sesiones:** express-session
- **Autenticación:** login con usuario/contraseña (bcryptjs)

---

## Estructura del proyecto (MVC)

El proyecto está organizado según el patrón **Modelo-Vista-Controlador (MVC)**:

```
parqueadero-autos-colombia/
├── db/
│   └── init.sql              # Esquema y datos iniciales (celdas, usuarios)
├── src/
│   ├── config/
│   │   └── database.ts       # Conexión SQLite e inicialización
│   ├── models/               # MODELO – acceso a datos
│   │   ├── Usuario.ts
│   │   ├── Vehiculo.ts
│   │   ├── Celda.ts
│   │   └── RegistroEntradaSalida.ts
│   ├── controllers/          # CONTROLADOR – lógica de negocio y respuesta
│   │   ├── authController.ts
│   │   ├── entradaController.ts
│   │   ├── salidaController.ts
│   │   ├── estacionadosController.ts
│   │   ├── busquedaController.ts
│   │   └── historialController.ts
│   ├── routes/               # Rutas (enlazan URL → controlador)
│   ├── middleware/
│   │   └── auth.ts           # Protección de rutas (operador/admin)
│   ├── types/
│   │   └── index.ts          # Tipos TypeScript
│   └── app.ts                # Entrada de la aplicación
├── views/                    # VISTA – plantillas EJS (MVC)
│   ├── partials/             # header, nav, footer
│   ├── auth/                 # login
│   ├── entrada/              # registrar entrada
│   ├── salida/               # registrar salida
│   ├── estacionados/         # listado con filtros y paginación
│   ├── busqueda/             # buscar por placa
│   └── historial/            # historial (admin)
├── package.json
├── tsconfig.json
└── README.md
```

Las **rutas** (`src/routes/`) reciben la petición y delegan en el **controlador** correspondiente; el controlador usa los **modelos** para acceder a los datos y devuelve la **vista** (plantilla EJS) con la respuesta.

---

## Cómo ejecutar

### Requisitos

- Node.js (v18 o superior recomendado)
- npm

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará en **http://localhost:3000** (o el puerto definido en `.env`). La base de datos SQLite se crea/actualiza al arrancar usando `db/init.sql`.

### Producción

```bash
npm run build
npm start
```

---

## Credenciales por defecto

| Rol           | Usuario   | Contraseña  |
|---------------|-----------|-------------|
| Operador      | operador  | operador123 |
| Administrador | admin     | admin123    |

El **Historial** solo es accesible para el usuario con rol Administrador.

---

## Licencia

ISC (según `package.json`).
