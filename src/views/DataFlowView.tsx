import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileText,
  UserCheck,
  
  FileSignature,
  Shield,
  AlertTriangle,
  RefreshCw,
  Play,
  Info
} from 'lucide-react';

// Tipos
interface TableField {
  name: string;
  type: string;
  description: string;
  filledAt: number[]; // Etapas donde se llena (0-indexed)
  example?: string;
}

interface TableSchema {
  name: string;
  displayName: string;
  description: string;
  fields: TableField[];
  createdAt: number; // Etapa donde se crea la tabla (0-indexed)
}

interface FlowStep {
  id: number;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  trigger: string;
  actor: string;
  tables: string[]; // Nombres de tablas que se modifican
  details: string[];
}

// Datos de las tablas con sus campos
const tableSchemas: Record<string, TableSchema> = {
  'T_Radicaciones': {
    name: 'T_Radicaciones',
    displayName: 'Radicaciones (BD Temporal)',
    description: 'Tabla temporal en BD RADICACIONES - Primera parada de los datos',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [0], example: '12345' },
      { name: 'IdAgssa', type: 'long?', description: 'ID en AGSSA (cuando sincroniza)', filledAt: [1], example: '67890' },
      { name: 'IdTipoGarantia', type: 'int?', description: 'Tipo de garantia', filledAt: [0], example: '1 = Fianza' },
      { name: 'FechaRegistro', type: 'DateTime', description: 'Fecha/hora de creacion', filledAt: [0], example: '2026-05-21 10:30:00' },
      { name: 'IdEstado', type: 'int', description: 'Estado de la radicacion', filledAt: [0, 1], example: '1=Iniciada, 2=Pagada, 3=Sincronizada' },
      { name: 'TokenAcceso', type: 'Guid', description: 'Token unico para acceso', filledAt: [0], example: 'a1b2c3d4-...' },
      { name: 'FechaToken', type: 'DateTime', description: 'Fecha generacion token', filledAt: [0], example: '2026-05-21 10:30:00' },
      { name: 'Observaciones', type: 'string?', description: 'Notas internas', filledAt: [0, 1], example: 'Solicitud creada...' },
    ]
  },
  'T_InformacionBasica': {
    name: 'T_InformacionBasica',
    displayName: 'Informacion Basica (BD Temporal)',
    description: 'Datos personales del arrendatario en BD RADICACIONES',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [0], example: '1001' },
      { name: 'IdRadicacion', type: 'long', description: 'FK a T_Radicaciones', filledAt: [0], example: '12345' },
      { name: 'IdTipoInterviniente', type: 'int', description: '1=Inquilino, 2=Codeudor, 3=Propietario', filledAt: [0], example: '1' },
      { name: 'TipoDocumento', type: 'string', description: 'CC, CE, NIT, etc.', filledAt: [0], example: 'CC' },
      { name: 'NumeroDocumento', type: 'string', description: 'Numero de identificacion', filledAt: [0], example: '1234567890' },
      { name: 'Nombres', type: 'string', description: 'Nombres de la persona', filledAt: [0], example: 'JUAN CARLOS' },
      { name: 'Apellidos', type: 'string', description: 'Apellidos de la persona', filledAt: [0], example: 'PEREZ GOMEZ' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [0], example: 'juan@email.com' },
      { name: 'Celular', type: 'string', description: 'Telefono movil', filledAt: [0], example: '3001234567' },
      { name: 'FechaNacimiento', type: 'DateTime?', description: 'Fecha de nacimiento', filledAt: [0], example: '1990-01-15' },
      { name: 'ValidacionIdentidad', type: 'bool', description: 'Paso validacion TruValidate', filledAt: [0], example: 'true' },
    ]
  },
  'CSolicitudes': {
    name: 'CSolicitudes',
    displayName: 'Solicitudes',
    description: 'Tabla principal en BD AGSSA - Corazon del sistema',
    createdAt: 1,
    fields: [
      { name: 'IdSolicitud', type: 'long', description: 'ID de la solicitud', filledAt: [1], example: '67890' },
      { name: 'FechaSolicitud', type: 'DateTime?', description: 'Fecha de radicacion', filledAt: [1], example: '2026-05-21' },
      { name: 'Estado', type: 'string', description: 'Estado actual', filledAt: [1, 2, 3, 4, 5, 6], example: 'Radicada → Analisis → Contrato...' },
      { name: 'IdAsesor', type: 'string', description: 'ID del asesor inmobiliario', filledAt: [1], example: 'ASE001' },
      { name: 'Inmobiliaria', type: 'string', description: 'Nombre de la inmobiliaria', filledAt: [1], example: 'Inmobiliaria ABC' },
      { name: 'IdArrendador', type: 'string', description: 'ID del propietario', filledAt: [1], example: '9876543210' },
      { name: 'IdInmueble', type: 'string', description: 'ID del inmueble', filledAt: [1], example: 'INM001' },
      { name: 'IdAnalisis', type: 'long?', description: 'Referencia a analisis', filledAt: [2], example: '5001' },
      { name: 'IdContrato', type: 'string', description: 'ID del contrato', filledAt: [3], example: 'CTR001' },
      { name: 'IdPolizaColectiva', type: 'long?', description: 'Referencia a poliza colectiva', filledAt: [4], example: '8001' },
      { name: 'NumeroPoliza', type: 'string', description: 'Numero de poliza SURA', filledAt: [4], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero de riesgo SURA', filledAt: [4], example: '987654' },
      { name: 'IdSiniestro', type: 'string', description: 'ID de siniestro (si hay)', filledAt: [5], example: 'SIN001' },
      { name: 'FechaSiniestro', type: 'string', description: 'Fecha del siniestro', filledAt: [5], example: '2026-08-15' },
      { name: 'UsuAsesor', type: 'string', description: 'Usuario que radico', filledAt: [1], example: 'jperez' },
      { name: 'UsuAnalista', type: 'string', description: 'Usuario que analizo', filledAt: [2], example: 'mrodriguez' },
      { name: 'UsuContrato', type: 'string', description: 'Usuario que genero contrato', filledAt: [3], example: 'lgomez' },
      { name: 'FechaIniAnalisis', type: 'DateTime?', description: 'Inicio del analisis', filledAt: [2], example: '2026-05-22 09:00' },
      { name: 'FechaFinAnalisis', type: 'DateTime?', description: 'Fin del analisis', filledAt: [2], example: '2026-05-22 11:30' },
      { name: 'FechaIniContrato', type: 'DateTime?', description: 'Inicio generacion contrato', filledAt: [3], example: '2026-05-23 10:00' },
      { name: 'FechaFinContrato', type: 'DateTime?', description: 'Fin generacion contrato', filledAt: [3], example: '2026-05-23 15:00' },
      { name: 'ValorEstudio', type: 'int', description: 'Valor del estudio', filledAt: [1], example: '35000' },
      { name: 'NroCodeudores', type: 'int', description: 'Cantidad de codeudores', filledAt: [1], example: '1' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones generales', filledAt: [1, 2, 3, 4, 5, 6], example: 'Notas...' },
    ]
  },
  'CArrendatario': {
    name: 'CArrendatario',
    displayName: 'Arrendatario (Inquilino)',
    description: 'Datos completos del arrendatario/inquilino',
    createdAt: 1,
    fields: [
      { name: 'IdArrendatario', type: 'long', description: 'ID del arrendatario', filledAt: [1], example: '1001' },
      { name: 'TipoPersona', type: 'string', description: 'Natural o Juridica', filledAt: [1], example: 'Natural' },
      { name: 'NombresRazonSocial', type: 'string', description: 'Nombres o razon social', filledAt: [1], example: 'JUAN CARLOS' },
      { name: 'Apellidos', type: 'string', description: 'Apellidos', filledAt: [1], example: 'PEREZ GOMEZ' },
      { name: 'TipoDocumento', type: 'string', description: 'CC, CE, NIT, etc.', filledAt: [1], example: 'CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero de identificacion', filledAt: [1], example: '1234567890' },
      { name: 'Telefono', type: 'long?', description: 'Telefono fijo', filledAt: [1], example: '6011234567' },
      { name: 'Celular', type: 'long?', description: 'Telefono movil', filledAt: [1], example: '3001234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [1], example: 'juan@email.com' },
      { name: 'Sexo', type: 'string', description: 'M o F', filledAt: [1], example: 'M' },
      { name: 'FechaNacimiento', type: 'DateTime?', description: 'Fecha de nacimiento', filledAt: [1], example: '1990-01-15' },
      { name: 'FechaValidacion', type: 'DateTime?', description: 'Fecha validacion TruValidate', filledAt: [1], example: '2026-05-21 10:45' },
      { name: 'ClienteConsultable', type: 'bool?', description: 'En lista negra SURA', filledAt: [2], example: 'false' },
      { name: 'Suplantacion', type: 'bool?', description: 'Indicador suplantacion', filledAt: [2], example: 'false' },
      { name: 'CiudadNacimiento', type: 'string', description: 'Ciudad de nacimiento', filledAt: [1], example: 'BOGOTA' },
      { name: 'Nacionalidad', type: 'string', description: 'Nacionalidad', filledAt: [1], example: 'COLOMBIANA' },
      { name: 'PersonasCargo', type: 'int?', description: 'Personas a cargo', filledAt: [1], example: '2' },
    ]
  },
  'CInmueble': {
    name: 'CInmueble',
    displayName: 'Inmueble',
    description: 'Datos del inmueble a arrendar',
    createdAt: 1,
    fields: [
      { name: 'IdInmueble', type: 'long', description: 'ID del inmueble', filledAt: [1], example: 'INM001' },
      { name: 'Direccion', type: 'string', description: 'Direccion completa', filledAt: [1], example: 'Calle 100 # 15-20 Apto 501' },
      { name: 'Ciudad', type: 'string', description: 'Ciudad', filledAt: [1], example: 'BOGOTA' },
      { name: 'Departamento', type: 'string', description: 'Departamento', filledAt: [1], example: 'CUNDINAMARCA' },
      { name: 'Destinacion', type: 'string', description: 'Residencial, Comercial, etc.', filledAt: [1], example: 'Residencial' },
      { name: 'TipoInmueble', type: 'object', description: 'Apartamento, Casa, Oficina', filledAt: [1], example: 'Apartamento' },
      { name: 'CanonArrendamiento', type: 'long?', description: 'Valor canon mensual', filledAt: [1], example: '2500000' },
      { name: 'CuotaAdmon', type: 'long?', description: 'Cuota administracion', filledAt: [1], example: '350000' },
      { name: 'Telefono', type: 'long?', description: 'Telefono del inmueble', filledAt: [1], example: '6019876543' },
      { name: 'Inmobiliaria', type: 'string', description: 'Inmobiliaria que administra', filledAt: [1], example: 'Inmobiliaria ABC' },
    ]
  },
  'CAnalisis': {
    name: 'CAnalisis',
    displayName: 'Analisis de Riesgo',
    description: 'Resultado del motor de decision y analisis de riesgo',
    createdAt: 2,
    fields: [
      { name: 'IdAnalisis', type: 'long', description: 'ID del analisis', filledAt: [2], example: '5001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [2], example: '67890' },
      { name: 'IdConceptoString', type: 'string', description: 'Resultado: APROBADO/NEGADO/ESTUDIO', filledAt: [2], example: 'APROBADO' },
      { name: 'FechaConcepto', type: 'DateTime?', description: 'Fecha del concepto', filledAt: [2], example: '2026-05-22' },
      { name: 'RiesgoConsultable', type: 'string', description: 'En lista negra S/N', filledAt: [2], example: 'N' },
      { name: 'DetalleRiesgoConsultable', type: 'string', description: 'Detalle del riesgo', filledAt: [2], example: 'Sin reportes negativos' },
      { name: 'PorcentajeEndeudamiento', type: 'long?', description: '% de endeudamiento', filledAt: [2], example: '25' },
      { name: 'NroObligacion', type: 'long?', description: 'Obligaciones en central', filledAt: [2], example: '2' },
      { name: 'EntidadReporte', type: 'string', description: 'Entidad que reporta', filledAt: [2], example: 'Banco XYZ' },
      { name: 'EntidadMonto', type: 'long?', description: 'Monto reportado', filledAt: [2], example: '5000000' },
      { name: 'AlertaContratos', type: 'string', description: 'Alerta contratos previos', filledAt: [2], example: 'Sin alertas' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones del analista', filledAt: [2], example: 'Cliente con buen historial' },
      { name: 'PlanArrendamiento', type: 'string', description: 'Plan asignado', filledAt: [2], example: 'Plan Basico' },
      { name: 'LimiteIndemni', type: 'string', description: 'Limite de indemnizacion', filledAt: [2], example: '12 canones' },
    ]
  },
  'CContrato': {
    name: 'CContrato',
    displayName: 'Contrato',
    description: 'Contrato de arrendamiento con seguro',
    createdAt: 3,
    fields: [
      { name: 'IdContrato', type: 'long', description: 'ID del contrato', filledAt: [3], example: 'CTR001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [3], example: '67890' },
      { name: 'IdEstadoContrato', type: 'string', description: 'Borrador, Firmado, Vigente', filledAt: [3, 4], example: 'Borrador → Firmado' },
      { name: 'Vigencia', type: 'string', description: 'Vigencia en meses', filledAt: [3], example: '12' },
      { name: 'CanonArrendamiento', type: 'string', description: 'Canon mensual', filledAt: [3], example: '2500000' },
      { name: 'CuotaAdmon', type: 'string', description: 'Cuota administracion', filledAt: [3], example: '350000' },
      { name: 'ValorPrima', type: 'string', description: 'Prima del seguro', filledAt: [3], example: '450000' },
      { name: 'TasaAplicada', type: 'string', description: 'Tasa de prima', filledAt: [3], example: '1.5%' },
      { name: 'FechaRiesgo', type: 'string', description: 'Inicio vigencia riesgo', filledAt: [4], example: '2026-06-01' },
      { name: 'FechaIniPoliza', type: 'string', description: 'Inicio poliza', filledAt: [4], example: '2026-06-01' },
      { name: 'FechaFinPoliza', type: 'string', description: 'Fin poliza', filledAt: [4], example: '2027-05-31' },
      { name: 'FechaPagoPoliza', type: 'string', description: 'Fecha pago poliza', filledAt: [4], example: '2026-05-25' },
      { name: 'PagoPoliza', type: 'string', description: 'Estado pago poliza', filledAt: [4], example: 'PAGADO' },
      { name: 'Banco', type: 'string', description: 'Banco para deposito', filledAt: [3], example: 'Bancolombia' },
      { name: 'TipoCuenta', type: 'string', description: 'Tipo cuenta', filledAt: [3], example: 'Ahorros' },
      { name: 'NumeroCuenta', type: 'string', description: 'Numero de cuenta', filledAt: [3], example: '1234567890' },
      { name: 'ServiciosPublicos', type: 'string', description: 'Cobertura serv. publicos', filledAt: [3], example: 'SI' },
      { name: 'DañosFaltantes', type: 'string', description: 'Cobertura danos', filledAt: [3], example: 'SI' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [3, 4], example: 'Contrato generado...' },
    ]
  },
  'CSiniestro': {
    name: 'CSiniestro',
    displayName: 'Siniestro (Reclamacion)',
    description: 'Registro de siniestros y reclamaciones',
    createdAt: 5,
    fields: [
      { name: 'IdSiniestro', type: 'string', description: 'ID del siniestro', filledAt: [5], example: 'SIN001' },
      { name: 'FechaSiniestro', type: 'string', description: 'Fecha del siniestro', filledAt: [5], example: '2026-08-15' },
      { name: 'FechaSolicitud', type: 'string', description: 'Fecha radicacion', filledAt: [5], example: '2026-08-20' },
      { name: 'NroPoliza', type: 'string', description: 'Numero de poliza', filledAt: [5], example: '123456789' },
      { name: 'Riesgo', type: 'string', description: 'Numero de riesgo', filledAt: [5], example: '987654' },
      { name: 'TotalDeuda', type: 'string', description: 'Deuda total', filledAt: [5], example: '7500000' },
      { name: 'DeudaALaFecha', type: 'string', description: 'Deuda acumulada', filledAt: [5, 6], example: '7500000' },
      { name: 'idestadosiniestro', type: 'int', description: 'Estado del siniestro', filledAt: [5, 6], example: '1=Radicado, 2=En proceso...' },
      { name: 'PlanSeguro', type: 'string', description: 'Plan de seguro', filledAt: [5], example: 'Plan Basico' },
      { name: 'LimiteIndemnizacion', type: 'string', description: 'Limite', filledAt: [5], example: '30000000' },
      { name: 'AutorizaIndemnizacion', type: 'bool', description: 'Autorizado para pago', filledAt: [6], example: 'true' },
      { name: 'PosesionInmueble', type: 'bool', description: 'Inmueble en posesion', filledAt: [5, 6], example: 'false' },
      { name: 'FechaPosesion', type: 'DateTime?', description: 'Fecha toma posesion', filledAt: [6], example: '2026-09-01' },
      { name: 'InmuebleRestituido', type: 'bool', description: 'Inmueble devuelto', filledAt: [6], example: 'true' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [5, 6], example: 'Mora de 3 meses...' },
    ]
  },
  'CRenovacion': {
    name: 'CRenovacion',
    displayName: 'Renovacion',
    description: 'Renovacion de contratos y polizas',
    createdAt: 6,
    fields: [
      { name: 'IdRenovacion', type: 'string', description: 'ID de renovacion', filledAt: [6], example: 'REN001' },
      { name: 'IdSolicitud', type: 'string', description: 'Solicitud original', filledAt: [6], example: '67890' },
      { name: 'Estado', type: 'string', description: 'Estado de renovacion', filledAt: [6], example: 'Pendiente' },
      { name: 'Vlr_CanonArrendamiento', type: 'string', description: 'Nuevo canon', filledAt: [6], example: '2650000' },
      { name: 'Vlr_Administracion', type: 'string', description: 'Nueva admon', filledAt: [6], example: '370000' },
      { name: 'Incremento', type: 'string', description: 'Incremento %', filledAt: [6], example: '6%' },
      { name: 'FechaInicioPoliza', type: 'string', description: 'Inicio nueva poliza', filledAt: [6], example: '2027-06-01' },
      { name: 'FechaFinPoliza', type: 'string', description: 'Fin nueva poliza', filledAt: [6], example: '2028-05-31' },
      { name: 'VigenciaEnMeses', type: 'string', description: 'Vigencia', filledAt: [6], example: '12' },
      { name: 'NroPoliza', type: 'string', description: 'Nuevo numero poliza', filledAt: [6], example: '123456790' },
      { name: 'TotalPagar', type: 'string', description: 'Total a pagar', filledAt: [6], example: '480000' },
      { name: 'Prima', type: 'string', description: 'Nueva prima', filledAt: [6], example: '480000' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [6], example: 'Renovacion anual' },
    ]
  },
};

// Definicion de las etapas del flujo
const flowSteps: FlowStep[] = [
  {
    id: 0,
    name: 'Radicacion',
    shortName: 'Radicar',
    description: 'El arrendatario llena el formulario y paga el estudio ($35,000)',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
    trigger: 'Usuario envia formulario en RadicacionEnLinea',
    actor: 'Arrendatario (Usuario)',
    tables: ['T_Radicaciones', 'T_InformacionBasica'],
    details: [
      'Se crea registro en T_Radicaciones con estado "Iniciada"',
      'Se guarda info basica del inquilino en T_InformacionBasica',
      'Se genera TokenAcceso unico para el formulario',
      'Pago de $35,000 via Wompi',
      'Validacion de identidad con TruValidate',
    ]
  },
  {
    id: 1,
    name: 'Sincronizacion a AGSSA',
    shortName: 'Sync',
    description: 'Webhook de Wompi confirma pago y sincroniza datos a BD AGSSA',
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
    trigger: 'Webhook Wompi confirma pago aprobado',
    actor: 'Sistema (Automatico)',
    tables: ['T_Radicaciones', 'CSolicitudes', 'CArrendatario', 'CInmueble'],
    details: [
      'WCF ExternalSolutionService.CrearSolicitudAsync()',
      'SP P_Crearsolicitud inserta en CSolicitudes',
      'Se crean registros en CArrendatario, CInmueble',
      'T_Radicaciones.IdAgssa se actualiza con el ID de AGSSA',
      'Estado cambia a "Radicada" en AGSSA',
    ]
  },
  {
    id: 2,
    name: 'Analisis de Riesgo',
    shortName: 'Analisis',
    description: 'Analista ejecuta motor de decision y evalua riesgo crediticio',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-500',
    trigger: 'Analista abre Analisis_11.aspx manualmente',
    actor: 'Analista de Riesgo',
    tables: ['CSolicitudes', 'CAnalisis', 'CArrendatario'],
    details: [
      'Motor de decision consulta API SURA (lista negra)',
      'Valida rango de canon ($1.5M - $8M)',
      'Consulta centrales de riesgo',
      'Se crea registro en CAnalisis con resultado',
      'Resultado: APROBADO / NEGADO / ESTUDIO',
      'CSolicitudes.IdAnalisis se actualiza',
    ]
  },
  {
    id: 3,
    name: 'Generacion de Contrato',
    shortName: 'Contrato',
    description: 'Se genera el contrato de arrendamiento con clausulas del seguro',
    icon: <FileSignature className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
    trigger: 'Ejecutivo genera contrato desde AGSSAsura',
    actor: 'Ejecutivo de Contratos',
    tables: ['CSolicitudes', 'CContrato'],
    details: [
      'Se genera documento de contrato',
      'Se definen coberturas (servicios, danos, etc.)',
      'Se calcula prima del seguro',
      'Contrato se envia a firma via ZohoSign',
      'CSolicitudes.IdContrato se actualiza',
      'Estado: "En Contrato"',
    ]
  },
  {
    id: 4,
    name: 'Activacion de Poliza',
    shortName: 'Poliza',
    description: 'Cliente paga poliza en SIPRO y se activa la cobertura',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-500',
    trigger: 'Pago verificado en SIPRO (VPN SURA)',
    actor: 'Promotora + Sistema SIPRO',
    tables: ['CSolicitudes', 'CContrato'],
    details: [
      'Cliente paga prima en SIPRO (sistema SURA)',
      'Promotora verifica pago manualmente',
      'Se asigna NumeroPoliza y NumeroRiesgo',
      'Fechas de vigencia se registran',
      'Estado: "Vigente"',
      'Cobertura activa desde FechaIniPoliza',
    ]
  },
  {
    id: 5,
    name: 'Siniestro (si aplica)',
    shortName: 'Siniestro',
    description: 'Arrendatario deja de pagar, se radica reclamacion',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-500',
    trigger: 'Inmobiliaria radica siniestro por mora',
    actor: 'Inmobiliaria + Area de Siniestros',
    tables: ['CSolicitudes', 'CSiniestro'],
    details: [
      'Inmobiliaria reporta mora del arrendatario',
      'Se crea registro en CSiniestro',
      'Se calcula deuda total acumulada',
      'Proceso de cobro juridico',
      'Indemnizacion segun limite de poliza',
      'CSolicitudes.IdSiniestro se actualiza',
    ]
  },
  {
    id: 6,
    name: 'Renovacion (si aplica)',
    shortName: 'Renovar',
    description: 'Al vencer la poliza, se renueva el contrato',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-500',
    trigger: '30-60 dias antes de vencimiento',
    actor: 'Auxiliar de Renovaciones',
    tables: ['CRenovacion', 'CSolicitudes'],
    details: [
      'Sistema alerta proximos vencimientos',
      'Se calcula incremento del canon (IPC)',
      'Se genera nueva prima',
      'Cliente acepta y paga renovacion',
      'Nueva vigencia de 12 meses',
      'Se crea registro en CRenovacion',
    ]
  },
];

export default function DataFlowView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentFlow = flowSteps[currentStep];

  // Auto-play functionality
  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    let step = currentStep;
    const interval = setInterval(() => {
      step++;
      if (step >= flowSteps.length) {
        step = 0;
        setIsPlaying(false);
        clearInterval(interval);
      }
      setCurrentStep(step);
    }, 3000);
  };

  const isFieldFilledAtStep = (field: TableField, stepId: number): boolean => {
    return field.filledAt.some(s => s <= stepId);
  };

  const isFieldNewAtStep = (field: TableField, stepId: number): boolean => {
    return field.filledAt.includes(stepId);
  };

  const getTablesForCurrentStep = () => {
    return currentFlow.tables.map(tableName => tableSchemas[tableName]).filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Flujo de Datos - Ciclo de Vida
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualiza como se van llenando las tablas en cada etapa del proceso
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 overflow-x-auto">
          <div className="flex items-center justify-between min-w-max gap-2">
            {flowSteps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(index)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                    currentStep === index
                      ? `${step.bgColor} ${step.borderColor} border-2`
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    currentStep === index ? step.bgColor : 'bg-gray-100 dark:bg-gray-700'
                  } ${currentStep === index ? step.color : 'text-gray-500'}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs mt-1 font-medium ${
                    currentStep === index ? step.color : 'text-gray-500'
                  }`}>
                    {step.shortName}
                  </span>
                </button>
                {index < flowSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto mb-6 flex items-center gap-4">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>
        <button
          onClick={handlePlay}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow ${
            isPlaying
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <Play className="w-4 h-4" />
          {isPlaying ? 'Detener' : 'Reproducir'}
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(flowSteps.length - 1, currentStep + 1))}
          disabled={currentStep === flowSteps.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
          Etapa {currentStep + 1} de {flowSteps.length}
        </span>
      </div>

      {/* Current Step Info */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 ${currentFlow.borderColor}`}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${currentFlow.bgColor} ${currentFlow.color}`}>
              {currentFlow.icon}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Etapa {currentStep + 1}: {currentFlow.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {currentFlow.description}
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Trigger: </span>
                  <span className="text-gray-600 dark:text-gray-400">{currentFlow.trigger}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Actor: </span>
                  <span className="text-gray-600 dark:text-gray-400">{currentFlow.actor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Que sucede en esta etapa:
            </h3>
            <ul className="grid md:grid-cols-2 gap-2">
              {currentFlow.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${currentFlow.color}`} />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="max-w-7xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Tablas modificadas en esta etapa
        </h3>

        <div className="grid lg:grid-cols-2 gap-6">
          {getTablesForCurrentStep().map((table) => (
            <div
              key={table.name}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all ${
                selectedTable === table.name ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Table Header */}
              <div
                className={`p-4 cursor-pointer ${
                  table.createdAt === currentStep
                    ? 'bg-green-50 dark:bg-green-900/20 border-b-2 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setSelectedTable(selectedTable === table.name ? null : table.name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      {table.displayName}
                      {table.createdAt === currentStep && (
                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          NUEVA
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{table.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {table.fields.filter(f => isFieldFilledAtStep(f, currentStep)).length}/{table.fields.length} campos
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{table.description}</p>
              </div>

              {/* Table Fields */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 w-8"></th>
                      <th className="pb-2">Campo</th>
                      <th className="pb-2">Tipo</th>
                      <th className="pb-2 hidden md:table-cell">Ejemplo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.fields.map((field) => {
                      const isFilled = isFieldFilledAtStep(field, currentStep);
                      const isNew = isFieldNewAtStep(field, currentStep);

                      return (
                        <tr
                          key={field.name}
                          className={`border-b border-gray-100 dark:border-gray-700/50 ${
                            isNew
                              ? 'bg-yellow-50 dark:bg-yellow-900/20'
                              : isFilled
                                ? 'bg-green-50/50 dark:bg-green-900/10'
                                : 'opacity-50'
                          }`}
                        >
                          <td className="py-2">
                            {isNew ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-500 text-white rounded-full text-xs font-bold">
                                !
                              </span>
                            ) : isFilled ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                            )}
                          </td>
                          <td className="py-2">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {field.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {field.description}
                            </div>
                          </td>
                          <td className="py-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                            {field.type}
                          </td>
                          <td className="py-2 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                            {isFilled && field.example ? (
                              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">
                                {field.example}
                              </code>
                            ) : (
                              <span className="text-gray-300 dark:text-gray-600">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto mt-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Leyenda</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-500 text-white rounded-full text-xs font-bold">!</span>
              <span className="text-gray-600 dark:text-gray-400">Campo llenado en ESTA etapa</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">Campo ya tiene valor</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
              <span className="text-gray-600 dark:text-gray-400">Campo pendiente (NULL)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">NUEVA</span>
              <span className="text-gray-600 dark:text-gray-400">Tabla creada en esta etapa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
