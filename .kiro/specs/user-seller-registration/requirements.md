# Requirements Document

## Introduction

Este documento define los requisitos para implementar un formulario de registro completo que permite a los usuarios crear una cuenta y asociarla con un seller. El flujo incluye la creación del usuario, autenticación automática, creación del seller asociado, y redirección al dashboard. Este sistema extiende la funcionalidad de autenticación existente para soportar el onboarding completo de nuevos usuarios con sus respectivos sellers.

## Glossary

- **Registration Form**: Formulario de interfaz de usuario que recopila información del usuario y del seller para crear una nueva cuenta
- **User Account**: Cuenta de usuario que contiene credenciales de autenticación (email, password) e información personal (nombre, apellido)
- **Seller**: Entidad de negocio asociada a un usuario que representa un vendedor en la plataforma
- **Auth System**: Sistema de autenticación que maneja login, tokens JWT y sesiones de usuario
- **API Platform**: Servicio backend que proporciona endpoints para crear usuarios, autenticar y crear sellers
- **Auto-Login**: Proceso automático de autenticación después de crear una cuenta exitosamente
- **Dashboard**: Página principal de la aplicación a la que se redirige al usuario después del registro exitoso
- **Form Validation**: Proceso de validación de campos del formulario antes de enviar datos al servidor

## Requirements

### Requirement 1

**User Story:** Como nuevo usuario, quiero registrarme con mi información personal y credenciales, para poder crear una cuenta en la plataforma

#### Acceptance Criteria

1. THE Registration Form SHALL incluir campos para email, password, confirmación de password, nombre y apellido
2. THE Registration Form SHALL validar que el campo email contenga un formato de email válido antes del envío
3. THE Registration Form SHALL validar que el campo password cumpla con los requisitos mínimos de seguridad (mínimo 8 caracteres, al menos una mayúscula, un número)
4. THE Registration Form SHALL validar que el campo de confirmación de password coincida exactamente con el campo password
5. THE Registration Form SHALL validar que los campos nombre y apellido no estén vacíos y contengan solo caracteres alfabéticos
6. WHEN el usuario intenta enviar el formulario con campos inválidos, THE Registration Form SHALL mostrar mensajes de error específicos para cada campo

### Requirement 2

**User Story:** Como nuevo usuario, quiero proporcionar el nombre de mi seller durante el registro, para asociar mi cuenta con mi negocio desde el inicio

#### Acceptance Criteria

1. THE Registration Form SHALL incluir un campo para el nombre del seller
2. THE Registration Form SHALL validar que el campo nombre del seller no esté vacío y tenga al menos 3 caracteres
3. THE Registration Form SHALL validar que el nombre del seller tenga un máximo de 100 caracteres
4. WHEN el usuario intenta enviar el formulario sin nombre de seller, THE Registration Form SHALL mostrar un mensaje de error indicando que este campo es requerido

### Requirement 3

**User Story:** Como nuevo usuario, quiero que mi cuenta se cree automáticamente cuando envío el formulario, para comenzar a usar la plataforma rápidamente

#### Acceptance Criteria

1. WHEN el usuario envía el Registration Form con datos válidos, THE Auth System SHALL enviar una petición POST al endpoint de creación de usuarios del API Platform
2. THE Auth System SHALL enviar los datos del usuario incluyendo email, password, nombre y apellido en el cuerpo de la petición
3. WHEN el API Platform retorna una respuesta exitosa de creación de usuario, THE Auth System SHALL proceder al siguiente paso del flujo de registro
4. IF el API Platform retorna un error de usuario duplicado (email ya existe), THEN THE Registration Form SHALL mostrar el mensaje "Este email ya está registrado"
5. IF el API Platform retorna un error de validación, THEN THE Registration Form SHALL mostrar los mensajes de error específicos retornados por el servidor

### Requirement 4

**User Story:** Como nuevo usuario, quiero ser autenticado automáticamente después de crear mi cuenta, para no tener que iniciar sesión manualmente

#### Acceptance Criteria

1. WHEN el usuario es creado exitosamente en el API Platform, THE Auth System SHALL enviar automáticamente una petición de login con las credenciales proporcionadas
2. WHEN el API Platform retorna un token JWT válido, THE Auth System SHALL almacenar el token en el Session Store
3. THE Auth System SHALL establecer el estado de autenticación como activo después de almacenar el token
4. IF el auto-login falla, THEN THE Auth System SHALL redirigir al usuario a la página de login con un mensaje indicando que debe iniciar sesión manualmente

### Requirement 5

**User Story:** Como nuevo usuario autenticado, quiero que mi seller se cree automáticamente después del login, para tener mi negocio configurado inmediatamente

#### Acceptance Criteria

1. WHEN el usuario es autenticado exitosamente después del registro, THE Auth System SHALL enviar una petición POST al endpoint de creación de sellers del API Platform
2. THE Auth System SHALL incluir el token JWT en el header Authorization de la petición de creación de seller
3. THE Auth System SHALL enviar el nombre del seller proporcionado en el formulario en el cuerpo de la petición
4. WHEN el API Platform retorna una respuesta exitosa de creación de seller, THE Auth System SHALL proceder a redirigir al usuario al Dashboard
5. IF la creación del seller falla, THEN THE Auth System SHALL mostrar un mensaje de error y mantener al usuario autenticado

### Requirement 6

**User Story:** Como nuevo usuario con cuenta y seller creados, quiero ser redirigido automáticamente al dashboard, para comenzar a usar la plataforma inmediatamente

#### Acceptance Criteria

1. WHEN el seller es creado exitosamente, THE Auth System SHALL redirigir al usuario a la ruta "/dashboard"
2. THE Auth System SHALL completar la redirección dentro de 1 segundo después de la creación exitosa del seller
3. WHEN el usuario llega al Dashboard, THE Dashboard SHALL mostrar la información del usuario autenticado y su seller asociado

### Requirement 7

**User Story:** Como usuario, quiero ver indicadores de carga durante el proceso de registro, para saber que el sistema está procesando mi solicitud

#### Acceptance Criteria

1. WHEN el usuario envía el Registration Form, THE Registration Form SHALL mostrar un indicador de carga
2. WHILE el proceso de registro está en progreso, THE Registration Form SHALL deshabilitar el botón de envío
3. THE Registration Form SHALL mostrar mensajes de progreso indicando la etapa actual (creando usuario, iniciando sesión, creando seller)
4. WHEN el proceso de registro se completa, THE Registration Form SHALL ocultar el indicador de carga antes de la redirección

### Requirement 8

**User Story:** Como usuario, quiero ver mensajes de error claros cuando el registro falla, para entender qué salió mal y cómo corregirlo

#### Acceptance Criteria

1. WHEN ocurre un error de red durante el registro, THE Registration Form SHALL mostrar el mensaje "Error de conexión. Por favor verifica tu conexión a internet"
2. WHEN el API Platform retorna un error de servidor (500), THE Registration Form SHALL mostrar el mensaje "Error del servidor. Por favor intenta nuevamente más tarde"
3. WHEN ocurre un error en cualquier etapa del proceso, THE Registration Form SHALL mantener los datos del formulario para que el usuario no tenga que volver a ingresarlos
4. THE Registration Form SHALL limpiar el campo de password y confirmación de password cuando ocurre un error por seguridad
5. THE Registration Form SHALL permitir al usuario reintentar el registro después de un error

### Requirement 9

**User Story:** Como usuario, quiero que mis datos sean validados en tiempo real mientras completo el formulario, para corregir errores antes de enviar

#### Acceptance Criteria

1. WHEN el usuario sale de un campo del formulario (blur event), THE Registration Form SHALL validar ese campo específico
2. WHEN un campo es inválido, THE Registration Form SHALL mostrar el mensaje de error debajo del campo correspondiente
3. WHEN el usuario corrige un campo inválido, THE Registration Form SHALL ocultar el mensaje de error automáticamente
4. THE Registration Form SHALL mostrar un indicador visual (ícono o color) cuando un campo es válido
5. THE Registration Form SHALL deshabilitar el botón de envío mientras existan campos inválidos

### Requirement 10

**User Story:** Como usuario existente, quiero poder navegar a la página de login desde el formulario de registro, para acceder a mi cuenta si ya estoy registrado

#### Acceptance Criteria

1. THE Registration Form SHALL incluir un enlace visible a la página de login
2. THE Registration Form SHALL mostrar el texto "¿Ya tienes una cuenta? Inicia sesión" con el enlace al login
3. WHEN el usuario hace clic en el enlace de login, THE Registration Form SHALL navegar a la ruta "/login" sin perder el estado de la aplicación
