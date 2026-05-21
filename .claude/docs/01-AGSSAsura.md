# AGSSAsura - Sistema Principal

## Informacion General
- **Tecnologia:** .NET Framework 4.8, ASP.NET WebForms
- **Rama:** develop
- **Base de Datos:** AGSSA (10.254.35.16\DEVELOPMENT)
- **Arquitectura:** N-capas (DAL, Modelo.Entidades, Modelo.Negocio, DST.AGSSA)

## Archivos Criticos
- `DAL/DAO.cs` (661KB) - Data Access Layer completo
- `Modelo.Negocio/MNegocio.cs` (154KB) - Logica de negocio

---

## 1. ENTIDADES (82 Clases)

### Entidades Core del Negocio

| Entidad | Propiedades Principales | Descripcion |
|---------|------------------------|-------------|
| CCotizacion | IdCotizacion, Tomador, Afianzado, Beneficiario, Tasa, Canon, Porcentaje, Prima, Administracion, DanosFaltantes, Vigencia, IVA, TotalPagar, Fecha, Email | Cotizacion de seguros |
| CContrato | IdContrato, IdOrdenContrato, RiesgoConsultable, Observaciones, FechaPagoPoliza, FechaIniPoliza, FechaFinPoliza, CanonArrendamiento, CuotaAdmon, IdEstadoContrato, ValorPrima, PagoDerechos, PagoPrimerCanon, Vigencia | Contrato de arrendamiento |
| CRenovacion | IdRenovacion, IdSolicitud, NombreApellidoPropietario, DocumentoPropietario, NroPoliza, Vlr_CanonArrendamiento, Vlr_Administracion, FechaInicioPoliza, FechaFinPoliza, VigenciaEnMeses, Estado, TotalPagar, Prima, Observaciones | Renovacion de polizas |
| CSiniestro | IdSiniestro, FechaSiniestro, TotalDeuda, NroPoliza, Riesgo, EsSuraDigital, LimiteIndemnizacion, AutorizaIndemnizacion, Observaciones, IdArrendatario, IdEstadoSiniestro, IdTipoCierreSiniestro | Reclamaciones |
| CSolicitudes | IdSolicitud, IdArrendador, IdInmueble, IdCodeudor, IdContrato, IdAnalisis, IdPolizaIndividual, IdSiniestro, Estado, FechaRadicacion | Centro del modelo |

### Entidades de Partes/Intervinientes

| Entidad | Propiedades Principales |
|---------|------------------------|
| CArrendador | Nombre, Documento, TipoDocumento, Direccion, Telefono, Email |
| CArrendatarioPN | Nombre, Apellidos, Documento, Email, Estado laboral, Ingresos mensuales |
| CArrendatarioPJ | RazonSocial, NIT, Representante Legal |
| CCodeudor | Nombre, Documento, Email, Parentesco, Ingresos |
| CRepresentanteLegal | Nombres, Apellidos, Documento, Email, Telefono |
| CApoderado | Nombres, Apellidos, Documento, Email, Telefono |

### Entidades de Riesgo y Analisis

| Entidad | Propiedades Principales |
|---------|------------------------|
| CRiesgos | Codigo, Descripcion, Tipo de riesgo |
| CRiesgoConsultable | Request (modulo, ciudad, tipoRiesgo, riesgo), Response (esRiesgo, tipoValidacion, mensajeValidacion) |
| CAnalisis | IdAnalisis, Resultado, Fechas, Observaciones |
| CConsultaMD | Datos para Motor de Decision - Listado de partes, informacion moral/economica |

### Entidades de Inmuebles y Ubicacion

| Entidad | Propiedades Principales |
|---------|------------------------|
| CInmueble | Direccion, Ciudad, Municipio, Estrato, Tipo de bien, Valor asegurado |
| CDirecciones | Ubicacion de riesgos, codigos postales, referencias |
| CBien | Descripcion, Cantidad, Valor unitario |

### Entidades de Pago y Caja

| Entidad | Propiedades Principales |
|---------|------------------------|
| CPagos | IdPago, Monto, Fecha, Medio de pago, Estado |
| CCaja | IdCaja, Fecha, Saldo, Movimientos |
| CComprobantePago | Numero de recibo, Monto, Concepto, Beneficiario |
| CDatosTransferencia | Banco, Tipo de cuenta, Numero de cuenta, Titular |

### Entidades de Usuario y Seguridad

| Entidad | Propiedades Principales |
|---------|------------------------|
| CUsuario | IdUsuario, Cedula, Nombre, Email, Contrasena |
| CPermisos | IdPermiso, Descripcion (modulos 4-27) |
| CRol | IdRol, Nombre, Permisos asociados |

### Entidades de Integracion Externa

| Entidad | Propiedades | Integracion |
|---------|-------------|-------------|
| CZohoSign | ClientId, ClientSecret, RefreshToken, ApiBaseUrl, TokenUrl, Firmantes | Firma electronica |
| CBucketS3 | bucketName: "agssa-nas", accessKey, secretKey, RegionEndpoint.USEast1 | AWS S3 |
| CFtp | Host, Usuario, Contrasena | Transferencia archivos |
| CServidorMail | MailHost, MailOrigen, MailClave | SMTP |

### Otras Entidades

- CInmobiliaria, CAsesor, COrdenContrato
- CPolizaIndividual, CPolizaColectiva
- CReciboPrimerCanon, CDevolPrimerCanon
- CModulos (4=Cotizaciones, 5=Solicitudes, 10=Analisis, 12=Contratos, 21-23=Caja, 24-25=Renovaciones, 23=Siniestros)

---

## 2. PAGINAS ASPX (56+)

### Modulo 4 - Cotizaciones
| Pagina | Proposito |
|--------|-----------|
| Cotizacion.aspx | Visor de PDF de cotizaciones |
| Cotizaciones_4.aspx | Formulario de creacion |
| Cotizaciones_Impresion.aspx | Impresion |

### Modulo 5 - Solicitudes
| Pagina | Proposito |
|--------|-----------|
| Solicitudes_5.aspx | Filtro y busqueda |
| Solicitudes_6.aspx | Detalle (propietario/inquilino) |
| Solicitudes_7.aspx | Informacion de codeudores |
| Solicitudes_7Edit.aspx | Edicion de codeudores |
| Solicitudes_8.aspx | Direccion de riesgo |

### Modulo 10 - Analisis de Riesgo
| Pagina | Proposito |
|--------|-----------|
| Analisis_10.aspx | Analisis principal con motor de decision |
| Analisis_10A.aspx | Variante de analisis |
| Analisis_11.aspx | Analisis complementario |

### Modulo 12 - Contratos
| Pagina | Proposito |
|--------|-----------|
| Contratos_12.aspx | Asignacion de ejecutivo |
| Contratos_12A.aspx | Variante de asignacion |
| Contratos_13.aspx | Elaboracion y generacion PDF |
| Contratos_OtroSi.aspx | Modificacion de contrato |
| Contratos_OtroSiComercio.aspx | OtroSi para comercio |
| Contratos_ProformaComercio.aspx | Proforma comercio |
| ProformaEditable.aspx | Proforma editable vivienda |
| ProformaEditable_Comercio.aspx | Proforma editable comercio |
| ContratosZohoSign.aspx | Firma electronica |
| cont-OtroSiEditable.aspx | Edicion de OtroSi |

### Modulo 21-23 - Caja y Pagos
| Pagina | Proposito |
|--------|-----------|
| Caja_21.aspx | Primer canon |
| Caja_22.aspx | Canon de arrendamiento |
| Caja_23.aspx | Otros pagos/conceptos |
| CajaRecibo.aspx | Generacion de recibos |
| CajaSiniestro.aspx | Pagos de siniestros |

### Modulo 23 - Siniestros
| Pagina | Proposito |
|--------|-----------|
| Siniestros_23.aspx | Creacion/consulta |
| Siniestros_23A.aspx | Variante A |
| Siniestros_23B.aspx | Variante B (Sura Digital) |
| Siniestros_23C.aspx | Variante C |
| SiniestrosMigrados_23.aspx | Migrados sistema anterior |
| Siniestros_24.aspx | Recobros |
| Siniestros_25.aspx | Reintegros |
| SiniestrosDireccionRiesgo.aspx | Consulta por direccion |

### Modulo 24-25 - Renovaciones
| Pagina | Proposito |
|--------|-----------|
| Renovaciones_24.aspx | Renovacion vivienda |
| Renovaciones_24A.aspx | Variante A |
| Renovaciones_25.aspx | Renovacion complementaria |
| RenovacionesSipro_24.aspx | Renovaciones SIPRO |
| RenovacionesSipro_25.aspx | SIPRO complementarias |
| CorreosRenovacion.aspx | Notificacion |

### Modulo 15-18 - Inmobiliarias
| Pagina | Proposito |
|--------|-----------|
| Inmobiliaria_15.aspx | Creacion |
| Inmobiliaria_16.aspx | Edicion de riesgos |
| Inmobiliaria_17.aspx | Listado |

### Admin
| Pagina | Proposito |
|--------|-----------|
| AdminGestionUsuarios.aspx | Gestion usuarios y permisos |
| Menu.aspx | Menu principal |
| Default.aspx | Pagina inicio |
| ModificarClave.aspx | Cambio contrasena |
| OlvidoClave.aspx | Recuperacion |

### Reportes
| Pagina | Proposito |
|--------|-----------|
| Dashboard.aspx | Panel de control |
| Dashboard_Analisis.aspx | Dashboard analisis |
| ReporteContratos.aspx | Reporte contratos |
| ReporteFacturacion.aspx | Reporte facturacion |

---

## 3. STORED PROCEDURES (120+)

### Usuario y Seguridad
- P_EditarClave, P_ValidarUsuario, P_ValidarUsuarioByPregunta
- P_ResetClave, P_DeshabilitarUsuario, P_ListarUsuarioByDocumento
- P_ListarPermisosByUsuario, P_ObtenerRol

### Cotizaciones
- P_InsertarCotizacion, P_ListarCotizacionByDocumento
- P_ListarCotizacionById, P_ListarIVA

### Solicitudes
- P_Crearsolicitud, P_ListarSolicitud6, P_ListarSolicitud7
- P_ListarSolicitud22, P_FiltroSolicitudP5, P_LanzarSolicitud
- P_ActualizarSolicitud7, P_CrearSolicitud_SuraDigital
- P_ObtenerFechaSolicitud

### Analisis de Riesgo
- P_CrearAnalisisSolicitud, P_ListarConsultaMD
- P_InsertarResultadoMd, P_InsertarResultadoMdAuto
- P_EmitirResultadoAnalisis

### Contratos
- P_ContratoVivienda, P_ContratoComercio
- P_OtroSiVivienda, P_OtroSiComercio
- P_Contratos13Load, P_Contratos13Guardar
- P_ListarContratoAdd, P_ActualizarContratoAdd
- P_ListarContratoEditable, P_ActualizarContratoEditable

### Asignacion de Usuarios
- P_AsignarAnalistaP10, P_AsignarEjecutivoP12
- P_AsignarEjecutivoAutoP12, P_AsignarSiniestroP23
- P_AsignarAuxiliarRenovacion, P_AsignarAutoAnalista

### Polizas e Indemnizacion
- P_Poliza14Load, P_Poliza14GuardarCrear, P_Poliza14Editar
- P_Poliza14Renovar, P_Poliza14Cancelar
- P_InsertarIndemnizacion, P_InsertarRegistrosSipro
- P_NumeroPolizaP23B

### Siniestros
- P_ListarInfoSiniestros_P27, P_ListarInfoSiniestro_P25
- P_ListarInfoSiniestroSipro_P25, P_GuardarInfoSiniestro
- P_GuardarInfoSiniestroP24, P_GuardarInfoSiniestroMigrado
- P_ListarInfoRecobros, P_ListarInfoReintegros
- P_ListarInfoAbonoAdicional, P_ListarInfoRestitucion
- P_ListarInfoHonorarios

### Renovaciones
- P_ListarRenovacionSipro, P_ListarRenovacionSiproById
- P_ActualizarRenovacionSipro, P_ActualizarSubEstadoRenovacionSipro
- P_RenovacionesGrilla1, P_ListarRenovacionByIdRenovacion
- P_RenovacionesInfoPDF, P_RenovacionCotizador
- P_RenovacionCotizadorSipro, P_RenovacionesSiproPDF
- P_ActualizarRenovacion, P_InsertarObservacionRenovaciones
- P_ActualizacionEstados, P_RenovacionesANotificar
- P_ActualizarSubEstadoRenovacion

### Caja y Pagos
- P_ListarInfoCajaBySolicitud, P_ListarUltimoPagoCaja
- P_InsertarComprobantePago, P_InsertarComprobantePagoSiniestro
- P_InsertarReciboPago, P_CrearCaja, P_ActualizarCaja
- P_ListarReciboCaja

### Inmobiliarias
- P_InsertarInmobiliaria, P_ListarInmobiliariaById
- P_ListarInmobiliaria17, P_ActualizarRiesgoInmobiliaria
- P_ListarDatosInmobiliaria, P_EliminarRiesgos
- P_EliminarRestriccionInmueble, P_EliminarPoliza

### Inmuebles y Direcciones
- P_InsertarInmueble, P_ValidarDireccion
- P_ListarInmuebleContrato, P_InsertarDirRiesgo

### Informacion Propietario/Inquilino
- P_InsertarInfoFormularioPN, P_InsertarInfoFormularioPJ
- P_InsertarInfoFormularioCodeudor
- P_ListarInfoFormularioPN2, P_ListarInfoFormularioPJ2
- P_ListarInfoFormularioCodeudor2
- P_ListarDatosPropietario, P_ListarDatosArrendatario
- P_EliminarCodeudor

### Ordenes de Contrato
- P_OrdenContratoInsertLocal, P_OrdenContratoInsertWeb
- P_OrdenContrato13Load, P_ListarDatosOrden

---

## 4. INTEGRACIONES EXTERNAS

### ZohoSign - Firma Electronica
```
URL Base: https://sign.zoho.com/api/v1
Token URL: https://accounts.zoho.com/oauth/v2/token
Metodos:
- GetAccessToken() - OAuth 2.0 refresh_token
- EnviarContrato(pdfBytes, nombreArchivo, firmantes)
- EnviarParaFirma(requestId, firmantes)
- ListarSolicitudesZoho()
- ObtenerDetalleSolicitud(requestId)
- DescargarDocumento(requestId, documentId)
- DescargarCertificado(requestId)
```

### AWS S3 - Almacenamiento
```
Bucket: agssa-nas
Region: USEast1
Metodos:
- SubirArchivo(idsolicitud, ano, archivo) -> {ano}/{idsolicitud}.pdf
- DownloadFile(keyName) -> byte[]
```

### SURA - Consulta de Riesgos
```
Endpoint: https://cotizador.sura.com/regulacion/secureCommand/validarriesgosmodulos
Metodo: POST
Auth: Basic Auth (Apprconsultable)
Request: { modulo, ciudad, tipoRiesgo, riesgo }
Response: { esRiesgo, tipoValidacion, mensajeValidacion }
```

### Servicios WCF Internos
```
ServicioArrendamientoCentral: http://52.170.23.68:81/
MotorDecisionService: http://10.254.35.16:85/
```

---

## 5. FLUJOS PRINCIPALES

### Flujo Cotizacion (Modulo 4)
1. Usuario accede a Cotizaciones_4.aspx
2. Ingresa datos: Tomador, Canon, Tasa, Servicios
3. DAO.InsertarCotizacion() -> SP P_InsertarCotizacion
4. Genera PDF con ReportViewer
5. Visualiza en Cotizacion.aspx

### Flujo Analisis de Riesgo (Modulo 10)
1. Usuario accede a Analisis_10.aspx
2. MNegocio.MotorDecision(idSolicitud)
3. Valida: MNegocio.ValidarConsultaMd()
4. Obtiene datos: SP P_ListarConsultaMD
5. Consulta SURA API para propietario e intervinientes
6. Ejecuta tabla de verdad: MNegocio.TablaVerdadAnalisis()
7. Guarda resultado: SP P_InsertarResultadoMd
8. Usuario acepta/rechaza

### Flujo Elaboracion de Contrato (Modulo 12)
1. Usuario accede a Contratos_12.aspx
2. Selecciona solicitud, asigna ejecutivo
3. Sistema envia email con enlaces
4. Ejecutivo accede a Contratos_13.aspx
5. Carga datos: SP P_Contratos13Load
6. Selecciona tipo (Vivienda/Comercio)
7. Genera HTML del contrato
8. CContrato.CreacionContrato() genera PDF
9. Se incrusta campos de firma
10. Opcion: Descarga local O envia a ZohoSign
11. Firmantes firman digitalmente
12. SP P_Contratos13Guardar guarda contrato

### Flujo Siniestro (Modulo 23)
1. Usuario accede a Siniestros_23.aspx
2. Ingresa datos del siniestro
3. SP P_GuardarInfoSiniestro
4. Asigna analista: SP P_AsignarSiniestroP23
5. Notificacion enviada
6. Analista calcula indemnizacion
7. Genera PDF resultado

### Flujo Renovacion (Modulo 24-25)
1. Usuario accede a Renovaciones_24.aspx
2. SP P_RenovacionesGrilla1 lista pendientes
3. Selecciona renovacion
4. SP P_ListarRenovacionByIdRenovacion
5. Calcula nuevos valores: SP P_RenovacionCotizador
6. Genera PDF: SP P_RenovacionesInfoPDF
7. Guarda cambios: SP P_ActualizarRenovacion
8. Notifica intervinientes

---

## 6. MODULOS Y PERMISOS

| Codigo | Modulo |
|--------|--------|
| 4 | Cotizaciones |
| 5 | Solicitudes |
| 6 | Info Propietario/Inquilino |
| 10 | Analisis de riesgo |
| 11 | Orden de contrato |
| 12 | Contratos |
| 15 | Inmobiliarias (Crear) |
| 16 | Inmobiliarias (Editar) |
| 17 | Inmobiliarias (Listar) |
| 21 | Caja - Primer Canon |
| 22 | Caja - Canon arrendamiento |
| 23 | Caja - Otros / Siniestros |
| 24 | Renovaciones vivienda |
| 25 | Renovaciones complementarias |
| 27 | Informacion siniestros |

---

## 7. DEPENDENCIAS

- iTextSharp (PDF)
- RestSharp (HTTP client SURA)
- AWSSDK.Core, AWSSDK.S3
- DevExpress.Web v17.1
- Microsoft.ReportViewer.WebForms
- .NET Framework 4.8
