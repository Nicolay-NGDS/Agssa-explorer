# Portal-Asesores - Dashboard para Asesores

## Informacion General
- **Tecnologia:** .NET 8, ASP.NET Core API + Razor Pages
- **Rama:** feature/D-00009_V1
- **Base de Datos:** AGSSA
- **Arquitectura:** Backend (API REST) + Frontend (Razor Pages)

---

## 1. API CONTROLLERS (7)

### AsesoresController (7 endpoints)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| POST | `api/asesores/consultar` | No | Consulta asesor por clave, envia OTP |
| POST | `api/asesores/enviar-otp` | No | Reenvia OTP a email |
| POST | `api/asesores/validar-otp` | No | Valida OTP, genera JWT |
| GET | `api/asesores/perfil` | JWT | Email del asesor |
| GET | `api/asesores/administracion` | JWT | Datos completos asesor |
| PUT | `api/asesores/administracion` | JWT | Actualiza nombres, telefono, email |
| GET | `api/asesores/administracion-cotizador` | JWT | Datos asesor + oficina |

### CotizacionesController (2 endpoints)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| POST | `api/cotizaciones` | JWT | Calcula cotizacion |
| POST | `api/cotizaciones/pdf` | JWT | Genera PDF cotizacion |

### DashboardController (1 endpoint)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| GET | `api/dashboard/consultar` | JWT | Resumen y detalle solicitudes por fecha |

### RenovacionesController (1 endpoint)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| GET | `api/renovaciones/consultar` | JWT | Lista renovaciones por fecha |

### SolicitudesController (4 endpoints)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| GET | `api/solicitudes/estados` | JWT | Lista de estados |
| GET | `api/solicitudes/listar` | JWT | Lista solicitudes por estado |
| GET | `api/solicitudes/buscar` | JWT | Busca solicitud por ID |
| GET | `api/solicitudes/detalle` | JWT | Detalles completos |
| GET | `api/solicitudes/validaciones-identidad` | JWT | Links validacion pendientes |

### ValidacionIdentidadController (1 endpoint)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| GET | `api/validacionidentidad/{idRadicacion}` | No | Links validacion por radicacion |

### ReportesController (1 endpoint)
| Metodo | Ruta | Protegido | Funcion |
|--------|------|-----------|---------|
| GET | `api/reportes/resultado-analisis/{numeroSolicitud}/pdf` | No | PDF analisis |

---

## 2. SERVICIOS

### OTPService
```csharp
GenerateAndSendOTP(email)
- Genera codigo 6 digitos (100000-999999)
- Valido 5 minutos
- Almacena en T_OTP_Validacion
- Envia email con template HTML

ValidateOTP(email, codigo)
- Valida codigo vs email
- Comprueba expiracion
- Marca como usado
```

### JwtService
```csharp
GenerateToken(idAsesor, email)
- Algoritmo: HMAC SHA-256
- Expiracion: 4 horas
- Claims: IdAsesor, Email, Sub, Jti
```

### CotizacionService
```csharp
Calcular(CotizacionRequestDto)

Validaciones:
- Canon minimo $600.000
- Administracion minima $10.000 (si > 0)
- Plan 4 solo para Comercio
- Plan 3 no permite danos
- Danos minimo $300.000
- Danos maximo: Vivienda $20M, Comercio $40M

Calculo de Tasa:
VIVIENDA:
- Plan 1: <=6m = 36/BaseTasa, >6m = 30/BaseTasa
- Plan 2: <=6m = 60/BaseTasa, >6m = 50/BaseTasa
- Plan 3: <=6m = 24/BaseTasa, >6m = 20/BaseTasa

COMERCIO:
- Plan 1/4: <=6m = 42/BaseTasa, >6m = 35/BaseTasa
- Plan 2: <=6m = 60/BaseTasa, >6m = 50/BaseTasa
- Plan 3: <=6m = 28/BaseTasa, >6m = 23.324/BaseTasa

Formula General:
ValorAseguradoCanon = (Canon * Vigencia) * factor_regimen
PrimaCanon = ValorAseguradoCanon * Tasa
IvaCanon = PrimaCanon * IVA%

Servicios (si Plan != 3):
- Canon <= $4M: 2%
- Canon <= $8M: 1.5%
- Canon > $8M: SERVICIO_TOPE

Total = PrimaCanon + PrimaAdmon + PrimaAsistencia + PrimaDanos + IVAs
```

### PdfService
- Genera PDF con iText 7
- Localización: es-CO

### ParametroService
- Cache memoria (30 min)
- Parametros: IVA_GENERAL, TASA_BASE, SERVICIO_TOPE, ASISTENCIA_VALOR, DANOS_TASA, PRIMA_MIN_BASE

---

## 3. DTOs PRINCIPALES

### Request
```csharp
LoginRequest { Clave, RecaptchaToken }

CotizacionRequestDto {
  // Asesor
  NombreAsesor, CorreoAsesor, OficinaAsesor
  // Tomador
  NombreTomador, ApellidoTomador, CorreoTomador, TelefonoTomador
  // Inmueble
  Regimen (1=Comun, 2=Simplificado)
  Destinacion (1=Vivienda, 2=Comercio)
  DireccionInmueble, Canon, Administracion, Vigencia
  // Plan
  Plan (1=Clasico, 2=Plus, 3=Basico, 4=Concesion)
  // Opcionales
  Asistencia, Danos, ValorDanos
}

AdministracionAsesorUpdateDto { Nombres, Telefono, Email }
```

### Response
```csharp
TokenResponseDto { Message, Token, IdAsesor }

CotizacionResponseDto {
  Tasa,
  ValorAseguradoCanon, PrimaCanon, IvaCanon,
  ValorAseguradoAdministracion, PrimaAdministracion, IvaAdministracion,
  ValorServicios, AplicaServicios,
  ValorAseguradoDanos, PrimaDanos, IvaDanos,
  PrimaAsistencia, IvaAsistencia,
  TotalValorAsegurado, TotalPrima, TotalIva, Total
}

DashboardResponseDto {
  Resumen: [{ Estado, Total }],
  Detalle: [{ IdSolicitud, Estado, FechaSolicitud, Propietario..., Inquilino... }]
}

SolicitudDetalleDto {
  IdSolicitud, Estado, Propietario, Inquilino, Codeudor,
  NumeroPoliza, DireccionInmueble, Canon, Administracion,
  TipoGarantia, Concepto, Tipificacion, Analista,
  FechaResultado, Observaciones, PdfResultadoUrl,
  Plan, SubEstadoContrato, EjecutivoContratos
}

RenovacionDto {
  IdSolicitud, Estado, FechaSolicitud,
  Propietario, Inquilino, FechaFinPoliza, NroPoliza
}
```

---

## 4. FRONTEND - PAGINAS RAZOR

### Login.cshtml
- Ruta: `/login`
- Metodos: OnPost (valida clave, envia OTP)

### VerificarOtp.cshtml
- Ruta: `/verificarotp`
- Session: ClaveAsesor, EmailAsesor
- Metodos: OnPostValidarOtp, OnPostReenviarOtp (max 3 intentos)
- Cookie generada: AuthToken (4h, HttpOnly)

### Dashboard.cshtml
- Ruta: `/dashboard`
- Query: FechaInicio, FechaFin
- Llama: GET /api/dashboard/consultar

### Cotizador.cshtml
- Ruta: `/cotizador`
- Metodos: OnGet (datos asesor), OnPostCotizar, OnPostDescargarPdf
- Normaliza datos a mayusculas (es-CO)

### Solicitudes.cshtml
- Ruta: `/solicitudes`
- Query: EstadoSeleccionado, BuscarId
- Datos: Estados[], SolicitudListado[]

### SolicitudDetalle.cshtml
- Ruta: `/solicituddetalle`
- Query: Id, Estado, IdAsesor
- Carga en paralelo: detalle + validaciones

### Renovaciones.cshtml
- Ruta: `/renovaciones`
- Query: FechaInicio, FechaFin

### Administracion.cshtml
- Ruta: `/administracion`
- Metodos: OnGet (datos), OnPost (actualiza)

---

## 5. AUTENTICACION - FLUJO OTP

```
1. Asesor ingresa clave
2. POST /api/asesores/consultar
3. Valida clave en BD (SP P_ConsultarAsesor)
4. OTPService.GenerateAndSendOTP(email)
   - Genera 6 digitos
   - Inserta BD (P_InsertarOTP)
   - Envia email
5. Response: { Email, otpEnviado: true }
6. Asesor ingresa codigo
7. POST /api/asesores/validar-otp
8. OTPService.ValidateOTP(email, codigo)
   - Busca OTP (P_ValidarOTP)
   - Verifica expiracion (5 min)
   - Marca usado (P_MarcarOTPUsado)
9. JwtService.GenerateToken(idAsesor, email)
   - Claims: IdAsesor, Email, Sub, Jti
   - Expiracion: 4 horas
10. Response: { Token, IdAsesor }
11. Frontend almacena cookie AuthToken
12. Redirige a /dashboard
```

**Expiraciones:**
- OTP: 5 minutos
- JWT: 4 horas
- Session: 20-30 minutos

---

## 6. STORED PROCEDURES USADOS

- P_ConsultarAsesor - Busca asesor por clave
- P_ConsultarAdministracionAsesor - Datos asesor
- P_ConsultarOficinaAsesor - Oficina
- P_ActualizarAdministracionAsesor - Update
- P_ConsultarDashboardAsesor - Dashboard
- P_ConsultarRenovacionesAsesor - Renovaciones
- P_ConsultarPolizaPorSolicitud - Info poliza
- P_ConsultarSolicitudesAsesor - Listado
- P_ConsultarSolicitudDetalle - Detalle
- P_ConsultarValidacionesIdentidad - Links
- P_ConsultarParametros - Parametros cotizacion
- P_ConsultarEstadosSolicitud - Estados
- P_InsertarOTP, P_ValidarOTP, P_MarcarOTPUsado
- P_ListarDatosServidorMail - Config SMTP

---

## 7. LIBRERIAS

**Backend:**
- Microsoft.EntityFrameworkCore.SqlServer
- Microsoft.AspNetCore.Authentication.JwtBearer
- iText7 (PDF)
- QuestPDF (reportes avanzados)

**Frontend:**
- Microsoft.AspNetCore.Mvc.RazorPages
- System.Net.Http.Json
