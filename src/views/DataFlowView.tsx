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
  Info,
  Monitor,
  User,
  Home,
  Briefcase,
  Phone,
  Mail,
  DollarSign,
  AlertCircle
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

// Datos de las tablas con sus campos - BD RADICACIONES (temporal) y BD AGSSA (permanente)
// Nomenclatura: T* = tablas en BD RADICACIONES, C* = tablas en BD AGSSA
// MAPEO DE ETAPAS:
// 0 = Llenado formulario (memoria), 1 = Guardar Info General, 2 = Confirmacion
// 3 = Facturacion, 4 = Pago Wompi, 5 = Validacion Identidad, 6 = Sync AGSSA
// 7 = Analisis, 8 = Contrato, 9 = Poliza, 10 = Siniestro, 11 = Renovacion
const tableSchemas: Record<string, TableSchema> = {
  'TRadicacione': {
    name: 'TRadicacione',
    displayName: 'Radicacion (BD Temporal)',
    description: 'Tabla principal en BD RADICACIONES. En flujo Individual NO tiene TInmobiliarium ni TAsesore.',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'PK auto-generado', filledAt: [1], example: '12345' },
      { name: 'IdAgssa', type: 'long?', description: 'ID en AGSSA (se llena en sync)', filledAt: [6], example: '67890' },
      { name: 'IdTipoGarantia', type: 'int?', description: 'FK → TTipoGarantium (1=Fianza, 2=Fiducuenta, 3=Sin)', filledAt: [1], example: '1' },
      { name: 'FechaRegistro', type: 'DateTime', description: 'Fecha/hora creacion', filledAt: [1], example: '2026-05-21 10:30:00' },
      { name: 'IdEstado', type: 'int', description: 'FK → TTipoEstadoRadicacion', filledAt: [1, 4, 5, 6], example: '1→3→5→6' },
      { name: 'TokenAcceso', type: 'Guid', description: 'Token unico acceso formulario', filledAt: [1], example: 'a1b2c3d4-e5f6-...' },
      { name: 'FechaToken', type: 'DateTime', description: 'Fecha generacion token', filledAt: [1], example: '2026-05-21 10:30:00' },
      { name: 'Observaciones', type: 'string?', description: 'Notas internas', filledAt: [1, 4, 6], example: 'Radicacion iniciada' },
      { name: '-- Relaciones --', type: '', description: '', filledAt: [], example: '' },
      { name: 'TInmobiliarium', type: 'null', description: 'NO APLICA flujo Individual', filledAt: [], example: 'NULL' },
      { name: 'TAsesore', type: 'null', description: 'NO APLICA flujo Individual', filledAt: [], example: 'NULL' },
      { name: 'TFacturacion', type: '1:1', description: 'Datos facturacion', filledAt: [3], example: 'Ver TFacturacion' },
      { name: 'TInmueble', type: '1:1', description: 'Datos inmueble', filledAt: [1], example: 'Ver TInmueble' },
      { name: 'TPropietario', type: '1:1', description: 'Datos propietario', filledAt: [1], example: 'Ver TPropietario' },
      { name: 'TInformacionBasicas', type: '1:N', description: 'Inquilino + Codeudores', filledAt: [1], example: 'Ver TInformacionBasica' },
    ]
  },
  'TInformacionBasica': {
    name: 'TInformacionBasica',
    displayName: 'Informacion Basica (BD Temporal)',
    description: 'Datos personales del inquilino y codeudor en BD RADICACIONES',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [1], example: '1001' },
      { name: 'IdRadicacion', type: 'long', description: 'FK a TRadicacione', filledAt: [1], example: '12345' },
      { name: 'IdTipoInterviniente', type: 'int', description: '1=Inquilino, 2=Codeudor', filledAt: [1], example: '1' },
      { name: 'IdTipoPersona', type: 'int', description: '1=Natural, 2=Juridica', filledAt: [1], example: '1' },
      { name: 'IdTipoIdentificacion', type: 'int', description: '1=CC, 2=CE, 5=NIT', filledAt: [1], example: '1' },
      { name: 'Identificacion', type: 'long', description: 'Numero de identificacion', filledAt: [1], example: '1234567890' },
      { name: 'Nombres', type: 'string', description: 'Nombres de la persona', filledAt: [1], example: 'JUAN CARLOS' },
      { name: 'PrimerApellido', type: 'string?', description: 'Primer apellido', filledAt: [1], example: 'PEREZ' },
      { name: 'SegundoApellido', type: 'string?', description: 'Segundo apellido', filledAt: [1], example: 'GOMEZ' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [1], example: 'juan@email.com' },
      { name: 'Celular', type: 'long', description: 'Telefono movil', filledAt: [1], example: '3001234567' },
      { name: 'FechaNacimiento', type: 'DateTime?', description: 'Fecha de nacimiento', filledAt: [1], example: '1990-01-15' },
      { name: 'FechaExpedicionDoc', type: 'DateTime?', description: 'Fecha expedicion documento', filledAt: [1], example: '2010-03-20' },
      { name: 'Direccion', type: 'string?', description: 'Direccion de residencia actual', filledAt: [1], example: 'Cra 50 # 10-20' },
      { name: 'IdCiudad', type: 'int?', description: 'Ciudad de residencia', filledAt: [1], example: '11001' },
      { name: 'Relacion', type: 'string?', description: 'Relacion con inquilino (solo codeudor)', filledAt: [1], example: 'Padre' },
      { name: 'CodeudorAdicional', type: 'bool?', description: 'Si requiere codeudor adicional', filledAt: [1], example: 'false' },
      { name: 'LinkValidacionIdentidad', type: 'string?', description: 'URL para validar identidad', filledAt: [5], example: 'https://...' },
    ]
  },
  'TActividadEconomica': {
    name: 'TActividadEconomica',
    displayName: 'Actividad Economica (BD Temporal)',
    description: 'Situacion laboral del inquilino. Responde a "¿Cual es la actividad economica?"',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TInformacionBasica', filledAt: [1], example: '1001' },
      { name: 'IdTipoActividad', type: 'int', description: '1=Independiente, 2=Pensionado, 3=Empleado, 4=Empresa', filledAt: [1], example: '3' },
      { name: 'Compania', type: 'string?', description: 'Nombre empresa donde trabaja (solo si Empleado)', filledAt: [1], example: 'Bancolombia' },
      { name: 'Ocupacion', type: 'string?', description: 'Profesion (ej: Medico, Abogado, Ingeniero)', filledAt: [1], example: 'Contador' },
      { name: 'Cargo', type: 'string?', description: 'Puesto de trabajo (ej: Gerente, Analista)', filledAt: [1], example: 'Analista Senior' },
      { name: 'PersonasACargo', type: 'int?', description: 'Cuantas personas dependen economicamente', filledAt: [1], example: '2' },
    ]
  },
  'TReferencia': {
    name: 'TReferencia',
    displayName: 'Referencias (BD Temporal)',
    description: 'Referencias personales y familiares del inquilino',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [1], example: '601' },
      { name: 'IdInfoBasica', type: 'long', description: 'FK a TInformacionBasica', filledAt: [1], example: '1001' },
      { name: 'IdTipoReferencia', type: 'int', description: 'FK a TTipoReferencia', filledAt: [1], example: '1=Familiar, 2=Personal' },
      { name: 'Nombre', type: 'string', description: 'Nombre completo', filledAt: [1], example: 'MARIA PEREZ' },
      { name: 'Celular', type: 'long', description: 'Telefono de contacto', filledAt: [1], example: '3109876543' },
    ]
  },
  'TInmueble': {
    name: 'TInmueble',
    displayName: 'Inmueble (BD Temporal)',
    description: 'Datos del inmueble a arrendar en BD RADICACIONES',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TRadicacione', filledAt: [1], example: '12345' },
      { name: 'IdTipoInmueble', type: 'int', description: 'FK a TTipoInmueble', filledAt: [1], example: '1=Apartamento' },
      { name: 'IdTipoPlanSeguro', type: 'int', description: 'FK a TTipoPlanSeguro', filledAt: [1], example: '1=Clasico' },
      { name: 'IdDestinacion', type: 'int', description: 'FK a TDestinacionInmueble', filledAt: [1], example: '1=Vivienda' },
      { name: 'Canon', type: 'long', description: 'Canon de arrendamiento', filledAt: [1], example: '2500000' },
      { name: 'Administracion', type: 'long?', description: 'Cuota administracion', filledAt: [1], example: '350000' },
      { name: 'Direccion', type: 'string?', description: 'Direccion del inmueble', filledAt: [1], example: 'Calle 100 # 15-20 Apto 501' },
      { name: 'IdCiudad', type: 'int?', description: 'FK a TTipoCiudade', filledAt: [1], example: '11001' },
      { name: 'IdDepartamento', type: 'int?', description: 'FK a TTipoDepartamento', filledAt: [1], example: '11' },
      { name: 'DetalleDestinacion', type: 'string?', description: 'Detalle uso comercial', filledAt: [1], example: 'Oficina' },
    ]
  },
  'TPropietario': {
    name: 'TPropietario',
    displayName: 'Propietario (BD Temporal)',
    description: 'Datos del propietario/arrendador ingresados por el inquilino',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TRadicacione', filledAt: [1], example: '12345' },
      { name: 'Nombres', type: 'string', description: 'Nombres del propietario', filledAt: [1], example: 'PEDRO' },
      { name: 'Apellidos', type: 'string?', description: 'Apellidos', filledAt: [1], example: 'RODRIGUEZ LOPEZ' },
      { name: 'IdTipoIdentificacion', type: 'int?', description: 'Tipo documento', filledAt: [1], example: '1=CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero documento', filledAt: [1], example: '9876543210' },
      { name: 'Celular', type: 'long?', description: 'Telefono contacto', filledAt: [1], example: '3201234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [1], example: 'pedro@email.com' },
    ]
  },
  'TFacturacion': {
    name: 'TFacturacion',
    displayName: 'Facturacion (BD Temporal)',
    description: 'Datos de facturacion para el pago del estudio',
    createdAt: 3,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TRadicacione', filledAt: [3], example: '12345' },
      { name: 'Nombre', type: 'string', description: 'Nombre para factura', filledAt: [3], example: 'JUAN CARLOS' },
      { name: 'Apellido', type: 'string?', description: 'Apellido para factura', filledAt: [3], example: 'PEREZ GOMEZ' },
      { name: 'IdTipoDocumento', type: 'int', description: 'FK a TTipoDocumento', filledAt: [3], example: '1=CC' },
      { name: 'Identificacion', type: 'long', description: 'Numero documento', filledAt: [3], example: '1234567890' },
      { name: 'Celular', type: 'long', description: 'Telefono', filledAt: [3], example: '3001234567' },
      { name: 'Email', type: 'string', description: 'Email factura', filledAt: [3], example: 'juan@email.com' },
      { name: 'Direccion', type: 'string', description: 'Direccion facturacion', filledAt: [3], example: 'Cra 50 # 10-20' },
      { name: 'IdTipoContribuyente', type: 'int', description: 'FK a TTipoContribuyente', filledAt: [3], example: '1' },
      { name: 'Subtotal', type: 'decimal', description: 'Subtotal', filledAt: [3], example: '29412' },
      { name: 'Iva', type: 'decimal', description: 'IVA 19%', filledAt: [3], example: '5588' },
      { name: 'Total', type: 'decimal', description: 'Total a pagar', filledAt: [3], example: '35000' },
      { name: 'Observaciones', type: 'string?', description: 'Notas internas de facturacion', filledAt: [3], example: 'Pago normal' },
      { name: 'IdConvenio', type: 'long?', description: 'FK a TConvenio (si aplica)', filledAt: [3], example: 'NULL' },
    ]
  },
  'TPago': {
    name: 'TPago',
    displayName: 'Pago Wompi (BD Temporal)',
    description: 'Registro del pago realizado via Wompi',
    createdAt: 4,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TFacturacion', filledAt: [4], example: '12345' },
      { name: 'IdTransaccion', type: 'string', description: 'ID transaccion Wompi (UNIQUE)', filledAt: [4], example: '12345-1621234567890' },
      { name: 'Referencia', type: 'string', description: 'Referencia {idRad}-{timestamp}', filledAt: [4], example: '12345-1621234567890' },
      { name: 'Estado', type: 'string', description: 'APPROVED, DECLINED, PENDING, VOIDED', filledAt: [4], example: 'APPROVED' },
      { name: 'FirmaWompy', type: 'bool', description: 'Firma SHA256 valida', filledAt: [4], example: 'true' },
      { name: 'Ambiente', type: 'string', description: 'sandbox o production', filledAt: [4], example: 'production' },
    ]
  },
  'TValidacionesIdentidad': {
    name: 'TValidacionesIdentidad',
    displayName: 'Validaciones Identidad (BD Temporal)',
    description: 'Registro de cada intento de validacion con TruValidate (TransUnion). Se crea un registro por cada intento de OTP, biometria o formulario.',
    createdAt: 5,
    fields: [
      { name: 'IdValidacion', type: 'long', description: 'ID auto-generado (PK)', filledAt: [5], example: '1101' },
      { name: 'IdInformacionBasica', type: 'long', description: 'FK a TInformacionBasica (inquilino/codeudor)', filledAt: [5], example: '1001' },
      { name: 'IdMetodo', type: 'int', description: 'FK a TMetodosValidacionIdentidad', filledAt: [5], example: '1' },
      { name: 'Completada', type: 'bool', description: 'true=validacion exitosa, false=fallida', filledAt: [5], example: 'true' },
      { name: 'Fecha', type: 'DateTime', description: 'Fecha/hora del intento', filledAt: [5], example: '2026-05-21 11:00:00' },
      { name: 'Observacion', type: 'string?', description: 'Detalle respuesta TruValidate', filledAt: [5], example: 'OTP04: Codigo incorrecto' },
      { name: 'Intentos', type: 'int?', description: 'Contador de intentos acumulados', filledAt: [5], example: '2' },
    ]
  },
  'TMetodosValidacionIdentidad': {
    name: 'TMetodosValidacionIdentidad',
    displayName: 'Metodos Validacion (Catalogo)',
    description: 'Catalogo de metodos de validacion disponibles en TruValidate',
    createdAt: -1,
    fields: [
      { name: 'Id', type: 'int', description: 'ID del metodo (PK)', filledAt: [], example: '1' },
      { name: 'Metodo', type: 'string', description: 'Nombre del metodo', filledAt: [], example: 'Ver tabla abajo' },
    ]
  },
  'TTipoActividadEconomica': {
    name: 'TTipoActividadEconomica',
    displayName: 'Tipos Actividad Economica (Catalogo)',
    description: 'Catalogo de tipos de situacion laboral',
    createdAt: -1,
    fields: [
      { name: 'Id', type: 'int', description: 'ID del tipo', filledAt: [], example: '1-4' },
      { name: 'Actividad', type: 'string', description: 'Nombre de la actividad', filledAt: [], example: '' },
      { name: '-- Valores --', type: '', description: '', filledAt: [], example: '' },
      { name: '1', type: 'Independiente', description: 'Trabaja por cuenta propia, freelance', filledAt: [], example: 'Comerciante' },
      { name: '2', type: 'Pensionado', description: 'Jubilado, recibe pension', filledAt: [], example: 'Pensionado Colpensiones' },
      { name: '3', type: 'Empleado', description: 'Trabaja para una empresa, tiene contrato', filledAt: [], example: 'Empleado Bancolombia' },
      { name: '4', type: 'Empresa', description: 'Persona juridica (solo si TipoPersona=Juridica)', filledAt: [], example: 'Tech Corp S.A.S' },
    ]
  },
  'TRepresentanteLegal': {
    name: 'TRepresentanteLegal',
    displayName: 'Representante Legal (BD Temporal)',
    description: 'Datos del representante legal - SOLO si TipoPersona = Juridica (empresa)',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TInformacionBasica', filledAt: [1], example: '1001' },
      { name: 'Nombres', type: 'string', description: 'Nombres del representante', filledAt: [1], example: 'CARLOS' },
      { name: 'PrimerApellido', type: 'string?', description: 'Primer apellido', filledAt: [1], example: 'MARTINEZ' },
      { name: 'SegundoApellido', type: 'string?', description: 'Segundo apellido', filledAt: [1], example: 'RUIZ' },
      { name: 'IdTipoIdentificacion', type: 'int', description: 'FK a TTipoDocumento', filledAt: [1], example: '1=CC' },
      { name: 'Identificacion', type: 'long', description: 'Numero documento', filledAt: [1], example: '1122334455' },
      { name: 'Celular', type: 'long', description: 'Telefono movil', filledAt: [1], example: '3156789012' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [1], example: 'rep@empresa.com' },
    ]
  },
  'TCodeudorGarantium': {
    name: 'TCodeudorGarantium',
    displayName: 'Codeudor Garantia (BD Temporal)',
    description: 'Codeudor para garantia Fiducuenta - SOLO si TipoGarantia = 2 (Fiducuenta)',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [1], example: '301' },
      { name: 'IdRadicacion', type: 'long', description: 'FK a TRadicacione', filledAt: [1], example: '12345' },
      { name: 'Nombre', type: 'string', description: 'Nombre completo', filledAt: [1], example: 'LUIS HERNANDEZ' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [1], example: 'luis@email.com' },
      { name: 'Celular', type: 'long', description: 'Telefono movil', filledAt: [1], example: '3009876543' },
    ]
  },
  'TConvenio': {
    name: 'TConvenio',
    displayName: 'Convenio/Descuento (BD Temporal)',
    description: 'Codigo de descuento aplicado al pago de estudio - OPCIONAL',
    createdAt: -1,
    fields: [
      { name: 'Id', type: 'long', description: 'ID del convenio', filledAt: [], example: '50' },
      { name: 'Codigo', type: 'string', description: 'Codigo de descuento', filledAt: [], example: 'DESC2026' },
      { name: 'Valor', type: 'long', description: 'Valor del descuento', filledAt: [], example: '10000' },
      { name: 'IdTipoConvenio', type: 'int', description: 'FK a TTipoConvenio', filledAt: [], example: '1' },
      { name: 'FechaInicio', type: 'DateTime?', description: 'Inicio vigencia', filledAt: [], example: '2026-01-01' },
      { name: 'FechaFin', type: 'DateTime?', description: 'Fin vigencia', filledAt: [], example: '2026-12-31' },
      { name: 'NumeroUsos', type: 'int?', description: 'Usos maximos permitidos', filledAt: [], example: '100' },
      { name: 'Aplicados', type: 'int?', description: 'Usos ya aplicados', filledAt: [], example: '25' },
      { name: 'Vigente', type: 'bool', description: 'Si esta activo', filledAt: [], example: 'true' },
      { name: 'Observaciones', type: 'string', description: 'Descripcion del convenio', filledAt: [], example: 'Descuento campana mayo' },
    ]
  },
  'CSolicitudes': {
    name: 'CSolicitudes',
    displayName: 'Solicitudes (BD AGSSA)',
    description: 'Tabla principal en BD AGSSA - Corazon del sistema. En flujo Individual: CodInmobiliaria vacio, usa IdPolizaIndividual.',
    createdAt: 6,
    fields: [
      { name: 'IdSolicitud', type: 'long', description: 'ID de la solicitud (P_Crearsolicitud)', filledAt: [6], example: '67890' },
      { name: 'FechaSolicitud', type: 'DateTime?', description: 'Fecha de radicacion', filledAt: [6], example: '2026-05-21' },
      { name: 'Estado', type: 'string', description: 'Estado actual de la solicitud', filledAt: [6, 7, 8, 9, 10, 11], example: 'Radicada → Analisis → Contrato...' },
      { name: 'CodInmobiliaria', type: 'string', description: 'VACIO en Individual (sin inmobiliaria)', filledAt: [], example: '(vacio)' },
      { name: 'IdArrendador', type: 'long?', description: 'ID del propietario/arrendador', filledAt: [6], example: '2001' },
      { name: 'IdArrendatario', type: 'long?', description: 'ID del inquilino', filledAt: [6], example: '1001' },
      { name: 'IdInmueble', type: 'long?', description: 'ID del inmueble', filledAt: [6], example: '7001' },
      { name: 'IdCodeudor', type: 'long?', description: 'ID del codeudor (si aplica)', filledAt: [6], example: '5001' },
      { name: 'IdAnalisis', type: 'long?', description: 'Referencia a analisis de riesgo', filledAt: [7], example: '5001' },
      { name: 'IdContrato', type: 'long?', description: 'ID del contrato generado', filledAt: [8], example: '3001' },
      { name: 'IdPolizaIndividual', type: 'long?', description: 'Poliza INDIVIDUAL (flujo sin inmobiliaria)', filledAt: [9], example: '9001' },
      { name: 'IdPolizaColectiva', type: 'long?', description: 'NULL en flujo Individual', filledAt: [], example: 'NULL' },
      { name: 'NumeroPoliza', type: 'string', description: 'Numero de poliza SURA', filledAt: [9], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero de riesgo SURA', filledAt: [9], example: '987654' },
      { name: 'IdSiniestro', type: 'long?', description: 'ID de siniestro (si hay mora)', filledAt: [10], example: '2001' },
      { name: 'TipoGarantia', type: 'int', description: '1=Fianza, 2=Fiducuenta, 3=Sin garantias', filledAt: [6], example: '1' },
      { name: 'UsuAnalista', type: 'string', description: 'Usuario analista asignado', filledAt: [7], example: 'mrodriguez' },
      { name: 'UsuContrato', type: 'string', description: 'Usuario ejecutivo contrato', filledAt: [8], example: 'lgomez' },
      { name: 'FechaIniAnalisis', type: 'DateTime?', description: 'Inicio del analisis', filledAt: [7], example: '2026-05-22 09:00' },
      { name: 'FechaFinAnalisis', type: 'DateTime?', description: 'Fin del analisis', filledAt: [7], example: '2026-05-22 11:30' },
      { name: 'FechaIniContrato', type: 'DateTime?', description: 'Inicio generacion contrato', filledAt: [8], example: '2026-05-23 10:00' },
      { name: 'FechaFinContrato', type: 'DateTime?', description: 'Fin generacion contrato', filledAt: [8], example: '2026-05-23 15:00' },
      { name: 'ValorEstudio', type: 'int', description: 'Valor del estudio ($35,000)', filledAt: [6], example: '35000' },
      { name: 'NroCodeudores', type: 'int', description: 'Cantidad de codeudores', filledAt: [6], example: '1' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones generales', filledAt: [6, 7, 8, 9, 10, 11], example: 'Notas...' },
    ]
  },
  'CArrendatario': {
    name: 'CArrendatario',
    displayName: 'Arrendatario/Inquilino (BD AGSSA)',
    description: 'Datos completos del inquilino en BD AGSSA permanente',
    createdAt: 6,
    fields: [
      { name: 'IdArrendatario', type: 'long', description: 'ID del arrendatario', filledAt: [6], example: '1001' },
      { name: 'TipoPersona', type: 'string', description: 'Natural o Juridica', filledAt: [6], example: 'Natural' },
      { name: 'NombresRazonSocial', type: 'string', description: 'Nombres o razon social', filledAt: [6], example: 'JUAN CARLOS' },
      { name: 'Apellidos', type: 'string', description: 'Apellidos', filledAt: [6], example: 'PEREZ GOMEZ' },
      { name: 'TipoDocumento', type: 'string', description: 'CC, CE, NIT, etc.', filledAt: [6], example: 'CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero de identificacion', filledAt: [6], example: '1234567890' },
      { name: 'Telefono', type: 'long?', description: 'Telefono fijo', filledAt: [6], example: '6011234567' },
      { name: 'Celular', type: 'long?', description: 'Telefono movil', filledAt: [6], example: '3001234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [6], example: 'juan@email.com' },
      { name: 'Sexo', type: 'string', description: 'M o F', filledAt: [6], example: 'M' },
      { name: 'FechaNacimiento', type: 'DateTime?', description: 'Fecha de nacimiento', filledAt: [6], example: '1990-01-15' },
      { name: 'FechaValidacion', type: 'DateTime?', description: 'Fecha validacion TruValidate', filledAt: [6], example: '2026-05-21 10:45' },
      { name: 'ClienteConsultable', type: 'bool?', description: 'En lista negra SURA (del motor)', filledAt: [7], example: 'false' },
      { name: 'Suplantacion', type: 'bool?', description: 'Indicador suplantacion', filledAt: [7], example: 'false' },
      { name: 'CiudadNacimiento', type: 'string', description: 'Ciudad de nacimiento', filledAt: [6], example: 'BOGOTA' },
      { name: 'Nacionalidad', type: 'string', description: 'Nacionalidad', filledAt: [6], example: 'COLOMBIANA' },
      { name: 'PersonasCargo', type: 'int?', description: 'Personas a cargo', filledAt: [6], example: '2' },
    ]
  },
  'CArrendador': {
    name: 'CArrendador',
    displayName: 'Arrendador/Propietario (BD AGSSA)',
    description: 'Datos del propietario del inmueble en BD AGSSA',
    createdAt: 6,
    fields: [
      { name: 'IdArrendador', type: 'long', description: 'ID del propietario', filledAt: [6], example: '2001' },
      { name: 'TipoPersona', type: 'string', description: 'Natural o Juridica', filledAt: [6], example: 'Natural' },
      { name: 'Nombre', type: 'string', description: 'Nombre completo', filledAt: [6], example: 'PEDRO RODRIGUEZ' },
      { name: 'TipoDocumento', type: 'string', description: 'CC, CE, NIT', filledAt: [6], example: 'CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero de documento', filledAt: [6], example: '9876543210' },
      { name: 'Direccion', type: 'string', description: 'Direccion de contacto', filledAt: [6], example: 'Cra 80 # 50-30' },
      { name: 'Telefono', type: 'long?', description: 'Telefono fijo', filledAt: [6], example: '6019876543' },
      { name: 'Celular', type: 'long?', description: 'Telefono movil', filledAt: [6], example: '3201234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [6], example: 'pedro@email.com' },
      { name: 'ClienteConsultable', type: 'bool?', description: 'En lista negra SURA', filledAt: [7], example: 'false' },
    ]
  },
  'CInmueble': {
    name: 'CInmueble',
    displayName: 'Inmueble (BD AGSSA)',
    description: 'Datos del inmueble a arrendar en BD AGSSA permanente',
    createdAt: 6,
    fields: [
      { name: 'IdInmueble', type: 'long', description: 'ID del inmueble', filledAt: [6], example: '7001' },
      { name: 'Direccion', type: 'string', description: 'Direccion completa', filledAt: [6], example: 'Calle 100 # 15-20 Apto 501' },
      { name: 'Ciudad', type: 'string', description: 'Ciudad', filledAt: [6], example: 'BOGOTA' },
      { name: 'Departamento', type: 'string', description: 'Departamento', filledAt: [6], example: 'CUNDINAMARCA' },
      { name: 'Destinacion', type: 'string', description: 'Vivienda o Comercio', filledAt: [6], example: 'Vivienda' },
      { name: 'TipoInmueble', type: 'string', description: 'Apartamento, Casa, Oficina', filledAt: [6], example: 'Apartamento' },
      { name: 'CanonArrendamiento', type: 'long?', description: 'Valor canon mensual', filledAt: [6], example: '2500000' },
      { name: 'CuotaAdmon', type: 'long?', description: 'Cuota administracion', filledAt: [6], example: '350000' },
      { name: 'Estrato', type: 'int?', description: 'Estrato socioeconomico', filledAt: [6], example: '4' },
      { name: 'CodInmobiliaria', type: 'string', description: 'VACIO en flujo Individual', filledAt: [], example: '(vacio)' },
    ]
  },
  'CAnalisis': {
    name: 'CAnalisis',
    displayName: 'Analisis de Riesgo (BD AGSSA)',
    description: 'Resultado del motor de decision ejecutado automaticamente',
    createdAt: 7,
    fields: [
      { name: 'IdAnalisis', type: 'long', description: 'ID del analisis', filledAt: [7], example: '5001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [7], example: '67890' },
      { name: 'IdConceptoString', type: 'string', description: 'Resultado: APROBADO/NEGADO/ESTUDIO', filledAt: [7], example: 'APROBADO' },
      { name: 'FechaConcepto', type: 'DateTime?', description: 'Fecha del concepto', filledAt: [7], example: '2026-05-22' },
      { name: 'RiesgoConsultable', type: 'string', description: 'Consulta API SURA: S/N', filledAt: [7], example: 'N' },
      { name: 'DetalleRiesgoConsultable', type: 'string', description: 'Detalle de la consulta SURA', filledAt: [7], example: 'Sin reportes negativos' },
      { name: 'PorcentajeEndeudamiento', type: 'long?', description: '% de endeudamiento', filledAt: [7], example: '25' },
      { name: 'NroObligacion', type: 'long?', description: 'Obligaciones en centrales', filledAt: [7], example: '2' },
      { name: 'EntidadReporte', type: 'string', description: 'Entidad que reporta', filledAt: [7], example: 'Banco XYZ' },
      { name: 'EntidadMonto', type: 'long?', description: 'Monto reportado', filledAt: [7], example: '5000000' },
      { name: 'AlertaContratos', type: 'string', description: 'Alerta contratos previos', filledAt: [7], example: 'Sin alertas' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones del analista', filledAt: [7], example: 'Cliente con buen historial' },
      { name: 'PlanArrendamiento', type: 'string', description: 'Plan asignado', filledAt: [7], example: 'Plan Clasico' },
      { name: 'LimiteIndemni', type: 'string', description: 'Limite de indemnizacion', filledAt: [7], example: '12 canones' },
    ]
  },
  'CContrato': {
    name: 'CContrato',
    displayName: 'Contrato (BD AGSSA)',
    description: 'Contrato de arrendamiento con clausulas de seguro',
    createdAt: 8,
    fields: [
      { name: 'IdContrato', type: 'long', description: 'ID del contrato', filledAt: [8], example: '3001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [8], example: '67890' },
      { name: 'IdEstadoContrato', type: 'string', description: 'Borrador → Enviado → Firmado', filledAt: [8, 9], example: 'Borrador' },
      { name: 'Vigencia', type: 'int', description: 'Vigencia en meses', filledAt: [8], example: '12' },
      { name: 'CanonArrendamiento', type: 'decimal', description: 'Canon mensual', filledAt: [8], example: '2500000' },
      { name: 'CuotaAdmon', type: 'decimal', description: 'Cuota administracion', filledAt: [8], example: '350000' },
      { name: 'ValorPrima', type: 'decimal', description: 'Prima del seguro', filledAt: [8], example: '450000' },
      { name: 'TasaAplicada', type: 'decimal', description: 'Tasa de prima %', filledAt: [8], example: '1.5' },
      { name: 'FechaRiesgo', type: 'DateTime?', description: 'Inicio vigencia riesgo', filledAt: [9], example: '2026-06-01' },
      { name: 'FechaIniPoliza', type: 'DateTime?', description: 'Inicio poliza', filledAt: [9], example: '2026-06-01' },
      { name: 'FechaFinPoliza', type: 'DateTime?', description: 'Fin poliza', filledAt: [9], example: '2027-05-31' },
      { name: 'FechaPagoPoliza', type: 'DateTime?', description: 'Fecha pago poliza SIPRO', filledAt: [9], example: '2026-05-25' },
      { name: 'PagoPoliza', type: 'string', description: 'Estado pago: PENDIENTE/PAGADO', filledAt: [9], example: 'PAGADO' },
      { name: 'ServiciosPublicos', type: 'bool', description: 'Cobertura serv. publicos', filledAt: [8], example: 'true' },
      { name: 'DanosFaltantes', type: 'bool', description: 'Cobertura danos', filledAt: [8], example: 'true' },
      { name: 'ZohoRequestId', type: 'string?', description: 'ID solicitud ZohoSign', filledAt: [8], example: 'ZH-123456' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [8, 9], example: 'Contrato generado...' },
    ]
  },
  'CPolizaIndividual': {
    name: 'CPolizaIndividual',
    displayName: 'Poliza Individual (BD AGSSA)',
    description: 'Poliza individual del cliente (flujo sin inmobiliaria)',
    createdAt: 9,
    fields: [
      { name: 'IdPolizaIndividual', type: 'long', description: 'ID de la poliza individual', filledAt: [9], example: '9001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [9], example: '67890' },
      { name: 'NumeroPoliza', type: 'string', description: 'Numero poliza SURA', filledAt: [9], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero riesgo SURA', filledAt: [9], example: '987654' },
      { name: 'FechaEmision', type: 'DateTime?', description: 'Fecha emision poliza', filledAt: [9], example: '2026-05-25' },
      { name: 'FechaInicioVigencia', type: 'DateTime?', description: 'Inicio vigencia', filledAt: [9], example: '2026-06-01' },
      { name: 'FechaFinVigencia', type: 'DateTime?', description: 'Fin vigencia', filledAt: [9], example: '2027-05-31' },
      { name: 'ValorPrima', type: 'decimal', description: 'Valor de la prima', filledAt: [9], example: '450000' },
      { name: 'Estado', type: 'string', description: 'ACTIVA, VENCIDA, CANCELADA', filledAt: [9, 11], example: 'ACTIVA' },
      { name: 'LimiteIndemnizacion', type: 'decimal', description: 'Limite maximo', filledAt: [9], example: '30000000' },
      { name: 'PlanSeguro', type: 'string', description: 'Plan: Clasico, Global', filledAt: [9], example: 'Clasico' },
    ]
  },
  'CSiniestro': {
    name: 'CSiniestro',
    displayName: 'Siniestro/Reclamacion (BD AGSSA)',
    description: 'Registro de siniestros cuando inquilino entra en mora',
    createdAt: 10,
    fields: [
      { name: 'IdSiniestro', type: 'long', description: 'ID del siniestro', filledAt: [10], example: '2001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [10], example: '67890' },
      { name: 'FechaSiniestro', type: 'DateTime', description: 'Fecha del siniestro (mora)', filledAt: [10], example: '2026-08-15' },
      { name: 'FechaRadicacion', type: 'DateTime', description: 'Fecha radicacion reclamo', filledAt: [10], example: '2026-08-20' },
      { name: 'NroPoliza', type: 'string', description: 'Numero de poliza', filledAt: [10], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero de riesgo', filledAt: [10], example: '987654' },
      { name: 'TotalDeuda', type: 'decimal', description: 'Deuda total acumulada', filledAt: [10], example: '7500000' },
      { name: 'MesesMora', type: 'int', description: 'Meses en mora', filledAt: [10], example: '3' },
      { name: 'IdEstadoSiniestro', type: 'int', description: 'Estado del proceso', filledAt: [10], example: '1=Radicado' },
      { name: 'PlanSeguro', type: 'string', description: 'Plan de seguro aplicado', filledAt: [10], example: 'Clasico' },
      { name: 'LimiteIndemnizacion', type: 'decimal', description: 'Limite maximo a pagar', filledAt: [10], example: '30000000' },
      { name: 'AutorizaIndemnizacion', type: 'bool', description: 'Autorizado para pago', filledAt: [10], example: 'true' },
      { name: 'InmuebleRestituido', type: 'bool', description: 'Inmueble devuelto', filledAt: [10], example: 'false' },
      { name: 'FechaPosesion', type: 'DateTime?', description: 'Fecha restitucion', filledAt: [10], example: '2026-09-01' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones del caso', filledAt: [10], example: 'Mora de 3 meses...' },
    ]
  },
  'CRenovacion': {
    name: 'CRenovacion',
    displayName: 'Renovacion (BD AGSSA)',
    description: 'Renovacion de contratos y polizas individuales',
    createdAt: 11,
    fields: [
      { name: 'IdRenovacion', type: 'long', description: 'ID de renovacion', filledAt: [11], example: '4001' },
      { name: 'IdSolicitud', type: 'long', description: 'Solicitud original', filledAt: [11], example: '67890' },
      { name: 'Estado', type: 'string', description: 'Estado de renovacion', filledAt: [11], example: 'PENDIENTE' },
      { name: 'Vlr_CanonArrendamiento', type: 'decimal', description: 'Nuevo canon', filledAt: [11], example: '2650000' },
      { name: 'Vlr_Administracion', type: 'decimal', description: 'Nueva admon', filledAt: [11], example: '370000' },
      { name: 'Incremento', type: 'decimal', description: 'Incremento % (IPC)', filledAt: [11], example: '6' },
      { name: 'FechaInicioPoliza', type: 'DateTime', description: 'Inicio nueva poliza', filledAt: [11], example: '2027-06-01' },
      { name: 'FechaFinPoliza', type: 'DateTime', description: 'Fin nueva poliza', filledAt: [11], example: '2028-05-31' },
      { name: 'VigenciaEnMeses', type: 'int', description: 'Vigencia', filledAt: [11], example: '12' },
      { name: 'NroPoliza', type: 'string', description: 'Nuevo numero poliza', filledAt: [11], example: '123456790' },
      { name: 'TotalPagar', type: 'decimal', description: 'Total a pagar', filledAt: [11], example: '480000' },
      { name: 'Prima', type: 'decimal', description: 'Nueva prima anual', filledAt: [11], example: '480000' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [11], example: 'Renovacion anual' },
    ]
  },
};

// Definicion de las etapas del flujo INDIVIDUAL (sin inmobiliaria)
// Corresponde al stepper de la pagina: 1.Info General → 2.Confirmacion → 3.Pago → 4.Validacion
const flowSteps: FlowStep[] = [
  {
    id: 0,
    name: 'Paso 1: Llenado del Formulario',
    shortName: '1.Llenar',
    description: 'Usuario llena el formulario de informacion general (datos en MEMORIA del navegador)',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-900/30',
    borderColor: 'border-slate-400',
    trigger: 'Inquilino accede a radicacion.arriendeseguro.com',
    actor: 'Inquilino (Arrendatario)',
    tables: [],
    details: [
      '*** AUN NO SE GUARDA NADA EN BD ***',
      'Los datos estan solo en memoria del navegador',
      '',
      '--- SECCIONES DEL FORMULARIO ---',
      '• Tipo persona: Natural o Juridica',
      '• Tipo documento: CC, CE, Pasaporte, NIT',
      '• Datos personales: Documento, Nombres, Apellidos, Email, Celular, Fecha nacimiento',
      '• Actividad economica: Independiente/Pensionado/Empleado/Empresa',
      '• Si Empleado: Compania, Cargo',
      '• Referencias: 1 familiar + 1 personal (nombre, celular)',
      '• Datos inmueble: Tipo, Canon, Administracion, Direccion, Ciudad',
      '• Datos propietario: Nombre, Documento, Celular, Email',
      '',
      '--- SECCIONES CONDICIONALES ---',
      '• Si TipoPersona=Juridica → Datos del Representante Legal',
      '• Si TipoGarantia=Fiducuenta → Datos del Codeudor de Garantia',
      '• Codeudor adicional (si aplica)',
    ]
  },
  {
    id: 1,
    name: 'Paso 1: Guardar Info General',
    shortName: '1.Guardar',
    description: 'Al hacer clic en "Continuar" se envian los datos al servidor y se guardan en BD RADICACIONES',
    icon: <Database className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
    trigger: 'Usuario hace clic en boton "Continuar" al final de la pagina',
    actor: 'Sistema (POST al servidor)',
    tables: ['TRadicacione', 'TInformacionBasica', 'TActividadEconomica', 'TReferencia', 'TInmueble', 'TPropietario'],
    details: [
      '*** MOMENTO DEL INSERT EN BD RADICACIONES ***',
      '',
      '--- FLUJO TECNICO ---',
      '1. JavaScript valida campos requeridos en el navegador',
      '2. Si todo OK → POST a /Home/GuardarRadicacion',
      '3. Controller recibe DTO con todos los datos',
      '4. Entity Framework inserta en las tablas:',
      '',
      '--- TABLAS QUE SE CREAN ---',
      'TRadicacione: registro principal con TokenAcceso unico',
      'TInformacionBasica: datos del inquilino (IdTipoInterviniente=1)',
      'TActividadEconomica: situacion laboral',
      'TReferencia: 2 registros (familiar + personal)',
      'TInmueble: datos del inmueble',
      'TPropietario: datos del arrendador',
      '',
      '--- CONDICIONALES ---',
      'Si Juridica → TRepresentanteLegal',
      'Si Fiducuenta → TCodeudorGarantium',
      'Si tiene Codeudor → otro TInformacionBasica (IdTipoInterviniente=2)',
    ]
  },
  {
    id: 2,
    name: 'Paso 2: Confirmacion',
    shortName: '2.Confirmar',
    description: 'Usuario revisa todos los datos ingresados antes de proceder al pago',
    icon: <CheckCircle2 className="w-5 h-5" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-500',
    trigger: 'Datos guardados exitosamente, redirige a pagina de confirmacion',
    actor: 'Inquilino (Arrendatario)',
    tables: [],
    details: [
      '*** NO HAY GUARDADO EN ESTA ETAPA ***',
      'Solo lectura de los datos ya guardados',
      '',
      '--- LO QUE VE EL USUARIO ---',
      '• Resumen de datos del inquilino',
      '• Resumen de datos del inmueble',
      '• Resumen de datos del propietario',
      '• Valor del estudio: $35,000 COP',
      '',
      '--- OPCIONES ---',
      '• Boton "Editar" → vuelve al formulario',
      '• Boton "Continuar al Pago" → avanza al paso 3',
      '',
      '--- NOTA ---',
      'Si el usuario cierra la pagina aqui, los datos YA estan en BD',
      'Puede retomar despues con el link del token',
    ]
  },
  {
    id: 3,
    name: 'Paso 3: Datos de Facturacion',
    shortName: '3.Factura',
    description: 'Usuario ingresa datos para la factura del pago de estudio',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-500',
    trigger: 'Usuario hace clic en "Continuar al Pago"',
    actor: 'Inquilino (Arrendatario)',
    tables: ['TFacturacion'],
    details: [
      '*** SE GUARDA TFacturacion ***',
      '',
      '--- CAMPOS DEL FORMULARIO ---',
      '• Nombre para factura',
      '• Tipo documento',
      '• Numero documento',
      '• Email (donde llega la factura)',
      '• Celular',
      '• Direccion',
      '',
      '--- CODIGO DE CONVENIO (OPCIONAL) ---',
      '• Si ingresa codigo → valida contra TConvenio',
      '• Si es valido → aplica descuento al Total',
      '• Subtotal: $29,412 + IVA: $5,588 = Total: $35,000',
      '',
      '--- GUARDADO ---',
      'Al hacer clic en "Pagar" se guarda TFacturacion',
      'Luego se abre el modal de Wompi',
    ]
  },
  {
    id: 4,
    name: 'Paso 3: Pago Wompi',
    shortName: '3.Pagar',
    description: 'Procesamiento del pago via pasarela Wompi ($35,000 COP)',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
    trigger: 'Se abre modal de Wompi con el monto a pagar',
    actor: 'Inquilino + Wompi',
    tables: ['TPago'],
    details: [
      '*** SE GUARDA TPago (via Webhook) ***',
      '',
      '--- METODOS DE PAGO ---',
      '• Tarjeta de credito/debito',
      '• PSE (transferencia bancaria)',
      '• Nequi',
      '',
      '--- FLUJO TECNICO ---',
      '1. Modal Wompi se abre con referencia unica',
      '2. Usuario completa el pago en Wompi',
      '3. Wompi envia WEBHOOK a /api/wompi/',
      '4. Servidor valida firma SHA256',
      '5. Si Estado=APPROVED → INSERT en TPago',
      '',
      '--- ESTADOS POSIBLES ---',
      '✓ APPROVED: Pago exitoso → continua a validacion',
      '✗ DECLINED: Rechazado → puede reintentar',
      '⏳ PENDING: Pendiente (PSE) → espera confirmacion',
      '✗ VOIDED: Anulado',
      '',
      '--- REFERENCIA ---',
      'Formato: {IdRadicacion}-{timestamp}',
      'Ej: 12345-1621234567890',
    ]
  },
  {
    id: 5,
    name: 'Paso 4: Validacion de Identidad',
    shortName: '4.Validar',
    description: 'Verificar que el usuario es quien dice ser (3 metodos en cascada)',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-violet-600 dark:text-violet-400',
    bgColor: 'bg-violet-100 dark:bg-violet-900/30',
    borderColor: 'border-violet-500',
    trigger: 'Pago confirmado como APPROVED',
    actor: 'Inquilino + TruValidate + MasivApp',
    tables: ['TValidacionesIdentidad'],
    details: [
      '*** SE GUARDA TValidacionesIdentidad (cada intento) ***',
      '',
      '========================================',
      '   ORDEN DE VALIDACION (en cascada)',
      '========================================',
      '',
      '┌─────────────────────────────────────┐',
      '│  METODO 1: OTP (codigo por SMS)    │',
      '└─────────────────────────────────────┘',
      '  1. Sistema muestra pantalla "Ingresa el codigo"',
      '  2. MasivApp envia SMS al celular: "Tu codigo es 4829"',
      '  3. Usuario ingresa los 4 digitos',
      '  4. TruValidate verifica si es correcto',
      '',
      '  ✓ Codigo correcto → EXITO (termina validacion)',
      '  ✗ Codigo incorrecto → puede reintentar',
      '  ✗ Supera 3 intentos → PASA A METODO 2',
      '',
      '┌─────────────────────────────────────┐',
      '│  METODO 2: BIOMETRIA (fotos)       │',
      '│  * Requiere celular (no PC)        │',
      '└─────────────────────────────────────┘',
      '  1. Foto de cedula FRENTE (con camara del cel)',
      '  2. Foto de cedula REVERSO',
      '  3. TruValidate extrae datos con OCR',
      '  4. Foto SELFIE del rostro',
      '  5. TruValidate compara: ¿selfie = foto cedula?',
      '',
      '  ✓ Rostros coinciden → EXITO (termina validacion)',
      '  ✗ No coinciden → puede reintentar',
      '  ✗ Supera intentos → PASA A METODO 3',
      '',
      '┌─────────────────────────────────────┐',
      '│  METODO 3: FORMULARIO MANUAL       │',
      '│  * Ultimo recurso, siempre funciona│',
      '└─────────────────────────────────────┘',
      '  1. Usuario sube: fotos/PDF de cedula',
      '  2. Usuario sube: formulario de validacion firmado',
      '  3. Sistema une todo en un PDF',
      '  4. Se guarda para REVISION MANUAL posterior',
      '',
      '  ✓ Siempre permite continuar el proceso',
      '  ⚠ PERO queda pendiente revision por humano',
      '',
      '========================================',
      '   SERVICIOS INVOLUCRADOS',
      '========================================',
      '',
      '• TruValidate (TransUnion): El "cerebro"',
      '  - Genera y valida codigos OTP',
      '  - Procesa fotos con OCR',
      '  - Compara rostros (biometria)',
      '',
      '• MasivApp: El "mensajero"',
      '  - Envia el SMS con el codigo OTP',
      '',
      '========================================',
      '   VALIDACIONES AUTOMATICAS (ocultas)',
      '========================================',
      'TruValidate ejecuta en segundo plano:',
      '• VelocityCheck: detecta fraude por velocidad',
      '• IDV: verifica cedula vs bases oficiales',
      '• SimSwap: ¿cambiaron SIM recientemente?',
    ]
  },
  {
    id: 6,
    name: 'Sincronizacion a AGSSA',
    shortName: 'Sync',
    description: 'Sistema sincroniza datos de BD RADICACIONES a BD AGSSA (automatico)',
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
    trigger: 'Validacion de identidad completada exitosamente',
    actor: 'Sistema (WCF Automatico)',
    tables: ['TRadicacione', 'CSolicitudes', 'CArrendatario', 'CInmueble', 'CArrendador'],
    details: [
      '*** PUNTO DE SINCRONIZACION BD TEMPORAL → BD PERMANENTE ***',
      '',
      '--- LLAMADA WCF ---',
      'Servicio: ExternalSolutionService.CrearSolicitudAsync()',
      'URL: http://186.31.31.18:80/ExternalSolutionService.svc',
      '',
      '--- LO QUE HACE EL WCF ---',
      '1. Lee datos de BD RADICACIONES',
      '2. Ejecuta SP P_Crearsolicitud en BD AGSSA',
      '3. Crea registros en:',
      '   • CSolicitudes (solicitud principal)',
      '   • CArrendatario (inquilino)',
      '   • CInmueble (inmueble)',
      '   • CArrendador (propietario)',
      '   • CCodeudor (si aplica)',
      '',
      '--- ACTUALIZACION EN BD RADICACIONES ---',
      'TRadicacione.IdAgssa = ID generado en AGSSA',
      'Esto vincula ambos registros',
      '',
      '--- NOTA IMPORTANTE ---',
      'CodInmobiliaria = VACIO (flujo Individual)',
      'IdPolizaColectiva = NULL (usa IdPolizaIndividual)',
    ]
  },
  {
    id: 7,
    name: 'Analisis de Riesgo',
    shortName: 'Analisis',
    description: 'Motor de decision evalua riesgo automaticamente, analista revisa si es necesario',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-500',
    trigger: 'Sincronizacion completada, motor ejecutado automaticamente',
    actor: 'Sistema + Analista de Riesgo (AGSSAsura)',
    tables: ['CSolicitudes', 'CAnalisis', 'CArrendatario'],
    details: [
      '*** SE CREA CAnalisis ***',
      '',
      '--- MOTOR DE DECISION (AUTOMATICO) ---',
      '1. Se ejecuta inmediatamente despues del sync',
      '2. Consulta API SURA: lista negra (RiesgoConsultable)',
      '3. Valida rango de canon aplicable ($1.5M - $8M)',
      '4. Genera resultado automatico',
      '',
      '--- RESULTADOS POSIBLES ---',
      '✓ APROBADO: Pasa directo a generacion de contrato',
      '✗ NEGADO: Se rechaza la solicitud',
      '⚠ ESTUDIO: Requiere revision manual del analista',
      '',
      '--- SI RESULTADO = ESTUDIO ---',
      'Analista revisa en Analisis_11.aspx',
      'Puede aprobar, negar o solicitar mas info',
      '',
      '--- ACTUALIZACION BD ---',
      'CSolicitudes.IdAnalisis = ID del analisis',
      'CArrendatario.ClienteConsultable = resultado SURA',
    ]
  },
  {
    id: 8,
    name: 'Generacion de Contrato',
    shortName: 'Contrato',
    description: 'Ejecutivo genera contrato de arrendamiento con firma electronica ZohoSign',
    icon: <FileSignature className="w-5 h-5" />,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'border-teal-500',
    trigger: 'Solicitud APROBADA en analisis de riesgo',
    actor: 'Ejecutivo de Contratos (AGSSAsura)',
    tables: ['CSolicitudes', 'CContrato'],
    details: [
      '*** SE CREA CContrato ***',
      '',
      '--- ASIGNACION ---',
      'SP P_AsignarEjecutivoP12 asigna ejecutivo',
      'Pagina: Contratos_13.aspx',
      '',
      '--- GENERACION DOCUMENTO ---',
      '1. Selecciona tipo: Vivienda o Comercio',
      '2. Define coberturas (servicios publicos, danos)',
      '3. Calcula prima del seguro',
      '4. Genera PDF con iTextSharp',
      '',
      '--- FIRMA ELECTRONICA (ZohoSign) ---',
      '1. Envia documento a ZohoSign via API',
      '2. Identifica firmantes: Propietario, Inquilino, Codeudor',
      '3. Firmantes reciben email con link',
      '4. Firman digitalmente en plataforma Zoho',
      '5. Webhook notifica firma completada',
      '6. PDF firmado se guarda en AWS S3',
      '',
      '--- ACTUALIZACION BD ---',
      'CSolicitudes.IdContrato = ID del contrato',
      'CContrato.IdEstadoContrato = "Firmado"',
    ]
  },
  {
    id: 9,
    name: 'Activacion de Poliza Individual',
    shortName: 'Poliza',
    description: 'Cliente paga poliza en SIPRO (SURA) y se activa la cobertura',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-500',
    trigger: 'Contrato firmado por todas las partes',
    actor: 'Cliente + Promotora + Sistema SIPRO (SURA)',
    tables: ['CSolicitudes', 'CContrato', 'CPolizaIndividual'],
    details: [
      '*** SE CREA CPolizaIndividual ***',
      '',
      '--- PAGO DE POLIZA ---',
      '• NO es el mismo pago de $35,000 (ese fue el estudio)',
      '• Este es el pago de la PRIMA del seguro',
      '• Se paga en SIPRO (sistema de SURA via VPN)',
      '• Promotora debe verificar manualmente en SIPRO',
      '',
      '--- ACTIVACION ---',
      '1. Promotora confirma pago en SIPRO',
      '2. Se crea registro CPolizaIndividual',
      '3. Se asigna NumeroPoliza SURA',
      '4. Se asigna NumeroRiesgo SURA',
      '5. Se registran fechas de vigencia (12 meses)',
      '',
      '--- ACTUALIZACION BD ---',
      'CSolicitudes.IdPolizaIndividual = ID poliza',
      'CSolicitudes.NumeroPoliza = numero SURA',
      'CContrato.PagoPoliza = "PAGADO"',
      '',
      '--- ESTADO FINAL ---',
      'Estado: "Vigente" - Cobertura ACTIVA',
      'El propietario ya esta protegido',
    ]
  },
  {
    id: 10,
    name: 'Siniestro (si aplica)',
    shortName: 'Siniestro',
    description: 'Si el inquilino deja de pagar arriendo, propietario radica reclamacion',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-500',
    trigger: 'Inquilino en mora (no paga arriendo)',
    actor: 'Propietario + Area de Siniestros (AGSSAsura)',
    tables: ['CSolicitudes', 'CSiniestro'],
    details: [
      '*** SE CREA CSiniestro ***',
      '',
      '--- REPORTE DEL SINIESTRO ---',
      '1. Propietario reporta mora del inquilino',
      '2. Area de siniestros crea registro',
      '3. Se asigna ejecutivo de siniestros',
      '',
      '--- PROCESO ---',
      '• Se calcula deuda total acumulada',
      '• Se verifican documentos soporte',
      '• Se evalua cobertura de la poliza',
      '• Si aplica: proceso de cobro juridico',
      '',
      '--- INDEMNIZACION ---',
      '• Segun limite de poliza individual',
      '• Maximo: 12 canones generalmente',
      '• Se paga al propietario (beneficiario)',
      '',
      '--- ESTADOS ---',
      'ABIERTO → EN_ESTUDIO → APROBADO/RECHAZADO → CERRADO',
      '',
      '--- ACTUALIZACION BD ---',
      'CSolicitudes.IdSiniestro = ID siniestro',
    ]
  },
  {
    id: 11,
    name: 'Renovacion (si aplica)',
    shortName: 'Renovar',
    description: 'Al vencer la poliza (12 meses), se renueva contrato y poliza',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-500',
    trigger: '30-60 dias antes de vencimiento de poliza',
    actor: 'Auxiliar de Renovaciones (AGSSAsura)',
    tables: ['CRenovacion', 'CSolicitudes', 'CPolizaIndividual'],
    details: [
      '*** SE CREA CRenovacion ***',
      '',
      '--- DETECCION ---',
      'Sistema alerta automaticamente proximos vencimientos',
      'Pagina: Renovaciones_24.aspx',
      '',
      '--- PROCESO ---',
      '1. Contacto con propietario e inquilino',
      '2. Confirman si desean renovar',
      '3. Se calcula incremento del canon (IPC)',
      '4. Se genera nueva cotizacion de prima',
      '5. Cliente acepta condiciones',
      '',
      '--- PAGO ---',
      '• Pago de renovacion en SIPRO',
      '• Nueva prima por 12 meses',
      '',
      '--- RESULTADO ---',
      '• Nueva poliza individual emitida',
      '• Nuevas fechas de vigencia',
      '• CPolizaIndividual anterior → Estado "VENCIDA"',
      '',
      '--- ESTADOS RENOVACION ---',
      'PENDIENTE → CONTACTANDO → CONFIRMADA → COTIZADA → PAGADA → RENOVADA',
      'O: NO_RENUEVA (si no desean continuar)',
    ]
  },
];

// Estado inicial del formulario simulado
const initialFormState = {
  tipoPersona: '',
  tipoDocumento: '',
  documento: '',
  nombres: '',
  apellidos: '',
  email: '',
  celular: '',
  tipoActividad: '',
  canon: '',
  direccionInmueble: '',
};

export default function DataFlowView() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Estado del formulario simulado (etapa 0)
  const [formData, setFormData] = useState(initialFormState);

  const currentFlow = flowSteps[currentStep];

  // Handler para actualizar campos del formulario
  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Limpiar formulario
  const resetForm = () => {
    setFormData(initialFormState);
  };

  // Verificar si hay datos en el formulario
  const hasFormData = Object.values(formData).some(v => v !== '');

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
          Flujo de Datos - Poliza Individual
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ciclo de vida cuando el <strong>inquilino radica directamente</strong> en radicacion.arriendeseguro.com (sin inmobiliaria)
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

      {/* Form Simulator - Solo en etapa 0 */}
      {currentStep === 0 && (
        <div className="max-w-7xl mx-auto mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Simulador del Formulario
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
              (escribe para ver como los datos van a memoria)
            </span>
          </h3>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Formulario simulado */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">radicacion.arriendeseguro.com</span>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
                {/* Seccion: Datos Personales */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Datos del Inquilino
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Tipo Persona</label>
                      <select
                        value={formData.tipoPersona}
                        onChange={(e) => handleFormChange('tipoPersona', e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="Natural">Natural</option>
                        <option value="Juridica">Juridica</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Tipo Documento</label>
                      <select
                        value={formData.tipoDocumento}
                        onChange={(e) => handleFormChange('tipoDocumento', e.target.value)}
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seleccione...</option>
                        <option value="CC">Cedula Ciudadania</option>
                        <option value="CE">Cedula Extranjeria</option>
                        <option value="NIT">NIT</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Numero de Documento</label>
                    <input
                      type="text"
                      value={formData.documento}
                      onChange={(e) => handleFormChange('documento', e.target.value)}
                      placeholder="Ej: 1234567890"
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Nombres</label>
                      <input
                        type="text"
                        value={formData.nombres}
                        onChange={(e) => handleFormChange('nombres', e.target.value)}
                        placeholder="Ej: Juan Carlos"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Apellidos</label>
                      <input
                        type="text"
                        value={formData.apellidos}
                        onChange={(e) => handleFormChange('apellidos', e.target.value)}
                        placeholder="Ej: Perez Gomez"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" /> Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        placeholder="juan@email.com"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Celular
                      </label>
                      <input
                        type="text"
                        value={formData.celular}
                        onChange={(e) => handleFormChange('celular', e.target.value)}
                        placeholder="3001234567"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Seccion: Actividad Economica */}
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Actividad Economica
                  </h4>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Tipo de Actividad</label>
                    <select
                      value={formData.tipoActividad}
                      onChange={(e) => handleFormChange('tipoActividad', e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Empleado">Empleado</option>
                      <option value="Independiente">Independiente</option>
                      <option value="Pensionado">Pensionado</option>
                      <option value="Empresa">Empresa</option>
                    </select>
                  </div>
                </div>

                {/* Seccion: Inmueble */}
                <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Datos del Inmueble
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Canon Mensual
                      </label>
                      <input
                        type="text"
                        value={formData.canon}
                        onChange={(e) => handleFormChange('canon', e.target.value)}
                        placeholder="2500000"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">Direccion</label>
                      <input
                        type="text"
                        value={formData.direccionInmueble}
                        onChange={(e) => handleFormChange('direccionInmueble', e.target.value)}
                        placeholder="Calle 100 # 15-20"
                        className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Boton simulado */}
                <div className="pt-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={!hasFormData}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      hasFormData
                        ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continuar (Guardar en BD)
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Al hacer clic, los datos se enviaran al servidor
                  </p>
                </div>
              </div>
            </div>

            {/* Panel de Memoria */}
            <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300 font-mono">Memoria del Navegador</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-amber-400">NO guardado en BD</span>
                </div>
              </div>

              <div className="p-4 font-mono text-sm">
                <div className="text-gray-400 mb-2">// Estado React (useState)</div>
                <div className="text-purple-400">const</div>
                <div className="text-gray-300 ml-2">[formData, setFormData] = <span className="text-yellow-400">useState</span>({`{`}</div>

                <div className="ml-4 space-y-1">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-blue-300">{key}</span>
                      <span className="text-gray-500">: </span>
                      <span className={value ? 'text-green-400' : 'text-gray-600'}>
                        "{value || ''}"
                      </span>
                      <span className="text-gray-500">,</span>
                      {value && (
                        <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-1 rounded">
                          en memoria
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-gray-300">{`}`});</div>

                {/* Indicador visual */}
                <div className="mt-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-3 h-3 rounded-full ${hasFormData ? 'bg-amber-400 animate-pulse' : 'bg-gray-600'}`}></div>
                    <span className="text-gray-300 text-sm">
                      {hasFormData ? 'Datos en memoria temporal' : 'Sin datos aun'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Si cierras la pagina, se pierden
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      No estan en ninguna base de datos
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Solo existen en tu navegador
                    </div>
                  </div>
                </div>

                {/* Diagrama de flujo */}
                <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                  <div className="text-xs text-gray-400 mb-2">Flujo actual:</div>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                      Navegador
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                    <div className="px-2 py-1 bg-gray-700 text-gray-400 rounded border border-gray-600 opacity-50">
                      Servidor
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600" />
                    <div className="px-2 py-1 bg-gray-700 text-gray-400 rounded border border-gray-600 opacity-50">
                      BD
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables Grid - Solo para etapas > 0 */}
      {currentStep > 0 && getTablesForCurrentStep().length > 0 && (
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
      )}

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
