# Minimercado - Sistema de Gestión

Bienvenido al sistema de gestión del minimercado. Esta aplicación te permite administrar de forma sencilla todas las operaciones diarias del negocio, desde el control de inventario hasta las ventas, clientes, proveedores y usuarios del sistema.

## Frontend Realizado por :
Michael Franco

## ¿Qué hace esta aplicación?

El sistema está diseñado para centralizar la información del minimercado y facilitar el trabajo del personal. Permite llevar un registro organizado de productos, ventas, clientes, proveedores y movimientos de caja, además de gestionar el acceso de los usuarios mediante roles y permisos.

## ¿Cómo ingresar?

Antes de usar el sistema, debes iniciar sesión con tu usuario y contraseña. Solo las personas autorizadas pueden acceder a las diferentes secciones del sistema.

## Secciones principales

### Dashboard
Es la pantalla de inicio al ingresar. Muestra un resumen general del negocio:
- Ventas recientes
- Productos con bajo stock
- Accesos al sistema
- Alertas importantes
- Resumen de ventas, productos activos, clientes y otros indicadores clave

Desde aquí puedes acceder rápidamente a cualquier sección del sistema.

### Productos
Permite gestionar el catálogo de productos del minimercado:
- Crear, editar y eliminar productos
- Ver el stock disponible y el estado de cada producto
- Buscar y filtrar productos por categoría o estado
- Visualizar el precio de venta y costo

### Clientes
Administra la información de los clientes:
- Registrar nuevos clientes con nombre, documento, teléfono y correo
- Editar o eliminar clientes existentes
- Consultar el historial de compras de cada cliente
- Mantener organizada la base de datos de clientes

### Proveedores
Gestiona la información de los proveedores:
- Registrar proveedores con nombre, documento, teléfono, correo y dirección
- Editar o eliminar proveedores
- Ver la lista completa de proveedores ordenada por nombre

### Ventas
Registra las ventas diarias del minimercado:
- Crear nuevas ventas seleccionando productos y cantidades
- Aplicar descuentos y calcular el total automáticamente
- Visualizar el historial de ventas realizadas
- Ver el detalle de cada venta, incluyendo productos, cantidades, precios y subtotales
- Consultar las ventas por fecha

### Caja
Controla los movimientos de dinero del negocio:
- Abrir y cerrar caja
- Registrar ingresos y egresos con descripción y monto
- Ver el historial de movimientos
- Controlar el saldo actual en caja

### Inventario
Administra el stock de productos:
- Ver el movimiento de inventario (entradas y salidas)
- Filtrar por producto, tipo de movimiento o motivo
- Consultar el stock actual y los movimientos registrados
- Identificar productos con bajo stock

### Reportes
Genera reportes visuales del negocio:
- Ver ventas por periodo con gráficos
- Consultar el stock actual de productos
- Analizar porcentajes de ventas por método de pago
- Visualizar resúmenes de performance del negocio

## Seguridad y usuarios

El sistema incluye un módulo de seguridad para controlar quiénes pueden acceder a cada funcionalidad:

### Roles
Los roles definen grupos de permisos para diferentes tipos de usuarios:
- Crear roles con nombres y descripciones
- Asignar permisos específicos a cada rol (por ejemplo: ver dashboard, gestionar productos, administrar usuarios, etc.)
- Activar o desactivar roles
- Editar y eliminar roles existentes

### Usuarios
Cada persona que usa el sistema tiene un usuario con un rol asignado:
- Crear usuarios con nombre, correo, contraseña y rol
- Editar información de usuarios
- Activar o desactivar usuarios
- Asignar el rol correspondiente a cada usuario

Solo los usuarios con los permisos adecuados pueden acceder a cada sección del sistema.

## Características principales

- Interfaz intuitiva y fácil de usar
- Navegación lateral para acceder rápidamente a todas las secciones
- Formularios claros para registrar y editar información
- Mensajes de confirmación y error para guiar al usuario
- Diseño adaptable a diferentes tamaños de pantalla
- Control de acceso mediante roles y permisos

## Requisitos

Para usar esta aplicación necesitas:
- Un navegador web moderno (Chrome, Firefox, Edge, etc.)
- Credenciales de acceso proporcionadas por el administrador del sistema

## Soporte

Si tienes dudas sobre el funcionamiento del sistema, contacta al administrador o al área de soporte técnico.

## Repositorio del Backend

El código del backend de este sistema se encuentra en el siguiente repositorio:

- **Repositorio Backend:** [https://github.com/Redrovan/minimercado-ups-backend.git](https://github.com/Redrovan/minimercado-ups-backend.git)

En este repositorio podrás encontrar la API, la configuración del servidor, la base de datos y toda la lógica del lado del servidor que alimenta esta aplicación frontend.
