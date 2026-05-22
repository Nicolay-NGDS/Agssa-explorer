# AGSSA Explorer

Aplicacion React para visualizar la arquitectura del ecosistema AGSSA (Arriende Seguro) de forma interactiva y dinamica.

## Proposito

Crear una herramienta visual donde cualquier persona (tecnica o no) pueda entender:
- Los 4 sistemas principales y como se conectan
- Los 6 flujos de negocio
- Las 88 entidades de base de datos
- Las 8 integraciones externas
- Los servicios WCF internos
- Los tipos de polizas (Colectiva vs Individual)
- La infraestructura de servidores

## URLs de Produccion

| Sistema | URL | Tecnologia |
|---------|-----|------------|
| Landing Marketing | https://www.arriendeseguro.com | ASP.NET (IIS 10.0) |
| Portal Inmobiliarias | https://inmobiliarias.arriendeseguro.com | .NET 4.7.2 WebForms |
| Radicacion Individual | https://arriendetranquiloenlinea.com.co | Sistema separado |
| Radicacion via Inmob | Link dinamico generado | .NET 8 MVC (RadicacionEnLinea) |
| Portal Asesores | (interno) | .NET 8 API + Razor |
| AGSSAsura | (interno) | .NET 4.8 WebForms |

**Nota:** arriendeseguro.com usa HubSpot para tracking pero el sitio esta en ASP.NET.

## Stack Tecnologico

| Dependencia | Version | Uso |
|-------------|---------|-----|
| React | 19.2.5 | UI Framework |
| React Router DOM | 7.15.0 | Navegacion (sintaxis v7) |
| React Flow | 11.11.4 | Diagramas interactivos (paquete `reactflow`, NO `@xyflow/react`) |
| Tailwind CSS | 4.3.0 | Estilos (usa @import "tailwindcss") |
| Dagre | @dagrejs/dagre | Auto-layout para grafos |
| Lucide React | 1.14.0 | Iconos |
| Vite | 8.0.10 | Build tool |
| TypeScript | 6.0.2 | Tipado |

## Comandos

```bash
npm run dev      # Desarrollo (puerto 5173)
npm run build    # Build produccion
npm run lint     # Linter
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── diagrams/        # SimpleArchitectureDiagram, ERDiagramView
│   ├── nodes/           # Nodos personalizados React Flow
│   ├── panels/          # Paneles de detalle (NotesPanel, etc.)
│   └── layout/          # Navbar, Layout
├── views/
│   ├── EcosystemView.tsx    # Dashboard con stats y cards de sistemas
│   ├── DiagramView.tsx      # Diagrama de arquitectura (separado)
│   ├── FlowsView.tsx        # Flujos de negocio
│   ├── DataFlowView.tsx     # Flujo de datos Poliza Individual (paso a paso)
│   ├── DatabaseView.tsx     # Entidades de BD + Diagrama ER
│   ├── ModulesView.tsx      # Modulos de AGSSAsura y sus entidades
│   ├── ConceptsView.tsx     # Documentacion conceptual expandible
│   └── IntegrationsView.tsx # Integraciones externas
├── context/
│   └── ThemeContext.tsx    # Tema claro/oscuro con localStorage
├── hooks/
│   └── useArchitecture.ts  # Hook para cargar datos de architecture.json
├── data/
│   └── architecture.json   # Datos de arquitectura AGSSA
├── types/
│   └── architecture.ts     # Tipos TypeScript
├── utils/
│   └── layoutUtils.ts      # Auto-layout con Dagre
└── App.tsx
```

## Rutas Actuales

```
/                       → Redirect a /ecosistema
/ecosistema             → Dashboard con stats y cards de sistemas/BD
/diagrama               → Diagrama de arquitectura (conexiones visuales)
/flujos                 → Lista de flujos de negocio
/flujo-datos            → DataFlowView - Visualizacion del flujo de datos por etapas
/base-datos             → Vista de entidades con diagrama ER
/modulos                → Modulos de AGSSAsura con sus entidades
/conceptos              → Documentacion conceptual (secciones expandibles)
/integraciones          → Servicios externos
```

## Secciones en ConceptsView

La vista de Conceptos tiene las siguientes secciones expandibles:
1. **Arquitectura General** - Los 4 sistemas y como se comunican
2. **Tipos de Polizas** - Colectiva vs Individual (NUEVO)
3. **Bases de Datos** - AGSSA vs RADICACIONES
4. **Servidores y Almacenamiento** - Infraestructura de servidores y AWS S3 (NUEVO)
5. **Sincronizacion de Datos** - Como fluyen datos entre sistemas
6. **Nomenclatura de Codigo** - Convenciones C*, T*, P_*
7. **Ciclo de Vida de la Informacion** - Como se construye el expediente del cliente
8. **Flujos de Negocio** - Los 6 flujos principales
9. **Pagos y Recaudos** - Wompi (estudio) vs SIPRO (poliza)
10. **Motor de Decision** - Analisis de riesgo (manual, no automatico)
11. **Integraciones** - Servicios externos y WCF

## Arquitectura AGSSA (Contexto)

### Sistemas Principales
1. **AGSSAsura** - Sistema central, corazon del ecosistema (.NET 4.8 WebForms)
2. **RadicacionEnLinea** - Radicacion de solicitudes (.NET 8 MVC)
3. **Portal-Asesores** - Dashboard asesores (.NET 8 API + Razor)
4. **LandingInmobiliarias** - Portal inmobiliarias (.NET 4.7.2 WebForms)

### Tipos de Polizas (IMPORTANTE)
- **Poliza Colectiva**: La inmobiliaria tiene UNA poliza, todos sus clientes entran bajo ella
  - Entidad: `CPolizaColectiva`
  - Flujo: LandingInmob → RadicacionEnLinea → AGSSAsura
- **Poliza Individual**: Cada cliente tiene SU propia poliza (sin inmobiliaria)
  - Entidad: `CPolizaIndividual`
  - Flujo: arriendetranquiloenlinea.com.co → AGSSAsura
  - **NOTA**: Este sistema NO esta en nuestros repositorios

### Bases de Datos
- **AGSSA** - 88 entidades, 120+ SPs (usada por todos los sistemas)
- **RADICACIONES** - 23 tablas total (11 del flujo + 12 catalogos)

### BD RADICACIONES - Estructura Completa

**Tablas del Flujo (11):**
| Tabla | Descripcion | Campos principales |
|-------|-------------|-------------------|
| TRadicacione | Tabla central | Id, IdAgssa, IdTipoGarantia, IdEstado, TokenAcceso |
| TInformacionBasica | Inquilino/Codeudor | Identificacion, Nombres, Email, Celular |
| TActividadEconomica | Situacion laboral | IdTipoActividad, Compania, Cargo |
| TReferencia | Referencias personales | IdTipoReferencia, Nombre, Celular |
| TInmueble | Datos inmueble | Canon, Administracion, Direccion, IdCiudad |
| TPropietario | Datos arrendador | Nombres, Identificacion, Email |
| TFacturacion | Facturacion pago | Subtotal, Iva, Total, IdConvenio |
| TPago | Pago Wompi | IdTransaccion, Estado, FirmaWompy |
| TValidacionesIdentidad | Intentos TruValidate | IdMetodo, Completada, Intentos |
| TRepresentanteLegal | Solo si juridica | Nombres, Identificacion (del rep. legal) |
| TCodeudorGarantium | Solo Fiducuenta | Nombre, Email (codeudor de garantia) |

**Tablas de Catalogos (12):**
| Tabla | Valores |
|-------|---------|
| TTipoGarantia | 1=Fianza, 2=Fiducuenta, 3=Sin garantia |
| TTipoEstadoRadicacion | 1=Iniciada ... 6=Sincronizada |
| TTipoInterviniente | 1=Inquilino, 2=Codeudor |
| TTipoPersona | 1=Natural, 2=Juridica |
| TTipoIdentificacion | 1=CC, 2=CE, 3=Pasaporte, 5=NIT |
| TTipoActividadEconomica | 1=Independiente, 2=Pensionado, 3=Empleado, 4=Empresa |
| TTipoInmueble | 1=Apartamento, 2=Casa, 3=Local, etc. |
| TTipoPlanSeguro | 1=Clasico, 2=Global |
| TDestinacionInmueble | 1=Vivienda, 2=Comercio |
| TTipoReferencia | 1=Familiar, 2=Personal |
| TMetodosValidacionIdentidad | 1=OTP, 2=Biometria doc, 3=Selfie, etc. |
| TConvenio | Codigos de descuento activos |

### Backup de Base de Datos (Local)
Copia local del backup de produccion para analisis:
- **Ubicacion:** `BD/` (excluida de git por tamano)
- **Archivo:** `BackUpProdAGSSA_2026-05-07.bak` (~5GB)
- **Formato:** SQL Server backup nativo
- **Para restaurar:** Requiere SQL Server, usar `RESTORE DATABASE`

### Servidores SQL

| Servidor | Ambiente | Base de Datos | Quien lo usa |
|----------|----------|---------------|--------------|
| 10.254.35.16\DEVELOPMENT:1434 | Desarrollo | AGSSA + RADICACIONES | Programadores |
| 57.131.25.62\SQLEXPRESS:1433 | Produccion | AGSSA | AGSSAsura, Portal, Landing |
| 186.31.31.18 | Produccion | RADICACIONES | RadicacionEnLinea |

### AWS S3 (Almacenamiento de Archivos)
NO es base de datos. Guarda: contratos PDF, cedulas, comprobantes, documentos siniestros.

### Flujo de Radicacion
El orden correcto es: **Formulario → Pago ($35,000 Wompi) → Validacion de Identidad**

### Pagos (Dos tipos diferentes)
1. **Pago de Estudio ($35,000)**: Via Wompi en RadicacionEnLinea
2. **Pago de Poliza**: Via SIPRO (sistema de SURA) - requiere VPN, verificacion manual

### Motor de Decision
- **NO es automatico** - lo ejecuta un analista manualmente desde `Analisis_11.aspx`
- Consulta API SURA para lista negra ("riesgo consultable")
- Rango de canon aplicable: $1,500,000 - $8,000,000 (definido en SP `P_ValidarConsultaMD`)
- Resultados: APROBADO / NEGADO / ESTUDIO

### Integraciones Externas
Wompi (pagos estudio), TruValidate (biometria), ZohoSign (firmas), AWS S3 (archivos), MasivApp (SMS), KaizenBlitz, SURA API (lista negra), HubSpot (tracking)

## Fixes Importantes Aplicados

### 1. Tailwind CSS v4 - Dark Mode
Tailwind v4 requiere configuracion explicita para dark mode con clases:
```css
/* src/index.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### 2. React Flow - Contenedor con altura
React Flow necesita un contenedor con altura definida:
```css
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
}
```

### 3. Import correcto de React Flow
Usar `reactflow` (el paquete instalado), NO `@xyflow/react`:
```typescript
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';
```

### 4. Hover sin flickering
Evitar `scale-105` en hover que causa parpadeo. Usar solo cambios de color/shadow.
Tooltips deben ser `position: absolute` para no afectar el tamano del padre.

## Branding

- **Nombre:** Arriende Seguro (antes AGSSA/Prosear SURA)
- **Logo:** favicon.svg con iniciales "AS" y swoosh circular azul (#4A90D9)
- **Titulo pagina:** "Arriende Seguro - Explorer"

## Convenciones de Codigo

- Componentes: PascalCase (SystemNode.tsx)
- Funciones/variables: camelCase
- Tipos: PascalCase con prefijo I para interfaces (ISystem, IFlow)
- Archivos de datos: kebab-case (architecture.json)
- Tailwind: Usar clases utilitarias, evitar CSS custom
- React Flow: Usar nodos custom para cada tipo (system, database, integration, wcf)

## Notas Importantes

- Los 4 repositorios solo manejan el flujo de **Poliza Colectiva** (via inmobiliaria)
- El flujo de **Poliza Individual** (arriendetranquiloenlinea.com.co) es un sistema separado
- AGSSAsura es el "corazon central" - todos los sistemas se conectan a el
- El motor de decision es MANUAL, no automatico
- Los datos de arquitectura vienen de C:\Work\Prosear\Agssa\ARQUITECTURA

## Estado de Vistas (Mayo 2026)

| Vista | Estado | Notas |
|-------|--------|-------|
| EcosystemView | Completa | Dashboard principal con stats |
| DiagramView | Completa | Diagrama arquitectura con React Flow |
| DatabaseView | Completa | Lista + Diagrama ER con todos los campos |
| DataFlowView | Completa | Flujo Poliza Individual paso a paso |
| FlowsView | Completa | 6 flujos de negocio |
| ModulesView | Completa | Modulos AGSSAsura |
| ConceptsView | Completa | 11 secciones expandibles |
| IntegrationsView | Completa | 8 integraciones externas |

### DataFlowView - Detalle
Vista interactiva que muestra el ciclo de vida de datos para **Poliza Individual**:
- **12 etapas detalladas** que coinciden con el stepper real de la pagina:
  - 0: Llenado formulario (memoria) - con **simulador interactivo**
  - 1: Guardar Info General (INSERT BD RADICACIONES)
  - 2: Confirmacion (solo lectura)
  - 3: Datos Facturacion
  - 4: Pago Wompi
  - 5: Validacion Identidad
  - 6: Sync a AGSSA
  - 7: Analisis de Riesgo
  - 8: Generacion Contrato
  - 9: Activacion Poliza
  - 10: Siniestro (si aplica)
  - 11: Renovacion (si aplica)
- **Simulador interactivo** en etapa 0: formulario mini + panel "Memoria del Navegador" que muestra estado React en tiempo real
- Muestra que tablas se crean/modifican en cada etapa
- Indica que campos se llenan en cada paso (nuevo/ya llenado/pendiente)
- Datos completos de BD RADICACIONES (T*) y BD AGSSA (C*)
- Controles: navegacion por pasos + boton Play para auto-reproducir

### ERDiagramView - Mejoras recientes
- Muestra TODOS los campos de cada tabla (antes solo mostraba 6)
- Grupos diferenciados por color: Radicacion (verde), Catalogos (gris)
- Layout con Dagre para auto-posicionamiento
- Scroll interno en nodos con muchos campos

## Historial de Desarrollo

### 2026-05-21 (sesion 2)
- Reestructurado DataFlowView de 8 a 12 etapas para coincidir con stepper real
- Agregado simulador interactivo del formulario en etapa 0:
  - Panel izquierdo: formulario con campos clave (tipo persona, documento, nombres, email, etc.)
  - Panel derecho: "Memoria del Navegador" mostrando estado React en tiempo real
  - Indicadores visuales de que datos NO estan en BD
  - Boton "Continuar" que lleva a etapa de guardado
- Actualizados IDs de etapas en todos los tableSchemas (BD RADICACIONES y BD AGSSA)

### 2026-05-21 (sesion 1)
- Agregadas tablas de catalogos a BD RADICACIONES (12 tablas)
- ERDiagramView ahora muestra todos los campos (sin limite de 6)
- Colores diferenciados para grupo "Catalogos" (gris/slate)

### 2026-05-20
- Creado DataFlowView con flujo completo de Poliza Individual
- Campos completos de todas las tablas T* y C*
- Fix Layout.tsx overflow para scroll

### 2026-05-19
- Commit inicial del proyecto
- Estructura base con React 19 + Vite + Tailwind 4
- Vistas principales implementadas
