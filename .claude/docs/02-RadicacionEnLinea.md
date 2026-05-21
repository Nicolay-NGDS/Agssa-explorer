# RadicacionEnLinea - Sistema de Radicacion

## Informacion General
- **Tecnologia:** .NET 8, ASP.NET Core MVC, EF Core 9
- **Rama:** feature/24022026-forms
- **Base de Datos:** RADICACIONES (186.31.31.18)
- **Proposito:** Formulario web para radicacion de solicitudes con validacion de identidad y pagos

---

## 1. CONTROLLERS (13)

### HomeController
- **Responsabilidad:** Pantalla principal del flujo de radicacion
- **Acciones:**
  - `GET Index` - Recupera o crea radicacion
  - `POST Index` - Valida y guarda informacion
  - `VistaPorFlujo` - Retorna vista segun tipo (ASESOR, INMOBILIARIA, NORMAL)
- **Logica de Negocio:**
  - _idFiducuenta = 2 (Tipo garantia)
  - _sinGarantias = 3
  - _PlanClasico = 1, _PlanGlobal = 2
  - _tope = 4000000 (Canon maximo sin garantias)

### ValidacionIdentidadController
- **Responsabilidad:** Flujo completo de validacion de identidad con TruValidate
- **Etapas:** OTP (1), Biometria (2), Formulario (3)
- **Acciones:**
  - `GET Index` - Inicia validacion con token tk
  - `POST ValidarIdentidad` - Envia datos a TruValidate
  - `GET/POST CodigoOTP` - Ingreso y validacion de codigo SMS
  - `GET ResendOTP` - Reenvia codigo
  - `GET ValidacionFormulario` - Carga manual de documentos
  - `POST GuardarDocumento` - Procesa documentos
  - `GET Documento` - Captura biometria documento
  - `POST ValidarDocumento` - Procesa fotos documento
  - `GET ObtenerQRContinue` - Genera QR para movil
  - `GET Selfie` - Captura selfie
  - `POST ValidarSelfie` - Valida reconocimiento facial

### FacturacionPagoController
- **Responsabilidad:** Facturacion y modal de pago Wompi
- **Acciones:**
  - `GET Index` - Obtiene datos inquilino
  - `POST InsertarInformacionFacturacion` - Procesa facturacion
  - `POST ValidarConvenio` - Valida codigo convenio (AJAX)
  - `POST AplicarCodigoConvenio` - Aplica descuento

### ApiWompiController
- **Endpoint:** `POST /api/wompi/`
- **Responsabilidad:** Webhook para pagos Wompi
- **Flujo:**
  1. Valida firma SHA256
  2. Verifica estado APPROVED
  3. Inserta pago en BD
  4. Extrae PDF de documentos
  5. Crea solicitud en AGSSA (WCF)
  6. Ejecuta Motor de Decision

### FinalTransaccionController
- **Acciones:**
  - `GET Index` - Pagina resumen final
  - `GET SinPago` - Procesa solicitud gratuita (convenios)

### Otros Controllers
- HealthController - Health check `/api/health`
- GestionLinksController - Gestion de enlaces
- AsesorController - Flujo para asesores
- InmobiliariaController - Flujo para inmobiliarias
- CargadocumentosAdicionalesController
- RegistroCodeudorController
- LinksPersonalizadosController
- InformacionAdicionalController

---

## 2. SERVICIOS (29)

### TruValidateServices
- **Metodos:**
  - `ObtenerTokenAsync()` - Token Bearer para API
  - `ConsultarApiValidacionIdentidad()` - Consulta orquestador
  - `SolicitarOTPasync()` - Solicita codigo SMS
  - `ValidarOTPAsync()` - Valida codigo OTP
  - `CrearCargarImagenTruAsync()` - Sube foto documento
  - `ValidarDocumentoSubidoAsync()` - Valida OCR
  - `ValidarSelfieIdentidadAsync()` - Valida reconocimiento facial

### WompiServices
- **Metodos:**
  - `ValidarFirma(WompiTransaction)` - Valida SHA256
  - `VerificarEstadoPagoWompi(transactionId)`
  - `CargarModalWompi()` - Prepara datos modal
  - `EsFormatoPagoRadicacion(referencia)`

### ExternalServices (WCF)
- **Metodos:**
  - `ListaAsesorAgssaByClave()` - Datos asesor
  - `CrearSolicitudAGSSA()` - Crea solicitud via WCF
  - `GuardarValidacionIdentidad()` - Sube documento
  - `ExtraerDocumentoRadicacion()` - Descarga documento
  - `ValidacionIdentidadEstadoSolicitud()` - Estado validacion

### MotorDecisionServices
- `EjecutarMotorDecisionAsync(idRadicacion)`

### SmsServices (MasivApp)
- Envia SMS

### PdfServices
- `UnirDocumentosEncryptAsync()` - Une PDFs

### Otros Servicios
- RadicacionesService, InquilinoServices, InmobiliariaServices
- FacturacionServices, ConvenioServices, PagoService
- RecaptchaServices, ValidarIdentidadServices, QrServices
- TipoDocumentosServices, TipoPersonaServices
- TipoDestinacionInmuebleServices, TipoActividadesEconomicasServices
- CiudadesServices, TipoContribuyenteServices, TipoPlanServices
- LogsServices, ParametrosServices

---

## 3. ENTIDADES EF CORE (11 Tablas)

### TRadicacione
```
Id (PK), IdAgssa, IdTipoGarantia, FechaRegistro, IdEstado
Observaciones, TokenAcceso (GUID), FechaToken
Relaciones: TInformacionBasica[], TFacturacion, TInmueble, TPropietario, TAsesore, TInmobiliarium
```

### TInformacionBasica
```
Id, IdRadicacion (FK), IdTipoInterviniente (1=Inquilino, 2=Codeudor)
Nombres, PrimerApellido, SegundoApellido
IdTipoIdentificacion (1=CC, 2=CE, 5=NIT), Identificacion
Celular, FechaNacimiento, FechaExpedicionDoc, Email
Relacion, Direccion, IdCiudad, IdTipoPersona (1=Natural, 2=Juridica)
CodeudorAdicional, LinkValidacionIdentidad
Relaciones: TActividadEconomica, TReferencia[], TRepresentanteLegal, TValidacionesIdentidad[]
```

### TInmueble
```
Id, IdTipoInmueble, IdTipoPlanSeguro, IdDestinacion
Canon, Administracion, DetalleDestinacion, Direccion
IdCiudad, IdDepartamento
```

### TFacturacion
```
Id, Nombre, Apellido, IdTipoDocumento, Identificacion
Celular, Email, Direccion, IdTipoContribuyente
Observaciones, Subtotal, Iva, Total, IdConvenio
Relacion: TPago
```

### TPago
```
Id, IdTransaccion (Wompi), Referencia ({idRadicacion}-{timestamp})
Estado (APPROVED, DECLINED, etc.), FirmaWompy, Ambiente
```

### Otras Entidades
- TValidacionesIdentidad - Intentos validacion
- TRepresentanteLegal - Para NITs
- TActividadEconomica
- TReferencia - Referencias personales
- TAsesore, TInmobiliarium, TPropietario

### Catalogos (Tipo*)
- TTipoDocumento: CC(1), CE(2), NIT(5), Pasaporte
- TTipoPersona: Natural(1), Juridica(2)
- TTipoInterviniente: Inquilino(1), Codeudor(2)
- TTipoEstadoRadicacion, TTipoCiudade, TTipoDepartamento
- TTipoInmueble, TTipoDestinacionInmueble
- TTipoActividadEconomica, TTipoContribuyente
- TTipoConvenio, TTipoGarantium, TTipoPlanSeguro

---

## 4. INTEGRACIONES

### TruValidate (Validacion Biometrica)
```
Base URL: https://www.transuniondecisioncentre.com.mx/TU.DE.PONT_LATAM/
User: GLCO_INCREAR.PROD2
Password: 5jGSc+ZLtYg|4Fz

Endpoints:
- POST /token - Obtener token Bearer
- POST /applications - Orquestador (determina flujo)
- POST /applications/{appId}/queues/OTP_PhoneSelection - Solicitar OTP
- POST /applications/{appId}/queues/OTP_PinVerification_OTPInput - Validar OTP
- POST /applications/{appId}/documents - Crear documento
- POST /documents/{ImgId} - Cargar imagen
- POST /applications/{appId}/queues/TSO_ServiceInput - Validar documento/selfie

Flujos:
- OTP_PhoneSelection -> SMS -> OTP_PinVerification -> Biometria
- TSO_ServiceInput -> Documento frente/reverso -> Selfie -> Decision
```

### Wompi (Pagos)
```
Endpoint: https://sandbox.wompi.co/v1
PublicKey: pub_prod_BzhHv1Qw3PMZMnKHQXxmQpIowPtAvyQ8
Currency: COP

Webhook POST /api/wompi/:
1. Valida firma SHA256: amount + reference + currency + timestamp + eventsKey
2. Verifica Status == "APPROVED"
3. Inserta pago, crea solicitud AGSSA

Estados: APPROVED, DECLINED, PENDING, VOIDED
```

### WCF Services
```
ExternalSolutionService: http://186.31.31.18:80/ExternalSolutionService.svc
- CrearSolicitudAsync(), GuardarValidacionIdentidad()

MotorDecisionService: http://186.31.31.18:86/MotorDecisionService.svc
- EjecutarMotorDecisionAsync()
```

### MasivApp (SMS)
```
Endpoint: https://api-sms.masivapp.com/send-message
Auth: Basic (api.b8ofp:klWnucs3Pc9kPx,LbJcvbQ3G0z,04o)
```

---

## 5. FLUJO COMPLETO DE RADICACION

### Fase 1: Inicio (HomeController)
1. Usuario accede por LINK o URL
2. HomeController.Index GET: valida sesion/cookie
3. Usuario completa formulario: inquilino, propietario, inmueble
4. HomeController.Index POST: valida reCAPTCHA, guarda datos
5. Redirige a FacturacionPago

### Fase 2: Facturacion (FacturacionPagoController)
1. FacturacionPago.Index GET: carga datos
2. Usuario ingresa datos facturacion
3. Si convenio gratuito: redirige a SinPago
4. Si pago: genera modal Wompi
5. Usuario paga en modal

### Fase 3: Pago (ApiWompiController)
1. Webhook recibe POST de Wompi
2. Valida firma SHA256
3. Si APPROVED: inserta pago, crea solicitud AGSSA
4. Usuario redirigido a FinalTransaccion

### Fase 4: Validacion Identidad (ValidacionIdentidadController)
1. Usuario recibe link por SMS/Email
2. Segun tipo documento:
   - CC/CE: Flujo OTP -> Biometria
   - NIT: Flujo Formulario
3. Flujo OTP: recibe SMS, valida codigo
4. Flujo Biometria: captura documento + selfie
5. Flujo Formulario: sube PDF manualmente
6. Ejecuta Motor de Decision
7. Redirige a FinalTransaccion

---

## 6. CONFIGURACION (appsettings.json)

```json
{
  "ConnectionStrings": {
    "RadicacionesDBConnection": "Server=186.31.31.18;Database=RADICACIONES;..."
  },
  "ExternalServicesSettings": {
    "Endpoint": "http://186.31.31.18:80/ExternalSolutionService.svc"
  },
  "MotorDecisionServicesSettings": {
    "Endpoint": "http://186.31.31.18:86/MotorDecisionService.svc"
  },
  "RecaptchaSettings": {
    "SecretKey": "6LetA1YrAAAAAEoG2QqSOG2t6cdRlvF6S7rsC1SP",
    "SiteKey": "6LetA1YrAAAAAMbdeZbRLTqisjS83YmNXs9Qunca"
  },
  "Wompi": {
    "Currency": "COP",
    "Endpoint": "https://sandbox.wompi.co/v1"
  },
  "TruValidateSettings": {
    "BaseUrl": "https://www.transuniondecisioncentre.com.mx/TU.DE.PONT_LATAM/"
  }
}
```
