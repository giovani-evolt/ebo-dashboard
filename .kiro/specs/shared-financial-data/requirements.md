# Requirements Document

## Introduction

Este documento define los requisitos para implementar un sistema de compartición de datos entre los componentes FinancialInformation y OverviewCardsGroup en el dashboard. Actualmente, ambos componentes realizan llamadas API separadas para obtener información financiera similar, lo que resulta en duplicación de peticiones y posible inconsistencia de datos. La solución debe permitir que ambos componentes accedan a los mismos datos de manera segura y confiable, donde OverviewCardsGroup utilice el último mes de los datos obtenidos por FinancialInformation.

## Glossary

- **Dashboard Page**: La página principal del dashboard ubicada en `src/app/dashboard/page.tsx`
- **FinancialInformation Component**: Componente que muestra un gráfico con información financiera mensual (gross, taxes, freight & shipping, discounts)
- **OverviewCardsGroup Component**: Componente que muestra tarjetas de resumen con métricas financieras agregadas
- **Financial Data**: Datos financieros que incluyen gross sales, taxes, freight & shipping, y discounts organizados por mes
- **API Client**: Cliente HTTP configurado en `src/lib/api-client.ts` para realizar peticiones al backend
- **Server Component**: Componente de React que se ejecuta en el servidor en Next.js
- **Client Component**: Componente de React que se ejecuta en el navegador, marcado con "use client"

## Requirements

### Requirement 1

**User Story:** Como desarrollador, quiero que los datos financieros se obtengan una sola vez cuando se carga el dashboard, para evitar peticiones duplicadas al backend y mejorar el rendimiento.

#### Acceptance Criteria

1. WHEN THE Dashboard Page se renderiza, THE Dashboard Page SHALL ejecutar una única petición HTTP para obtener los datos financieros completos
2. THE Dashboard Page SHALL pasar los datos financieros obtenidos a los componentes hijos que los necesiten
3. THE Dashboard Page SHALL manejar el estado de carga mientras se obtienen los datos financieros
4. IF la petición de datos financieros falla, THEN THE Dashboard Page SHALL manejar el error de manera apropiada y mostrar un mensaje al usuario

### Requirement 2

**User Story:** Como desarrollador, quiero que OverviewCardsGroup utilice el último mes de los datos financieros obtenidos, para mostrar métricas actualizadas y consistentes con el gráfico de FinancialInformation.

#### Acceptance Criteria

1. THE OverviewCardsGroup Component SHALL recibir los datos financieros completos como prop
2. THE OverviewCardsGroup Component SHALL extraer los valores del último mes disponible de los datos financieros
3. THE OverviewCardsGroup Component SHALL calcular y mostrar el valor total de gross sales del último mes
4. THE OverviewCardsGroup Component SHALL calcular y mostrar el valor total de taxes del último mes
5. THE OverviewCardsGroup Component SHALL calcular y mostrar el valor total de freight & shipping del último mes
6. THE OverviewCardsGroup Component SHALL calcular y mostrar el valor total de discounts del último mes

### Requirement 3

**User Story:** Como desarrollador, quiero que FinancialInformation reciba los datos como prop en lugar de obtenerlos internamente, para eliminar la duplicación de lógica de fetching y mantener una única fuente de verdad.

#### Acceptance Criteria

1. THE FinancialInformation Component SHALL recibir los datos financieros completos como prop
2. THE FinancialInformation Component SHALL eliminar la lógica interna de fetching de datos
3. THE FinancialInformation Component SHALL mantener su funcionalidad actual de visualización de gráficos
4. THE FinancialInformation Component SHALL mostrar un estado de carga mientras los datos no estén disponibles

### Requirement 4

**User Story:** Como usuario del dashboard, quiero que los datos mostrados en las tarjetas de resumen y el gráfico financiero sean consistentes entre sí, para tener confianza en la información presentada.

#### Acceptance Criteria

1. THE Dashboard Page SHALL garantizar que ambos componentes reciban exactamente los mismos datos financieros
2. THE OverviewCardsGroup Component SHALL mostrar valores que correspondan al último mes visible en THE FinancialInformation Component
3. WHEN los datos financieros se actualizan, THE Dashboard Page SHALL propagar los cambios a ambos componentes simultáneamente

### Requirement 5

**User Story:** Como desarrollador, quiero que el manejo de errores sea robusto y consistente, para proporcionar una buena experiencia de usuario incluso cuando ocurran fallos.

#### Acceptance Criteria

1. IF la petición de datos financieros falla, THEN THE Dashboard Page SHALL mostrar un mensaje de error apropiado
2. THE Dashboard Page SHALL permitir al usuario reintentar la carga de datos después de un error
3. THE OverviewCardsGroup Component SHALL mostrar un estado de skeleton mientras espera los datos
4. THE FinancialInformation Component SHALL mostrar un estado de skeleton mientras espera los datos
5. IF los datos recibidos están vacíos o son inválidos, THEN THE Dashboard Page SHALL manejar esta situación sin causar errores de renderizado
