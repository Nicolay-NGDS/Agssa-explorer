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

// Datos de las tablas con sus campos - BD RADICACIONES (temporal) y BD AGSSA (permanente)
// Nomenclatura: T* = tablas en BD RADICACIONES, C* = tablas en BD AGSSA
const tableSchemas: Record<string, TableSchema> = {
  'TRadicacione': {
    name: 'TRadicacione',
    displayName: 'Radicacion (BD Temporal)',
    description: 'Tabla principal en BD RADICACIONES. En flujo Individual NO tiene TInmobiliarium ni TAsesore.',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'PK auto-generado', filledAt: [0], example: '12345' },
      { name: 'IdAgssa', type: 'long?', description: 'ID en AGSSA (se llena en sync)', filledAt: [2], example: '67890' },
      { name: 'IdTipoGarantia', type: 'int?', description: 'FK → TTipoGarantium (1=Fianza, 2=Fiducuenta, 3=Sin)', filledAt: [0], example: '1' },
      { name: 'FechaRegistro', type: 'DateTime', description: 'Fecha/hora creacion', filledAt: [0], example: '2026-05-21 10:30:00' },
      { name: 'IdEstado', type: 'int', description: 'FK → TTipoEstadoRadicacion', filledAt: [0, 1, 2], example: '1→2→3' },
      { name: 'TokenAcceso', type: 'Guid', description: 'Token unico acceso formulario', filledAt: [0], example: 'a1b2c3d4-e5f6-...' },
      { name: 'FechaToken', type: 'DateTime', description: 'Fecha generacion token', filledAt: [0], example: '2026-05-21 10:30:00' },
      { name: 'Observaciones', type: 'string?', description: 'Notas internas', filledAt: [0, 1, 2], example: 'Radicacion iniciada' },
      { name: '-- Relaciones --', type: '', description: '', filledAt: [], example: '' },
      { name: 'TInmobiliarium', type: 'null', description: 'NO APLICA flujo Individual', filledAt: [], example: 'NULL' },
      { name: 'TAsesore', type: 'null', description: 'NO APLICA flujo Individual', filledAt: [], example: 'NULL' },
      { name: 'TFacturacion', type: '1:1', description: 'Datos facturacion', filledAt: [1], example: 'Ver TFacturacion' },
      { name: 'TInmueble', type: '1:1', description: 'Datos inmueble', filledAt: [0], example: 'Ver TInmueble' },
      { name: 'TPropietario', type: '1:1', description: 'Datos propietario', filledAt: [0], example: 'Ver TPropietario' },
      { name: 'TInformacionBasicas', type: '1:N', description: 'Inquilino + Codeudores', filledAt: [0], example: 'Ver TInformacionBasica' },
    ]
  },
  'TInformacionBasica': {
    name: 'TInformacionBasica',
    displayName: 'Informacion Basica (BD Temporal)',
    description: 'Datos personales del inquilino y codeudor en BD RADICACIONES',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [0], example: '1001' },
      { name: 'IdRadicacion', type: 'long', description: 'FK a TRadicacione', filledAt: [0], example: '12345' },
      { name: 'IdTipoInterviniente', type: 'int', description: '1=Inquilino, 2=Codeudor', filledAt: [0], example: '1' },
      { name: 'IdTipoPersona', type: 'int', description: '1=Natural, 2=Juridica', filledAt: [0], example: '1' },
      { name: 'IdTipoIdentificacion', type: 'int', description: '1=CC, 2=CE, 5=NIT', filledAt: [0], example: '1' },
      { name: 'Identificacion', type: 'long', description: 'Numero de identificacion', filledAt: [0], example: '1234567890' },
      { name: 'Nombres', type: 'string', description: 'Nombres de la persona', filledAt: [0], example: 'JUAN CARLOS' },
      { name: 'PrimerApellido', type: 'string?', description: 'Primer apellido', filledAt: [0], example: 'PEREZ' },
      { name: 'SegundoApellido', type: 'string?', description: 'Segundo apellido', filledAt: [0], example: 'GOMEZ' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [0], example: 'juan@email.com' },
      { name: 'Celular', type: 'long', description: 'Telefono movil', filledAt: [0], example: '3001234567' },
      { name: 'FechaNacimiento', type: 'DateTime?', description: 'Fecha de nacimiento', filledAt: [0], example: '1990-01-15' },
      { name: 'FechaExpedicionDoc', type: 'DateTime?', description: 'Fecha expedicion documento', filledAt: [0], example: '2010-03-20' },
      { name: 'Direccion', type: 'string?', description: 'Direccion de residencia actual', filledAt: [0], example: 'Cra 50 # 10-20' },
      { name: 'IdCiudad', type: 'int?', description: 'Ciudad de residencia', filledAt: [0], example: '11001' },
      { name: 'Relacion', type: 'string?', description: 'Relacion con inquilino (solo codeudor)', filledAt: [0], example: 'Padre' },
      { name: 'CodeudorAdicional', type: 'bool?', description: 'Si requiere codeudor adicional', filledAt: [0], example: 'false' },
      { name: 'LinkValidacionIdentidad', type: 'string?', description: 'URL para validar identidad', filledAt: [1], example: 'https://...' },
    ]
  },
  'TActividadEconomica': {
    name: 'TActividadEconomica',
    displayName: 'Actividad Economica (BD Temporal)',
    description: 'Situacion laboral del inquilino. Responde a "¿Cual es la actividad economica?"',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TInformacionBasica', filledAt: [0], example: '1001' },
      { name: 'IdTipoActividad', type: 'int', description: '1=Independiente, 2=Pensionado, 3=Empleado, 4=Empresa', filledAt: [0], example: '3' },
      { name: 'Compania', type: 'string?', description: 'Nombre empresa donde trabaja (solo si Empleado)', filledAt: [0], example: 'Bancolombia' },
      { name: 'Ocupacion', type: 'string?', description: 'Profesion (ej: Medico, Abogado, Ingeniero)', filledAt: [0], example: 'Contador' },
      { name: 'Cargo', type: 'string?', description: 'Puesto de trabajo (ej: Gerente, Analista)', filledAt: [0], example: 'Analista Senior' },
      { name: 'PersonasACargo', type: 'int?', description: 'Cuantas personas dependen economicamente', filledAt: [0], example: '2' },
    ]
  },
  'TReferencia': {
    name: 'TReferencia',
    displayName: 'Referencias (BD Temporal)',
    description: 'Referencias personales y familiares del inquilino',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [0], example: '601' },
      { name: 'IdInfoBasica', type: 'long', description: 'FK a TInformacionBasica', filledAt: [0], example: '1001' },
      { name: 'IdTipoReferencia', type: 'int', description: 'FK a TTipoReferencia', filledAt: [0], example: '1=Familiar, 2=Personal' },
      { name: 'Nombre', type: 'string', description: 'Nombre completo', filledAt: [0], example: 'MARIA PEREZ' },
      { name: 'Celular', type: 'long', description: 'Telefono de contacto', filledAt: [0], example: '3109876543' },
    ]
  },
  'TInmueble': {
    name: 'TInmueble',
    displayName: 'Inmueble (BD Temporal)',
    description: 'Datos del inmueble a arrendar en BD RADICACIONES',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TRadicacione', filledAt: [0], example: '12345' },
      { name: 'IdTipoInmueble', type: 'int', description: 'FK a TTipoInmueble', filledAt: [0], example: '1=Apartamento' },
      { name: 'IdTipoPlanSeguro', type: 'int', description: 'FK a TTipoPlanSeguro', filledAt: [0], example: '1=Clasico' },
      { name: 'IdDestinacion', type: 'int', description: 'FK a TDestinacionInmueble', filledAt: [0], example: '1=Vivienda' },
      { name: 'Canon', type: 'long', description: 'Canon de arrendamiento', filledAt: [0], example: '2500000' },
      { name: 'Administracion', type: 'long?', description: 'Cuota administracion', filledAt: [0], example: '350000' },
      { name: 'Direccion', type: 'string?', description: 'Direccion del inmueble', filledAt: [0], example: 'Calle 100 # 15-20 Apto 501' },
      { name: 'IdCiudad', type: 'int?', description: 'FK a TTipoCiudade', filledAt: [0], example: '11001' },
      { name: 'IdDepartamento', type: 'int?', description: 'FK a TTipoDepartamento', filledAt: [0], example: '11' },
      { name: 'DetalleDestinacion', type: 'string?', description: 'Detalle uso comercial', filledAt: [0], example: 'Oficina' },
    ]
  },
  'TPropietario': {
    name: 'TPropietario',
    displayName: 'Propietario (BD Temporal)',
    description: 'Datos del propietario/arrendador ingresados por el inquilino',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TRadicacione', filledAt: [0], example: '12345' },
      { name: 'Nombres', type: 'string', description: 'Nombres del propietario', filledAt: [0], example: 'PEDRO' },
      { name: 'Apellidos', type: 'string?', description: 'Apellidos', filledAt: [0], example: 'RODRIGUEZ LOPEZ' },
      { name: 'IdTipoIdentificacion', type: 'int?', description: 'Tipo documento', filledAt: [0], example: '1=CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero documento', filledAt: [0], example: '9876543210' },
      { name: 'Celular', type: 'long?', description: 'Telefono contacto', filledAt: [0], example: '3201234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [0], example: 'pedro@email.com' },
    ]
  },
  'TFacturacion': {
    name: 'TFacturacion',
    displayName: 'Facturacion (BD Temporal)',
    description: 'Datos de facturacion para el pago del estudio',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TRadicacione', filledAt: [1], example: '12345' },
      { name: 'Nombre', type: 'string', description: 'Nombre para factura', filledAt: [1], example: 'JUAN CARLOS' },
      { name: 'Apellido', type: 'string?', description: 'Apellido para factura', filledAt: [1], example: 'PEREZ GOMEZ' },
      { name: 'IdTipoDocumento', type: 'int', description: 'FK a TTipoDocumento', filledAt: [1], example: '1=CC' },
      { name: 'Identificacion', type: 'long', description: 'Numero documento', filledAt: [1], example: '1234567890' },
      { name: 'Celular', type: 'long', description: 'Telefono', filledAt: [1], example: '3001234567' },
      { name: 'Email', type: 'string', description: 'Email factura', filledAt: [1], example: 'juan@email.com' },
      { name: 'Direccion', type: 'string', description: 'Direccion facturacion', filledAt: [1], example: 'Cra 50 # 10-20' },
      { name: 'IdTipoContribuyente', type: 'int', description: 'FK a TTipoContribuyente', filledAt: [1], example: '1' },
      { name: 'Subtotal', type: 'decimal', description: 'Subtotal', filledAt: [1], example: '29412' },
      { name: 'Iva', type: 'decimal', description: 'IVA 19%', filledAt: [1], example: '5588' },
      { name: 'Total', type: 'decimal', description: 'Total a pagar', filledAt: [1], example: '35000' },
      { name: 'Observaciones', type: 'string?', description: 'Notas internas de facturacion', filledAt: [1], example: 'Pago normal' },
      { name: 'IdConvenio', type: 'long?', description: 'FK a TConvenio (si aplica)', filledAt: [1], example: 'NULL' },
    ]
  },
  'TPago': {
    name: 'TPago',
    displayName: 'Pago Wompi (BD Temporal)',
    description: 'Registro del pago realizado via Wompi',
    createdAt: 1,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TFacturacion', filledAt: [1], example: '12345' },
      { name: 'IdTransaccion', type: 'string', description: 'ID transaccion Wompi (UNIQUE)', filledAt: [1], example: '12345-1621234567890' },
      { name: 'Referencia', type: 'string', description: 'Referencia {idRad}-{timestamp}', filledAt: [1], example: '12345-1621234567890' },
      { name: 'Estado', type: 'string', description: 'APPROVED, DECLINED, PENDING, VOIDED', filledAt: [1], example: 'APPROVED' },
      { name: 'FirmaWompy', type: 'bool', description: 'Firma SHA256 valida', filledAt: [1], example: 'true' },
      { name: 'Ambiente', type: 'string', description: 'sandbox o production', filledAt: [1], example: 'production' },
    ]
  },
  'TValidacionesIdentidad': {
    name: 'TValidacionesIdentidad',
    displayName: 'Validaciones Identidad (BD Temporal)',
    description: 'Registro de cada intento de validacion con TruValidate (TransUnion). Se crea un registro por cada intento de OTP, biometria o formulario.',
    createdAt: 1,
    fields: [
      { name: 'IdValidacion', type: 'long', description: 'ID auto-generado (PK)', filledAt: [1], example: '1101' },
      { name: 'IdInformacionBasica', type: 'long', description: 'FK a TInformacionBasica (inquilino/codeudor)', filledAt: [1], example: '1001' },
      { name: 'IdMetodo', type: 'int', description: 'FK a TMetodosValidacionIdentidad', filledAt: [1], example: '1' },
      { name: 'Completada', type: 'bool', description: 'true=validacion exitosa, false=fallida', filledAt: [1], example: 'true' },
      { name: 'Fecha', type: 'DateTime', description: 'Fecha/hora del intento', filledAt: [1], example: '2026-05-21 11:00:00' },
      { name: 'Observacion', type: 'string?', description: 'Detalle respuesta TruValidate', filledAt: [1], example: 'OTP04: Codigo incorrecto' },
      { name: 'Intentos', type: 'int?', description: 'Contador de intentos acumulados', filledAt: [1], example: '2' },
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
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'FK a TInformacionBasica', filledAt: [0], example: '1001' },
      { name: 'Nombres', type: 'string', description: 'Nombres del representante', filledAt: [0], example: 'CARLOS' },
      { name: 'PrimerApellido', type: 'string?', description: 'Primer apellido', filledAt: [0], example: 'MARTINEZ' },
      { name: 'SegundoApellido', type: 'string?', description: 'Segundo apellido', filledAt: [0], example: 'RUIZ' },
      { name: 'IdTipoIdentificacion', type: 'int', description: 'FK a TTipoDocumento', filledAt: [0], example: '1=CC' },
      { name: 'Identificacion', type: 'long', description: 'Numero documento', filledAt: [0], example: '1122334455' },
      { name: 'Celular', type: 'long', description: 'Telefono movil', filledAt: [0], example: '3156789012' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [0], example: 'rep@empresa.com' },
    ]
  },
  'TCodeudorGarantium': {
    name: 'TCodeudorGarantium',
    displayName: 'Codeudor Garantia (BD Temporal)',
    description: 'Codeudor para garantia Fiducuenta - SOLO si TipoGarantia = 2 (Fiducuenta)',
    createdAt: 0,
    fields: [
      { name: 'Id', type: 'long', description: 'ID auto-generado', filledAt: [0], example: '301' },
      { name: 'IdRadicacion', type: 'long', description: 'FK a TRadicacione', filledAt: [0], example: '12345' },
      { name: 'Nombre', type: 'string', description: 'Nombre completo', filledAt: [0], example: 'LUIS HERNANDEZ' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [0], example: 'luis@email.com' },
      { name: 'Celular', type: 'long', description: 'Telefono movil', filledAt: [0], example: '3009876543' },
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
    createdAt: 2,
    fields: [
      { name: 'IdSolicitud', type: 'long', description: 'ID de la solicitud (P_Crearsolicitud)', filledAt: [2], example: '67890' },
      { name: 'FechaSolicitud', type: 'DateTime?', description: 'Fecha de radicacion', filledAt: [2], example: '2026-05-21' },
      { name: 'Estado', type: 'string', description: 'Estado actual de la solicitud', filledAt: [2, 3, 4, 5, 6, 7], example: 'Radicada → Analisis → Contrato...' },
      { name: 'CodInmobiliaria', type: 'string', description: 'VACIO en Individual (sin inmobiliaria)', filledAt: [], example: '(vacio)' },
      { name: 'IdArrendador', type: 'long?', description: 'ID del propietario/arrendador', filledAt: [2], example: '2001' },
      { name: 'IdArrendatario', type: 'long?', description: 'ID del inquilino', filledAt: [2], example: '1001' },
      { name: 'IdInmueble', type: 'long?', description: 'ID del inmueble', filledAt: [2], example: '7001' },
      { name: 'IdCodeudor', type: 'long?', description: 'ID del codeudor (si aplica)', filledAt: [2], example: '5001' },
      { name: 'IdAnalisis', type: 'long?', description: 'Referencia a analisis de riesgo', filledAt: [3], example: '5001' },
      { name: 'IdContrato', type: 'long?', description: 'ID del contrato generado', filledAt: [4], example: '3001' },
      { name: 'IdPolizaIndividual', type: 'long?', description: 'Poliza INDIVIDUAL (flujo sin inmobiliaria)', filledAt: [5], example: '9001' },
      { name: 'IdPolizaColectiva', type: 'long?', description: 'NULL en flujo Individual', filledAt: [], example: 'NULL' },
      { name: 'NumeroPoliza', type: 'string', description: 'Numero de poliza SURA', filledAt: [5], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero de riesgo SURA', filledAt: [5], example: '987654' },
      { name: 'IdSiniestro', type: 'long?', description: 'ID de siniestro (si hay mora)', filledAt: [6], example: '2001' },
      { name: 'TipoGarantia', type: 'int', description: '1=Fianza, 2=Fiducuenta, 3=Sin garantias', filledAt: [2], example: '1' },
      { name: 'UsuAnalista', type: 'string', description: 'Usuario analista asignado', filledAt: [3], example: 'mrodriguez' },
      { name: 'UsuContrato', type: 'string', description: 'Usuario ejecutivo contrato', filledAt: [4], example: 'lgomez' },
      { name: 'FechaIniAnalisis', type: 'DateTime?', description: 'Inicio del analisis', filledAt: [3], example: '2026-05-22 09:00' },
      { name: 'FechaFinAnalisis', type: 'DateTime?', description: 'Fin del analisis', filledAt: [3], example: '2026-05-22 11:30' },
      { name: 'FechaIniContrato', type: 'DateTime?', description: 'Inicio generacion contrato', filledAt: [4], example: '2026-05-23 10:00' },
      { name: 'FechaFinContrato', type: 'DateTime?', description: 'Fin generacion contrato', filledAt: [4], example: '2026-05-23 15:00' },
      { name: 'ValorEstudio', type: 'int', description: 'Valor del estudio ($35,000)', filledAt: [2], example: '35000' },
      { name: 'NroCodeudores', type: 'int', description: 'Cantidad de codeudores', filledAt: [2], example: '1' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones generales', filledAt: [2, 3, 4, 5, 6, 7], example: 'Notas...' },
    ]
  },
  'CArrendatario': {
    name: 'CArrendatario',
    displayName: 'Arrendatario/Inquilino (BD AGSSA)',
    description: 'Datos completos del inquilino en BD AGSSA permanente',
    createdAt: 2,
    fields: [
      { name: 'IdArrendatario', type: 'long', description: 'ID del arrendatario', filledAt: [2], example: '1001' },
      { name: 'TipoPersona', type: 'string', description: 'Natural o Juridica', filledAt: [2], example: 'Natural' },
      { name: 'NombresRazonSocial', type: 'string', description: 'Nombres o razon social', filledAt: [2], example: 'JUAN CARLOS' },
      { name: 'Apellidos', type: 'string', description: 'Apellidos', filledAt: [2], example: 'PEREZ GOMEZ' },
      { name: 'TipoDocumento', type: 'string', description: 'CC, CE, NIT, etc.', filledAt: [2], example: 'CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero de identificacion', filledAt: [2], example: '1234567890' },
      { name: 'Telefono', type: 'long?', description: 'Telefono fijo', filledAt: [2], example: '6011234567' },
      { name: 'Celular', type: 'long?', description: 'Telefono movil', filledAt: [2], example: '3001234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [2], example: 'juan@email.com' },
      { name: 'Sexo', type: 'string', description: 'M o F', filledAt: [2], example: 'M' },
      { name: 'FechaNacimiento', type: 'DateTime?', description: 'Fecha de nacimiento', filledAt: [2], example: '1990-01-15' },
      { name: 'FechaValidacion', type: 'DateTime?', description: 'Fecha validacion TruValidate', filledAt: [2], example: '2026-05-21 10:45' },
      { name: 'ClienteConsultable', type: 'bool?', description: 'En lista negra SURA (del motor)', filledAt: [3], example: 'false' },
      { name: 'Suplantacion', type: 'bool?', description: 'Indicador suplantacion', filledAt: [3], example: 'false' },
      { name: 'CiudadNacimiento', type: 'string', description: 'Ciudad de nacimiento', filledAt: [2], example: 'BOGOTA' },
      { name: 'Nacionalidad', type: 'string', description: 'Nacionalidad', filledAt: [2], example: 'COLOMBIANA' },
      { name: 'PersonasCargo', type: 'int?', description: 'Personas a cargo', filledAt: [2], example: '2' },
    ]
  },
  'CArrendador': {
    name: 'CArrendador',
    displayName: 'Arrendador/Propietario (BD AGSSA)',
    description: 'Datos del propietario del inmueble en BD AGSSA',
    createdAt: 2,
    fields: [
      { name: 'IdArrendador', type: 'long', description: 'ID del propietario', filledAt: [2], example: '2001' },
      { name: 'TipoPersona', type: 'string', description: 'Natural o Juridica', filledAt: [2], example: 'Natural' },
      { name: 'Nombre', type: 'string', description: 'Nombre completo', filledAt: [2], example: 'PEDRO RODRIGUEZ' },
      { name: 'TipoDocumento', type: 'string', description: 'CC, CE, NIT', filledAt: [2], example: 'CC' },
      { name: 'Identificacion', type: 'long?', description: 'Numero de documento', filledAt: [2], example: '9876543210' },
      { name: 'Direccion', type: 'string', description: 'Direccion de contacto', filledAt: [2], example: 'Cra 80 # 50-30' },
      { name: 'Telefono', type: 'long?', description: 'Telefono fijo', filledAt: [2], example: '6019876543' },
      { name: 'Celular', type: 'long?', description: 'Telefono movil', filledAt: [2], example: '3201234567' },
      { name: 'Email', type: 'string', description: 'Correo electronico', filledAt: [2], example: 'pedro@email.com' },
      { name: 'ClienteConsultable', type: 'bool?', description: 'En lista negra SURA', filledAt: [3], example: 'false' },
    ]
  },
  'CInmueble': {
    name: 'CInmueble',
    displayName: 'Inmueble (BD AGSSA)',
    description: 'Datos del inmueble a arrendar en BD AGSSA permanente',
    createdAt: 2,
    fields: [
      { name: 'IdInmueble', type: 'long', description: 'ID del inmueble', filledAt: [2], example: '7001' },
      { name: 'Direccion', type: 'string', description: 'Direccion completa', filledAt: [2], example: 'Calle 100 # 15-20 Apto 501' },
      { name: 'Ciudad', type: 'string', description: 'Ciudad', filledAt: [2], example: 'BOGOTA' },
      { name: 'Departamento', type: 'string', description: 'Departamento', filledAt: [2], example: 'CUNDINAMARCA' },
      { name: 'Destinacion', type: 'string', description: 'Vivienda o Comercio', filledAt: [2], example: 'Vivienda' },
      { name: 'TipoInmueble', type: 'string', description: 'Apartamento, Casa, Oficina', filledAt: [2], example: 'Apartamento' },
      { name: 'CanonArrendamiento', type: 'long?', description: 'Valor canon mensual', filledAt: [2], example: '2500000' },
      { name: 'CuotaAdmon', type: 'long?', description: 'Cuota administracion', filledAt: [2], example: '350000' },
      { name: 'Estrato', type: 'int?', description: 'Estrato socioeconomico', filledAt: [2], example: '4' },
      { name: 'CodInmobiliaria', type: 'string', description: 'VACIO en flujo Individual', filledAt: [], example: '(vacio)' },
    ]
  },
  'CAnalisis': {
    name: 'CAnalisis',
    displayName: 'Analisis de Riesgo (BD AGSSA)',
    description: 'Resultado del motor de decision ejecutado automaticamente',
    createdAt: 3,
    fields: [
      { name: 'IdAnalisis', type: 'long', description: 'ID del analisis', filledAt: [3], example: '5001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [3], example: '67890' },
      { name: 'IdConceptoString', type: 'string', description: 'Resultado: APROBADO/NEGADO/ESTUDIO', filledAt: [3], example: 'APROBADO' },
      { name: 'FechaConcepto', type: 'DateTime?', description: 'Fecha del concepto', filledAt: [3], example: '2026-05-22' },
      { name: 'RiesgoConsultable', type: 'string', description: 'Consulta API SURA: S/N', filledAt: [3], example: 'N' },
      { name: 'DetalleRiesgoConsultable', type: 'string', description: 'Detalle de la consulta SURA', filledAt: [3], example: 'Sin reportes negativos' },
      { name: 'PorcentajeEndeudamiento', type: 'long?', description: '% de endeudamiento', filledAt: [3], example: '25' },
      { name: 'NroObligacion', type: 'long?', description: 'Obligaciones en centrales', filledAt: [3], example: '2' },
      { name: 'EntidadReporte', type: 'string', description: 'Entidad que reporta', filledAt: [3], example: 'Banco XYZ' },
      { name: 'EntidadMonto', type: 'long?', description: 'Monto reportado', filledAt: [3], example: '5000000' },
      { name: 'AlertaContratos', type: 'string', description: 'Alerta contratos previos', filledAt: [3], example: 'Sin alertas' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones del analista', filledAt: [3], example: 'Cliente con buen historial' },
      { name: 'PlanArrendamiento', type: 'string', description: 'Plan asignado', filledAt: [3], example: 'Plan Clasico' },
      { name: 'LimiteIndemni', type: 'string', description: 'Limite de indemnizacion', filledAt: [3], example: '12 canones' },
    ]
  },
  'CContrato': {
    name: 'CContrato',
    displayName: 'Contrato (BD AGSSA)',
    description: 'Contrato de arrendamiento con clausulas de seguro',
    createdAt: 4,
    fields: [
      { name: 'IdContrato', type: 'long', description: 'ID del contrato', filledAt: [4], example: '3001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [4], example: '67890' },
      { name: 'IdEstadoContrato', type: 'string', description: 'Borrador → Enviado → Firmado', filledAt: [4, 5], example: 'Borrador' },
      { name: 'Vigencia', type: 'int', description: 'Vigencia en meses', filledAt: [4], example: '12' },
      { name: 'CanonArrendamiento', type: 'decimal', description: 'Canon mensual', filledAt: [4], example: '2500000' },
      { name: 'CuotaAdmon', type: 'decimal', description: 'Cuota administracion', filledAt: [4], example: '350000' },
      { name: 'ValorPrima', type: 'decimal', description: 'Prima del seguro', filledAt: [4], example: '450000' },
      { name: 'TasaAplicada', type: 'decimal', description: 'Tasa de prima %', filledAt: [4], example: '1.5' },
      { name: 'FechaRiesgo', type: 'DateTime?', description: 'Inicio vigencia riesgo', filledAt: [5], example: '2026-06-01' },
      { name: 'FechaIniPoliza', type: 'DateTime?', description: 'Inicio poliza', filledAt: [5], example: '2026-06-01' },
      { name: 'FechaFinPoliza', type: 'DateTime?', description: 'Fin poliza', filledAt: [5], example: '2027-05-31' },
      { name: 'FechaPagoPoliza', type: 'DateTime?', description: 'Fecha pago poliza SIPRO', filledAt: [5], example: '2026-05-25' },
      { name: 'PagoPoliza', type: 'string', description: 'Estado pago: PENDIENTE/PAGADO', filledAt: [5], example: 'PAGADO' },
      { name: 'ServiciosPublicos', type: 'bool', description: 'Cobertura serv. publicos', filledAt: [4], example: 'true' },
      { name: 'DanosFaltantes', type: 'bool', description: 'Cobertura danos', filledAt: [4], example: 'true' },
      { name: 'ZohoRequestId', type: 'string?', description: 'ID solicitud ZohoSign', filledAt: [4], example: 'ZH-123456' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [4, 5], example: 'Contrato generado...' },
    ]
  },
  'CPolizaIndividual': {
    name: 'CPolizaIndividual',
    displayName: 'Poliza Individual (BD AGSSA)',
    description: 'Poliza individual del cliente (flujo sin inmobiliaria)',
    createdAt: 5,
    fields: [
      { name: 'IdPolizaIndividual', type: 'long', description: 'ID de la poliza individual', filledAt: [5], example: '9001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [5], example: '67890' },
      { name: 'NumeroPoliza', type: 'string', description: 'Numero poliza SURA', filledAt: [5], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero riesgo SURA', filledAt: [5], example: '987654' },
      { name: 'FechaEmision', type: 'DateTime?', description: 'Fecha emision poliza', filledAt: [5], example: '2026-05-25' },
      { name: 'FechaInicioVigencia', type: 'DateTime?', description: 'Inicio vigencia', filledAt: [5], example: '2026-06-01' },
      { name: 'FechaFinVigencia', type: 'DateTime?', description: 'Fin vigencia', filledAt: [5], example: '2027-05-31' },
      { name: 'ValorPrima', type: 'decimal', description: 'Valor de la prima', filledAt: [5], example: '450000' },
      { name: 'Estado', type: 'string', description: 'ACTIVA, VENCIDA, CANCELADA', filledAt: [5, 7], example: 'ACTIVA' },
      { name: 'LimiteIndemnizacion', type: 'decimal', description: 'Limite maximo', filledAt: [5], example: '30000000' },
      { name: 'PlanSeguro', type: 'string', description: 'Plan: Clasico, Global', filledAt: [5], example: 'Clasico' },
    ]
  },
  'CSiniestro': {
    name: 'CSiniestro',
    displayName: 'Siniestro/Reclamacion (BD AGSSA)',
    description: 'Registro de siniestros cuando inquilino entra en mora',
    createdAt: 6,
    fields: [
      { name: 'IdSiniestro', type: 'long', description: 'ID del siniestro', filledAt: [6], example: '2001' },
      { name: 'IdSolicitud', type: 'long', description: 'FK a solicitud', filledAt: [6], example: '67890' },
      { name: 'FechaSiniestro', type: 'DateTime', description: 'Fecha del siniestro (mora)', filledAt: [6], example: '2026-08-15' },
      { name: 'FechaRadicacion', type: 'DateTime', description: 'Fecha radicacion reclamo', filledAt: [6], example: '2026-08-20' },
      { name: 'NroPoliza', type: 'string', description: 'Numero de poliza', filledAt: [6], example: '123456789' },
      { name: 'NumeroRiesgo', type: 'string', description: 'Numero de riesgo', filledAt: [6], example: '987654' },
      { name: 'TotalDeuda', type: 'decimal', description: 'Deuda total acumulada', filledAt: [6], example: '7500000' },
      { name: 'MesesMora', type: 'int', description: 'Meses en mora', filledAt: [6], example: '3' },
      { name: 'IdEstadoSiniestro', type: 'int', description: 'Estado del proceso', filledAt: [6], example: '1=Radicado' },
      { name: 'PlanSeguro', type: 'string', description: 'Plan de seguro aplicado', filledAt: [6], example: 'Clasico' },
      { name: 'LimiteIndemnizacion', type: 'decimal', description: 'Limite maximo a pagar', filledAt: [6], example: '30000000' },
      { name: 'AutorizaIndemnizacion', type: 'bool', description: 'Autorizado para pago', filledAt: [6], example: 'true' },
      { name: 'InmuebleRestituido', type: 'bool', description: 'Inmueble devuelto', filledAt: [6], example: 'false' },
      { name: 'FechaPosesion', type: 'DateTime?', description: 'Fecha restitucion', filledAt: [6], example: '2026-09-01' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones del caso', filledAt: [6], example: 'Mora de 3 meses...' },
    ]
  },
  'CRenovacion': {
    name: 'CRenovacion',
    displayName: 'Renovacion (BD AGSSA)',
    description: 'Renovacion de contratos y polizas individuales',
    createdAt: 7,
    fields: [
      { name: 'IdRenovacion', type: 'long', description: 'ID de renovacion', filledAt: [7], example: '4001' },
      { name: 'IdSolicitud', type: 'long', description: 'Solicitud original', filledAt: [7], example: '67890' },
      { name: 'Estado', type: 'string', description: 'Estado de renovacion', filledAt: [7], example: 'PENDIENTE' },
      { name: 'Vlr_CanonArrendamiento', type: 'decimal', description: 'Nuevo canon', filledAt: [7], example: '2650000' },
      { name: 'Vlr_Administracion', type: 'decimal', description: 'Nueva admon', filledAt: [7], example: '370000' },
      { name: 'Incremento', type: 'decimal', description: 'Incremento % (IPC)', filledAt: [7], example: '6' },
      { name: 'FechaInicioPoliza', type: 'DateTime', description: 'Inicio nueva poliza', filledAt: [7], example: '2027-06-01' },
      { name: 'FechaFinPoliza', type: 'DateTime', description: 'Fin nueva poliza', filledAt: [7], example: '2028-05-31' },
      { name: 'VigenciaEnMeses', type: 'int', description: 'Vigencia', filledAt: [7], example: '12' },
      { name: 'NroPoliza', type: 'string', description: 'Nuevo numero poliza', filledAt: [7], example: '123456790' },
      { name: 'TotalPagar', type: 'decimal', description: 'Total a pagar', filledAt: [7], example: '480000' },
      { name: 'Prima', type: 'decimal', description: 'Nueva prima anual', filledAt: [7], example: '480000' },
      { name: 'Observaciones', type: 'string', description: 'Observaciones', filledAt: [7], example: 'Renovacion anual' },
    ]
  },
};

// Definicion de las etapas del flujo INDIVIDUAL (sin inmobiliaria)
const flowSteps: FlowStep[] = [
  {
    id: 0,
    name: 'Radicacion (Formulario)',
    shortName: 'Formulario',
    description: 'El inquilino accede DIRECTO a radicacion.arriendeseguro.com y llena el formulario',
    icon: <FileText className="w-5 h-5" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-500',
    trigger: 'Inquilino accede a radicacion.arriendeseguro.com (sin link de inmobiliaria)',
    actor: 'Inquilino (Arrendatario)',
    tables: ['TRadicacione', 'TInformacionBasica', 'TActividadEconomica', 'TReferencia', 'TInmueble', 'TPropietario'],
    details: [
      'Inquilino accede DIRECTO a la URL (flujo NORMAL)',
      'Llena datos personales → TInformacionBasica',
      'Situacion laboral (Empleado/Independiente/Pensionado) → TActividadEconomica',
      'Agrega referencias (familiar + personal) → TReferencia',
      'Datos del inmueble → TInmueble',
      'Datos del propietario (si los conoce) → TPropietario',
      'NO se crea TInmobiliarium ni TAsesore (flujo Individual)',
      '',
      '--- TABLAS CONDICIONALES ---',
      'Si TipoPersona=Juridica → TRepresentanteLegal',
      'Si TipoGarantia=Fiducuenta → TCodeudorGarantium',
    ]
  },
  {
    id: 1,
    name: 'Pago Estudio + Validacion Identidad',
    shortName: 'Pago',
    description: 'Pago $35,000 via Wompi + Validacion identidad con TruValidate (TransUnion)',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-500',
    trigger: 'Inquilino completa formulario y procede al pago',
    actor: 'Inquilino (Arrendatario)',
    tables: ['TFacturacion', 'TPago', 'TValidacionesIdentidad'],
    details: [
      '--- PAGO ESTUDIO ($35,000) ---',
      'Datos facturacion → TFacturacion',
      'Si tiene codigo descuento → TConvenio referenciado',
      'Modal Wompi: pago tarjeta/PSE/Nequi',
      'Webhook confirma APPROVED → TPago',
      '',
      '--- TRUVALIDATE (TransUnion) - 6 servicios ---',
      '[AUTOMATICOS - TruValidate los ejecuta internamente]',
      '• VelocityCheck: detecta fraude por velocidad',
      '• IDV: verifica identidad vs bases de datos',
      '• SimSwap: detecta si SIM fue cambiada recientemente',
      '',
      '[INTERACTIVOS - Usuario participa]',
      '• OTP: codigo 4 digitos por SMS (timeout 5 min)',
      '• docauth_processdocs: foto cedula frente + reverso',
      '• docauth_processselfie: selfie para reconocimiento facial',
      '',
      '--- CAMINOS POSIBLES ---',
      '✓ EXITO: OTP ok → Biometria ok → Sync AGSSA',
      '→ REINTENTO: OTP invalido → puede reintentar',
      '→ ALTERNATIVA: Supera intentos OTP → Biometria directa',
      '→ FALLBACK: Biometria falla → Formulario manual (sube PDF)',
      '✗ RECHAZO: Falla todo → No puede continuar',
    ]
  },
  {
    id: 2,
    name: 'Sincronizacion a AGSSA',
    shortName: 'Sync',
    description: 'Sistema sincroniza datos de BD temporal a BD AGSSA (automatico)',
    icon: <ArrowRight className="w-5 h-5" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-500',
    trigger: 'Webhook Wompi confirma pago APPROVED',
    actor: 'Sistema (WCF Automatico)',
    tables: ['TRadicacione', 'CSolicitudes', 'CArrendatario', 'CInmueble', 'CArrendador'],
    details: [
      'WCF ExternalSolutionService.CrearSolicitudAsync()',
      'CodInmobiliaria = VACIO (flujo Individual)',
      'SP P_Crearsolicitud inserta en CSolicitudes',
      'Datos inquilino → CArrendatario (BD AGSSA)',
      'Datos inmueble → CInmueble (BD AGSSA)',
      'Datos propietario → CArrendador (BD AGSSA)',
      'TRadicacione.IdAgssa = ID generado en AGSSA',
      'Motor de Decision ejecutado automaticamente',
    ]
  },
  {
    id: 3,
    name: 'Analisis de Riesgo',
    shortName: 'Analisis',
    description: 'Analista revisa resultado del motor de decision y evalua riesgo',
    icon: <UserCheck className="w-5 h-5" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-500',
    trigger: 'Motor ejecutado automaticamente, analista revisa en Analisis_11.aspx',
    actor: 'Analista de Riesgo (AGSSAsura)',
    tables: ['CSolicitudes', 'CAnalisis', 'CArrendatario'],
    details: [
      'Motor de decision ya ejecutado (automatico en sync)',
      'Consulto API SURA: lista negra (RiesgoConsultable)',
      'Valido rango de canon aplicable ($1.5M - $8M)',
      'Resultado guardado en CAnalisis',
      'Posibles resultados: APROBADO / NEGADO / ESTUDIO',
      'Si ESTUDIO: analista revisa manualmente',
      'CSolicitudes.IdAnalisis actualizado',
    ]
  },
  {
    id: 4,
    name: 'Generacion de Contrato',
    shortName: 'Contrato',
    description: 'Ejecutivo genera contrato de arrendamiento con clausulas del seguro',
    icon: <FileSignature className="w-5 h-5" />,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    borderColor: 'border-teal-500',
    trigger: 'Solicitud aprobada, ejecutivo asignado',
    actor: 'Ejecutivo de Contratos (AGSSAsura)',
    tables: ['CSolicitudes', 'CContrato'],
    details: [
      'Ejecutivo asignado (P_AsignarEjecutivoP12)',
      'Genera documento en Contratos_13.aspx',
      'Define coberturas: servicios publicos, danos',
      'Calcula prima del seguro',
      'Envia contrato a firma via ZohoSign',
      'Firmantes: Propietario, Inquilino, Codeudor',
      'CSolicitudes.IdContrato actualizado',
    ]
  },
  {
    id: 5,
    name: 'Activacion de Poliza Individual',
    shortName: 'Poliza',
    description: 'Cliente paga poliza en SIPRO y se activa la cobertura individual',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    borderColor: 'border-cyan-500',
    trigger: 'Contrato firmado, pendiente pago de poliza',
    actor: 'Promotora + Sistema SIPRO (SURA)',
    tables: ['CSolicitudes', 'CContrato', 'CPolizaIndividual'],
    details: [
      'Cliente paga prima en SIPRO (sistema SURA via VPN)',
      'Promotora verifica pago manualmente',
      'Se crea CPolizaIndividual (NO colectiva)',
      'Se asigna NumeroPoliza y NumeroRiesgo SURA',
      'Fechas de vigencia registradas',
      'CSolicitudes.IdPolizaIndividual actualizado',
      'Estado: "Vigente" - Cobertura activa',
    ]
  },
  {
    id: 6,
    name: 'Siniestro (si aplica)',
    shortName: 'Siniestro',
    description: 'Si el inquilino deja de pagar, propietario radica reclamacion',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-500',
    trigger: 'Inquilino en mora, propietario reporta',
    actor: 'Propietario + Area de Siniestros',
    tables: ['CSolicitudes', 'CSiniestro'],
    details: [
      'Propietario reporta mora del inquilino',
      'Se crea registro en CSiniestro',
      'Se calcula deuda total acumulada',
      'Proceso de cobro juridico si aplica',
      'Indemnizacion segun limite de poliza individual',
      'CSolicitudes.IdSiniestro actualizado',
      'Estados: ABIERTO → EN_ESTUDIO → APROBADO/RECHAZADO → CERRADO',
    ]
  },
  {
    id: 7,
    name: 'Renovacion (si aplica)',
    shortName: 'Renovar',
    description: 'Al vencer la poliza, se renueva el contrato y poliza individual',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    borderColor: 'border-indigo-500',
    trigger: '30-60 dias antes de vencimiento de poliza',
    actor: 'Auxiliar de Renovaciones',
    tables: ['CRenovacion', 'CSolicitudes', 'CPolizaIndividual'],
    details: [
      'Sistema alerta proximos vencimientos',
      'Contacto con propietario e inquilino',
      'Se calcula incremento del canon (IPC)',
      'Se genera nueva cotizacion de prima',
      'Cliente acepta y paga renovacion en SIPRO',
      'Nueva poliza individual por 12 meses',
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
