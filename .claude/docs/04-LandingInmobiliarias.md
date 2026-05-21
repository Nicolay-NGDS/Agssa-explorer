# LandingInmobiliarias - Portal para Inmobiliarias

## Informacion General
- **Tecnologia:** .NET Framework 4.7.2, ASP.NET WebForms
- **Rama:** feature/D14042026LinkRadicacion
- **Base de Datos:** AGSSA (57.131.25.62\SQLEXPRESS)
- **Proposito:** Landing page y dashboard para inmobiliarias

---

## 1. PAGINAS ASPX (9)

### Inicio.aspx
- **Proposito:** Landing page publica
- **Contenido:**
  - Carrusel de bienvenida
  - Info de planes: Poliza Colectiva Global y Clasica
  - Links a Login y Consulta
  - Formulario HubSpot para asesoria
  - Video YouTube explicativo
- **URL:** `/Inicio.aspx`

### Login.aspx
- **Proposito:** Autenticacion de inmobiliarias
- **Flujo:**
  1. Usuario ingresa codigo + password
  2. Encripta password con SecurePassword.Encriptar()
  3. Singleton.LoginInmobiliariasWeb(usuario, pass)
  4. Compara con BD
  5. Si OK: Cookie Forms + Session["Inm"] + Redirige a Descargas
- **URL:** `/Login.aspx`

### Recover.aspx
- **Proposito:** Recuperacion de contrasena
- **Flujo:**
  - Input codigo inmobiliaria
  - Busca en BD
  - Envia email con password desencriptado
  - Template: Mail.html
- **URL:** `/Recover.aspx`

### Logout.aspx
- **Proposito:** Cerrar sesion
- **Acciones:** FormsAuthentication.SignOut(), limpia cookies
- **URL:** `/LogOut.aspx`

### Consulta.aspx
- **Proposito:** Consultar estado de solicitud (PUBLICO)
- **Inputs:** Numero solicitud + Documento interviniente
- **Muestra:**
  - Numero, Fecha, Estado, Resultado
  - Estado contrato
  - Tabla inquilinos y codeudores con tipificacion
- **URL:** `/Consulta.aspx`

### Detalles.aspx
- **Proposito:** Dashboard personalizado inmobiliaria
- **Parametro F:**
  - `Novedad` - Formulario HubSpot reportar ingreso
  - `Reclamacion` - Iframe para siniestros
  - (vacio) - Solo datos basicos
- **Muestra:** Codigo, Razon social, Email
- **URL:** `/Detalles.aspx?F={valor}`

### Descargas.aspx (PRINCIPAL)
- **Proposito:** Panel de control con multiples funcionalidades
- **URL:** `/Descargas.aspx?F={valor}`

### LinksRadicacion.aspx
- **Proposito:** Generar y mostrar links de radicacion
- **SP:** P_GenerarLinksInmobiliarias
- **Columnas:** Codigo, Inmobiliaria, Link Global, Link Clasico
- **JavaScript:** Boton copiar al portapapeles
- **URL:** `/LinksRadicacion.aspx`

### 404.aspx
- **Proposito:** Error 404 personalizado

---

## 2. PARAMETRO F (ROUTING)

### En Descargas.aspx

| F | Vista | Componentes | SP |
|---|-------|-------------|-----|
| `Informacion` | FInformacionSolcitud | GridView3, Busqueda, Btn Informe Codeudor | P_InformeSolicitudesConCodeudores |
| `Informe` | Novedades | Dropdown opciones, Selector fecha, GridView2 | P_ConsultarNovedades |
| `Estudios` | FResultado | Panel resultados analisis | API AGSSA |
| `Siniestros` | FReporte | Formulario siniestros | (iframe) |
| `ReportarNovSoliSipro` | FReportarNovSoliSipro | Tabla dinamica SIPRO | P_GuardarNovedad |
| `ReportarNovedadNueva` | FReportarNovedadNueva | GridView3, Tabla novedades | API AGSSA |
| `ReporteSiniestro` | FReporteSiniestro | Iframe siniestros | (iframe) |
| (vacio) | Todas ocultas | Pantalla vacia | - |

### Opciones Dropdown (F=Informe)
1. Solicitudes de Ingreso
2. Cambios de Valor
3. Avisos de Retiro
4. Historico (numeracion > 220000)
5. Historico SIPRO (numeracion = 220000)
6. Historico general solicitudes

---

## 3. MODELOS (Carpeta Modelo/)

### Singleton.cs
- **Patron:** Singleton thread-safe
- **Metodos:**

| Metodo | SQL/SP | Retorno |
|--------|--------|---------|
| `LoginInmobiliariasWeb(id, pass)` | SELECT View_Inmobiliaria | Resultado |
| `ListarInmobiliariaById(id)` | SELECT View_Inmobiliaria | Inmobiliaria |
| `ListarCorreosNotificacionInmobiliarias()` | P_ObtenerUsuariosConPermisos | List<Inmobiliaria> |
| `listarDatosServidorMail()` | P_listarDatosServidorMail | CServidorMail |
| `ListarDireccionRiesgo(id)` | P_ListarDireccionRiesgo | CDirecciones |
| `View_ConsultaResultadoX(sol, interv)` | SELECT View_ConsultaResultadoX | Consultas |
| `ValidarDireccion(dir, editar)` | P_ValidarDireccion | List<CSolEst> |
| `ConsultarEndPointApiAggsa(clave)` | P_ConsultarParametroUrl | URL string |
| `ActualizarDireccion(dir, id)` | P_ActualizarDireccion | Resultado |
| `ObtenerReporte(idInm)` | P_InformeSolicitudesConCodeudores | DataTable |

### SecurePassword.cs
```csharp
Encriptar(cadena)
- Unicode a bytes
- Convierte a Base64
- NOTA: NO es encriptacion criptografica, solo encoding

DesEncriptar(cadena)
- Base64 a bytes
- Bytes a Unicode string
```

### Consulta.cs
```csharp
Consultas {
  Solicitud, FechaRadicacion, EstadoSolicitud, EstadoContrato
  Resultado, IdInqui, TipificacionInqui, ObservacionesInqui
  List<Codeudor> Codeudores
}

Codeudor { IdCodeudor, TipificacionCod, ObservacionesCod }

CServidorMail { MailOrigen, MailClave, MailDestino, MailHost, MailAsunto, MailMensaje }

Novedades {
  IdSolicitud, NombreArrendatario, Direccion, Ciudad
  Canon, Admon, AdmonNuevo, CanonNuevo
}

LinkRadicacion {
  Codigo, Inmobiliaria, Email, LinkGlobal, LinkClasico, EsExcepcionClasico
}
```

### Inmobiliaria.cs
```csharp
Inmobiliaria {
  IdInmobiliaria, RazonSocial, Email, EMailArrendatario, Clave
}

InmSolicitud {
  IdSolicitud, NombrePropietario, DireccionInmueble
  Destinacion (VIVIENDA, COMERCIAL)
  CanonArrendamiento, CuotaAdmon
  PlanArrendamiento (Global, Clasica)
  Limite (indemnizacion)
}

CDirecciones {
  Campo1...Campo15, Departamento, Ciudad
}
```

### Resultado.cs
```csharp
Resultado { Codigo (0=OK, 1=Error, 2=SQL), Objeto, Error }
```

---

## 4. FLUJO GENERACION DE LINKS

1. Inmobiliaria inicia sesion
2. Navega a LinksRadicacion.aspx
3. Page_Load ejecuta CargarLinks(idInm)
4. SP P_GenerarLinksInmobiliarias retorna:
   - Codigo, Inmobiliaria, Email
   - LinkGlobal (siempre visible)
   - LinkClasico (NULL si no aplica)
5. GridView renderiza con botones copiar
6. JavaScript copia al portapapeles

**Estructura Link:**
```
Global:  https://www.arriendetranquiloenlinea.com.co/Radicaciones/FormInicio.aspx?inmobiliaria={codigo}&plan=global
Clasico: https://www.arriendetranquiloenlinea.com.co/Radicaciones/FormInicio.aspx?inmobiliaria={codigo}&plan=clasico
```

---

## 5. AUTENTICACION

### Flujo Login
```
1. Usuario ingresa credenciales
2. SecurePassword.Encriptar(password)
3. Singleton.LoginInmobiliariasWeb(user, passEnc)
4. Query: SELECT PasswordWeb FROM View_Inmobiliaria WHERE IdInmobiliaria = user
5. Encripta PasswordWeb de BD
6. Compara passwords
7. Si OK:
   - FormsAuthentication.SetAuthCookie(user, false)
   - Session["Inm"] = user
   - Redirige a Descargas.aspx?F=Informacion
```

### Configuracion (Web.config)
```xml
<authentication mode="Forms">
  <forms loginUrl="~/Login.aspx" defaultUrl="~/Detalles.aspx" timeout="30" />
</authentication>
<sessionState mode="InProc" timeout="30" />
```

### Validacion Session
```csharp
if (Session["Inm"] == null || string.IsNullOrEmpty(Session["Inm"].ToString()))
    Response.Redirect("~/Login.aspx");
```

---

## 6. STORED PROCEDURES

| Nombre | Proposito |
|--------|-----------|
| P_ObtenerUsuariosConPermisos | Correos para notificaciones |
| P_listarDatosServidorMail | Configuracion SMTP |
| P_ListarDireccionRiesgo | Direccion por solicitud |
| P_ValidarDireccion | Validar direccion |
| P_ActualizarDireccion | Actualizar direccion |
| P_ConsultarParametroUrl | URL endpoint API |
| P_GenerarLinksInmobiliarias | Generar links radicacion |
| P_ConsultarNovedades | Historico por mes |
| P_InformeSolicitudesConCodeudores | Informe con codeudores |
| P_GuardarNovedad | Guardar novedad reportada |

---

## 7. VISTAS SQL

### View_Inmobiliaria
- IdInmobiliaria, RazonSocial, Email, EMailArr, PasswordWeb

### View_ConsultaResultadoX
- IdSolicitud, Fecha Radicacion, Estado Actual, Resultado
- IdInquilino, IdCodeudor, Tipificacion, Observaciones
- Estado Contrato
- Propietario1-3, Arrendatario1-3

---

## 8. NOTIFICACIONES EMAIL

### Metodo NotificacionMail()
```csharp
1. Obtiene config SMTP: singleton.listarDatosServidorMail()
2. Configura SmtpClient(MailHost)
   - Credentials: MailOrigen, MailClave
   - Port: 587
   - EnableSsl: true
3. Crea MailMessage
   - From: MailOrigen
   - To: destinatarios
   - Subject: MailAsunto
   - Body: MailMensaje (HTML)
4. smtp.Send(mail)
```

### Casos de Uso
1. Recuperacion contrasena: Template Mail.html
2. Notificacion novedad: Lista de novedades registradas

---

## 9. INTEGRACION API AGSSA

### Arquitectura
- Llamadas HTTP asincronas desde backend
- Metodo: Singleton.ConsultarEndPointApiAggsa(claveActiva)

### Configuracion (Web.config)
```xml
<add key="ApiNovedades_Activa" value="ApiNovedades_Local_Pruebas" />
<add key="ApiNovedades_Activa_Inmobiliaria" value="ApiInmobiliaria_Local_Pruebas" />
```

### Uso
```csharp
using (HttpClient cliente = new HttpClient())
{
    string claveActiva = ConfigurationManager.AppSettings["ApiNovedades_Activa_Inmobiliaria"];
    string url = singleton.ConsultarEndPointApiAggsa(claveActiva);
    HttpResponseMessage respuesta = cliente.GetAsync(url).Result;
    // Deserializa JSON
}
```

---

## 10. TECNOLOGIAS

| Tecnologia | Version | Uso |
|------------|---------|-----|
| .NET Framework | 4.7.2 | Runtime |
| ASP.NET WebForms | - | Framework web |
| Bootstrap | 4.6 | CSS |
| jQuery | 3.5.1 | JavaScript |
| DataTables | 1.13.4 | Tablas interactivas |
| Font Awesome | 6.5.1 | Iconos |
| SSRS ReportViewer | 15.0 | Reportes |
| Newtonsoft.Json | 12.0 | JSON |
| HubSpot Forms | - | Formularios |

---

## 11. PROBLEMAS DE SEGURIDAD IDENTIFICADOS

### Criticos
1. **SQL Injection:** LoginInmobiliariasWeb usa concatenacion de strings
2. **Encriptacion debil:** Base64 no es encriptacion
3. **Password en email:** Recover.aspx envia password desencriptado

### Moderados
4. Timeout alto (30 min)
5. Sin validacion CSRF en algunos formularios
6. Sin auditoria de intentos fallidos
