# Requirements Document

## Introduction

Este documento define los requisitos para implementar validación de sesión global en todas las requests de la aplicación y crear una interfaz de listado para settlements y units sold. El sistema debe garantizar que cualquier request valide la sesión activa y redirija a login si no existe, además de proporcionar una interfaz de grid para visualizar settlements y units sold obtenidos desde endpoints específicos de la API.

## Glossary

- **Session Validation**: Proceso de verificar que existe una sesión de usuario válida antes de permitir el acceso a recursos protegidos
- **Auth Token**: Token JWT almacenado que identifica la sesión del usuario autenticado
- **Middleware**: Componente de Next.js que intercepta requests antes de que lleguen a las rutas para validar autenticación
- **Settlements**: Registros de liquidaciones financieras obtenidos del endpoint GET /api/settlements
- **Units Sold**: Registros de unidades vendidas obtenidos del endpoint GET /api/units_solds
- **Grid Component**: Componente de interfaz que muestra datos en formato de tabla o cuadrícula
- **Navigation Menu**: Menú de navegación lateral que contiene enlaces a diferentes secciones de la aplicación
- **Protected Route**: Ruta de la aplicación que requiere autenticación válida para ser accedida
- **API Client**: Cliente HTTP configurado para realizar peticiones al backend con autenticación

## Requirements

### Requirement 1

**User Story:** Como usuario no autenticado, quiero ser redirigido automáticamente a /login cuando intento acceder a cualquier página protegida, para que el sistema me solicite autenticarme

#### Acceptance Criteria

1. WHEN un usuario sin Auth Token válido intenta acceder a cualquier ruta protegida, THE Middleware SHALL redirigir al usuario a la ruta "/login"
2. THE Middleware SHALL verificar la presencia del Auth Token en cada request antes de permitir el acceso
3. THE Middleware SHALL preservar la URL de destino original como parámetro de query "redirect" para redirigir después del login
4. THE Middleware SHALL permitir el acceso a rutas públicas (/login, /signup) sin validación de sesión
5. THE Middleware SHALL permitir el acceso a recursos estáticos (imágenes, CSS, JS) sin validación de sesión

### Requirement 2

**User Story:** Como usuario autenticado, quiero que mi sesión se valide automáticamente en cada request, para mantener mi acceso seguro a la aplicación

#### Acceptance Criteria

1. WHEN un usuario con Auth Token válido realiza una request, THE Middleware SHALL permitir el acceso a la ruta solicitada
2. THE Middleware SHALL verificar que el Auth Token existe en cookies o en el header Authorization
3. IF el Auth Token ha expirado o es inválido, THEN THE Middleware SHALL redirigir al usuario a "/login"
4. THE Middleware SHALL ejecutarse en todas las rutas de la aplicación excepto las rutas públicas definidas

### Requirement 3

**User Story:** Como usuario autenticado, quiero ver opciones "Settlements > List" y "Units Sold > List" en el menú de navegación, para poder acceder a cada lista de manera independiente

#### Acceptance Criteria

1. THE Navigation Menu SHALL incluir un item de menú llamado "Settlements"
2. THE Navigation Menu SHALL mostrar un subitem "List" dentro del item "Settlements"
3. WHEN el usuario hace clic en "Settlements > List", THE Navigation Menu SHALL navegar a la ruta "/settlements/list"
4. THE Navigation Menu SHALL incluir un item de menú separado llamado "Units Sold"
5. THE Navigation Menu SHALL mostrar un subitem "List" dentro del item "Units Sold"
6. WHEN el usuario hace clic en "Units Sold > List", THE Navigation Menu SHALL navegar a la ruta "/units-sold/list"
7. THE Navigation Menu SHALL mostrar ambos items con íconos apropiados
8. THE Navigation Menu SHALL mantener el estado activo/seleccionado según la ruta actual

### Requirement 4

**User Story:** Como usuario autenticado, quiero ver una lista de todos los settlements en formato grid, para visualizar la información de liquidaciones de manera organizada

#### Acceptance Criteria

1. WHEN el usuario accede a la ruta "/settlements/list", THE Grid Component SHALL realizar una petición GET al endpoint "/api/settlements"
2. THE Grid Component SHALL incluir el Auth Token en el header Authorization de la petición
3. WHEN la petición es exitosa, THE Grid Component SHALL mostrar los settlements en un formato de tabla/grid
4. THE Grid Component SHALL mostrar las columnas relevantes de cada settlement (id, fecha, monto, estado, etc.)
5. THE Grid Component SHALL mostrar un estado de carga (skeleton o spinner) mientras se obtienen los datos
6. IF la petición falla, THEN THE Grid Component SHALL mostrar un mensaje de error apropiado

### Requirement 5

**User Story:** Como usuario autenticado, quiero ver una lista de todas las unidades vendidas en formato grid en una página independiente, para visualizar la información de ventas de manera organizada

#### Acceptance Criteria

1. WHEN el usuario accede a la ruta "/units-sold/list", THE Grid Component SHALL realizar una petición GET al endpoint "/api/units_solds"
2. THE Grid Component SHALL incluir el Auth Token en el header Authorization de la petición
3. WHEN la petición es exitosa, THE Grid Component SHALL mostrar las units sold en un formato de tabla/grid
4. THE Grid Component SHALL mostrar las columnas relevantes de cada unit sold (id, producto, cantidad, precio, fecha, etc.)
5. THE Grid Component SHALL mostrar un estado de carga (skeleton o spinner) mientras se obtienen los datos
6. IF la petición falla, THEN THE Grid Component SHALL mostrar un mensaje de error apropiado

### Requirement 6

**User Story:** Como usuario, quiero que settlements y units sold tengan páginas completamente independientes, para poder navegar y visualizar cada tipo de información por separado

#### Acceptance Criteria

1. THE Grid Component SHALL crear una página separada en la ruta "/settlements/list" exclusivamente para settlements
2. THE Grid Component SHALL crear una página separada en la ruta "/units-sold/list" exclusivamente para units sold
3. THE Grid Component SHALL usar componentes de grid reutilizables pero mantener las páginas independientes
4. THE Grid Component SHALL permitir que cada página cargue sus datos de manera independiente sin afectar la otra

### Requirement 7

**User Story:** Como usuario, quiero ver mensajes de error claros cuando falla la carga de datos, para entender qué salió mal

#### Acceptance Criteria

1. IF la petición a "/api/settlements" retorna un error 401, THEN THE Grid Component SHALL redirigir al usuario a "/login"
2. IF la petición a "/api/units_solds" retorna un error 401, THEN THE Grid Component SHALL redirigir al usuario a "/login"
3. IF la petición retorna un error de red, THEN THE Grid Component SHALL mostrar "Error de conexión. Por favor verifica tu conexión a internet"
4. IF la petición retorna un error 500, THEN THE Grid Component SHALL mostrar "Error del servidor. Por favor intenta nuevamente más tarde"
5. THE Grid Component SHALL incluir un botón "Reintentar" cuando ocurre un error para permitir al usuario volver a cargar los datos

### Requirement 8

**User Story:** Como usuario, quiero que la tabla de datos sea responsive y fácil de leer, para poder acceder desde diferentes dispositivos

#### Acceptance Criteria

1. THE Grid Component SHALL adaptar su diseño para pantallas móviles, tablets y desktop
2. THE Grid Component SHALL mantener la legibilidad de los datos en todos los tamaños de pantalla
3. THE Grid Component SHALL permitir scroll horizontal en dispositivos móviles si las columnas no caben en la pantalla
4. THE Grid Component SHALL usar el componente de tabla existente del proyecto para mantener consistencia visual

### Requirement 9

**User Story:** Como desarrollador, quiero que el API Client maneje automáticamente la inclusión del token en todas las requests, para no tener que agregarlo manualmente en cada llamada

#### Acceptance Criteria

1. THE API Client SHALL obtener automáticamente el Auth Token del Session Store antes de cada request
2. THE API Client SHALL incluir el Auth Token en el header "Authorization" con formato "Bearer {token}"
3. IF no existe Auth Token en el Session Store, THEN THE API Client SHALL lanzar un error que resulte en redirección a login
4. THE API Client SHALL manejar respuestas 401 limpiando el Session Store y redirigiendo a login

### Requirement 10

**User Story:** Como usuario autenticado, quiero que mi sesión se mantenga activa mientras uso la aplicación, para no tener que volver a iniciar sesión constantemente

#### Acceptance Criteria

1. THE Middleware SHALL permitir que el Auth Token se mantenga válido durante toda la sesión del usuario
2. THE Middleware SHALL validar el token en cada request pero no forzar re-autenticación si el token es válido
3. WHEN el Auth Token expira naturalmente, THE Middleware SHALL redirigir al usuario a "/login"
4. THE Middleware SHALL preservar la ruta actual como parámetro "redirect" para retornar después del login
