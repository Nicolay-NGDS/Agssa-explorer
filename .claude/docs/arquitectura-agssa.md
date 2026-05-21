# Arquitectura AGSSA - Referencia Completa

Este documento contiene el resumen de la arquitectura del ecosistema AGSSA para referencia rapida.

## 1. Sistemas Principales

### AGSSAsura (Sistema Central)
- **Tecnologia:** .NET Framework 4.8, ASP.NET WebForms
- **Rama:** develop
- **Base de Datos:** AGSSA (10.254.35.16\DEVELOPMENT)
- **Arquitectura:** N-capas (DAL, Modelo.Entidades, Modelo.Negocio, DST.AGSSA)
- **Archivos clave:**
  - `DAL/DAO.cs` (661KB) - Data Access Layer
  - `Modelo.Negocio/MNegocio.cs` (154KB) - Logica de negocio
  - 60+ paginas .aspx
- **Modulos:** Cotizaciones, Analisis, Contratos, Siniestros, Renovaciones, Caja
- **Integraciones:** ZohoSign, AWS S3, SURA, KaizenBlitz

### RadicacionEnLinea
- **Tecnologia:** .NET 8, ASP.NET Core MVC, EF Core 9
- **Rama:** feature/24022026-forms
- **Base de Datos:** RADICACIONES (186.31.31.18)
- **Controllers:** Home, ValidacionIdentidad, FacturacionPago, ApiWompi, FinalTransaccion, RegistroCodeudor, LinksPersonalizados, GestionLinks, Inmobiliaria, Health
- **Integraciones:** TruValidate, Wompi, MasivApp (SMS)

### Portal-Asesores
- **Tecnologia:** .NET 8, ASP.NET Core API + Razor Pages
- **Rama:** feature/D-00009_V1
- **Base de Datos:** AGSSA
- **Endpoints API:**
  - `api/asesores` - Autenticacion + OTP
  - `api/cotizaciones` - Calculo de primas
  - `api/dashboard` - Solicitudes por fecha
  - `api/solicitudes` - Listar y detalles
  - `api/renovaciones` - Renovaciones
  - `api/reportes` - PDFs
- **Autenticacion:** OTP email (6 digitos, 5 min) + JWT (4 horas)

### LandingInmobiliarias
- **Tecnologia:** .NET Framework 4.7.2, ASP.NET WebForms
- **Rama:** feature/D14042026LinkRadicacion
- **Base de Datos:** AGSSA (57.131.25.62\SQLEXPRESS)
- **Paginas:** Login, Descargas, Consulta, Detalles, LinksRadicacion, Recover
- **Patron:** Singleton para Data Access

## 2. Bases de Datos

### BD AGSSA (88 Entidades)
**Entidades de Personas:**
CArrendador, CArrendatario, CCodeudor, CApoderado, CConyugue, CRepresentanteLegal

**Entidades de Negocio:**
CSolicitudes (centro), CContrato, CCotizacion, CRenovacion, CSiniestro, CAnalisis

**Entidades de Propiedad:**
CInmueble, CDirecciones, CInmobiliaria

**Entidades Financieras:**
CCaja, T_Pagos, CComprobantePago, CPolizaIndividual, CPolizaColectiva

**Entidades de Configuracion:**
CTipoDocumento, CTipoPersona, CTipoCiudades, CTipoConcepto, CParametros, CRol, CUsuario

### BD RADICACIONES (11 Tablas)
TRadicacione, TInformacionBasica, TInmueble, TPropietario, TFacturacion, TPago, TConvenio, TAsesore, TInmobiliarium, TValidacionesIdentidad, TCodeudorGarantium

### Stored Procedures Principales (120+)
- **Solicitudes:** P_CrearSolicitud, P_ListarSolicitud, P_ActualizarSolicitud7, P_LanzarSolicitud
- **Contratos:** P_Contratos13Load/Guardar, P_ContratoVivienda, P_ContratoComercio
- **Analisis:** P_CrearAnalisisSolicitud, P_EmitirResultadoAnalisis, P_ValidarConsultaMD
- **Polizas:** P_Poliza14Load/GuardarCrear/Editar/Renovar/Cancelar
- **Siniestros:** P_ListarInfoSiniestros_P27, P_GuardarInfoSiniestro, P_CerrarSiniestro
- **Renovaciones:** P_RenovacionesGrilla1, P_ActualizarRenovacion, P_RenovacionCotizador
- **Caja:** P_CrearCaja, P_ActualizarCaja, P_InsertarComprobantePago, P_InsertarReciboPago

## 3. Flujos de Negocio

### 3.1 Flujo de Radicacion (Principal)
1. Inmobiliaria genera link (LandingInmobiliarias - P_GenerarLinksInmobiliarias)
2. Arrendatario accede (RadicacionEnLinea - LinksPersonalizadosController)
3. Completa formulario (HomeController.Index)
4. Valida identidad (ValidacionIdentidadController - TruValidate API)
5. Paga estudio (FacturacionPagoController - Wompi API)
6. Webhook pago (ApiWompiController)
7. Crea solicitud (CrearSolicitudAGSSA - WCF)
8. Motor Decision (MotorDecisionService)
9. Confirmacion SMS (MasivApp)

### 3.2 Flujo de Analisis de Riesgo
1. Motor Decision ejecuta (automatico)
2. Asigna analista (P_AsignarAutoAnalista)
3. Analista revisa (P10_AsignarAnalista.aspx)
4. Consulta centrales (P_ValidarConsultaMD)
5. Emite concepto: APROBADO, RECHAZADO, APLAZADO (P11_ResultadoAnalisis.aspx)
6. Notifica asesor (Email automatico)

### 3.3 Flujo de Contrato
1. Asigna ejecutivo (P_AsignarEjecutivoP12)
2. Carga datos (P13_ContratoDetalle.aspx)
3. Genera documento (P_ContratoVivienda/Comercio)
4. Envia a ZohoSign (sign.zoho.com API)
5. Firman partes (Propietario, Arrendatario, Codeudor)
6. Webhook firma
7. Almacena (AWS S3)
8. Crea poliza (P14_PolizaDetalle.aspx)
9. Asocia riesgo SURA

**Estados:** PENDIENTE, EN_ELABORACION, ENVIADO_FIRMA, FIRMADO, ACTIVO

### 3.4 Flujo de Cotizacion
1. Asesor ingresa datos (CotizacionService.Calcular)
2. Parametros: Canon, Administracion, Vigencia, Plan, Destinacion, Asistencia, Danos
3. Planes: Clasico, Plus, Basico, Concesion
4. Salida: Prima Canvas, Prima Admin, Prima Servicios, Prima Asistencia, Prima Danos
5. Genera PDF (PdfService.GenerarPdf)

### 3.5 Flujo de Siniestro
1. Reporta siniestro (F=ReporteSiniestro - LandingInmobiliarias)
2. Crea registro (P_MarcarSolicitudReclamacion)
3. Asigna ejecutivo (P_AsignarSiniestroP23)
4. Revisa caso (P25_InfoSiniestro.aspx)
5. Documenta (Fecha, monto, documentos)
6. Procesa indemnizacion (P_InsertarIndemnizacion)
7. Cierra (P_CerrarSiniestro)

**Estados:** ABIERTO, EN_ESTUDIO, APROBADO, RECHAZADO, CERRADO

### 3.6 Flujo de Renovacion
1. Detecta proximas a vencer (P_RenovacionesANotificar)
2. Notifica asesor (Email)
3. Contacta cliente
4. Confirma (Nuevo canon/admin)
5. Cotiza (P_RenovacionCotizador)
6. Genera PDF (P_RenovacionesInfoPDF)
7. Actualiza (P_ActualizarRenovacion)
8. Emite nueva poliza (P_Poliza14Renovar)

**SubEstados:** PENDIENTE, CONTACTANDO, CONFIRMADA, COTIZADA, PAGADA, RENOVADA, NO_RENUEVA

## 4. Integraciones Externas

| Servicio | Uso | Endpoint | Sistema |
|----------|-----|----------|---------|
| Wompi | Pagos en linea | https://sandbox.wompi.co/v1 | RadicacionEnLinea |
| TruValidate | Validacion biometrica | https://www.transuniondecisioncentre.com.mx/TU.DE.PONT_LATAM/ | RadicacionEnLinea |
| ZohoSign | Firma digital | https://sign.zoho.com/api/v1 | AGSSAsura |
| AWS S3 | Almacenamiento docs | Credenciales en config | AGSSAsura |
| MasivApp | SMS/Notificaciones | https://api-sms.masivapp.com/send-message | RadicacionEnLinea |
| KaizenBlitz | Analytics/SRS | https://api.kaizenblitz.io/v1/analytics/srs | AGSSAsura |
| SURA | Seguros | https://cotizador.sura.com/regulacion/secureCommand/validarriesgosmodulos | AGSSAsura |
| HubSpot | Leads/Marketing | Formularios | Varios |

## 5. Servicios WCF Internos

| Servicio | Puerto | URL |
|----------|--------|-----|
| ExternalSolutionService | 80 | http://186.31.31.18:80/ExternalSolutionService.svc |
| MotorDecisionService | 86 | http://186.31.31.18:86/MotorDecisionService.svc |
| ServicioArrendamientoCentral | 81 | http://52.170.23.68:81/ |

## 6. Diagrama de Relaciones

```
USUARIOS EXTERNOS
├── Arrendatarios --> RadicacionEnLinea (formulario + pago)
├── Asesores --> Portal-Asesores (cotizaciones + seguimiento)
└── Inmobiliarias --> LandingInmobiliarias (links + reportes)
                           |
                           v
                    ┌─────────────┐
                    │  AGSSAsura  │ <-- Sistema Central
                    └──────┬──────┘
                           |
          ┌────────────────┼────────────────┐
          v                v                v
    ┌──────────┐    ┌────────────┐   ┌──────────────┐
    │ BD AGSSA │    │ Servicios  │   │ Integraciones│
    │(88 ent.) │    │    WCF     │   │   Externas   │
    └──────────┘    └────────────┘   └──────────────┘
```
