# Contexto de Sesion - 21 Mayo 2026

## Resumen de lo realizado

### 1. Backup de Base de Datos
- **Archivo:** `BD/BackUpProdAgssa_07_05_2026_184001.7z` (248 MB comprimido)
- **Contenido:** `BackUpProdAGSSA_2026-05-07.bak` (~5 GB descomprimido)
- **Extraido en:** `BD/extracted/`
- **Formato:** SQL Server backup nativo (requiere restaurar en SQL Server para analisis completo)
- **Scripts de analisis creados:** `BD/extract_names.ps1`, `BD/extract_tables.ps1`

### 2. Repositorio subido a GitHub
- **URL:** https://github.com/Nicolay-NGDS/Agssa-explorer
- **Git config:** nicolay.moreno@ngds.ai
- **Commits realizados:**
  - Initial commit con todo el proyecto
  - docs: Add local database backup location to CLAUDE.md

### 3. Nueva Vista Creada: Flujo de Datos
- **Archivo:** `src/views/DataFlowView.tsx`
- **Ruta:** `/flujo-datos`
- **Proposito:** Visualizar paso a paso como se llenan las tablas en cada etapa del proceso

#### Etapas del flujo implementadas:
1. **Radicacion** - Usuario llena formulario, paga $35,000 (Wompi)
   - Tablas: T_Radicaciones, T_InformacionBasica (BD RADICACIONES)

2. **Sincronizacion a AGSSA** - Webhook Wompi confirma pago
   - Tablas: CSolicitudes, CArrendatario, CInmueble (BD AGSSA)
   - WCF: ExternalSolutionService.CrearSolicitudAsync()
   - SP: P_Crearsolicitud

3. **Analisis de Riesgo** - Analista ejecuta motor de decision
   - Tablas: CAnalisis, CSolicitudes
   - Pagina: Analisis_11.aspx

4. **Generacion de Contrato** - Ejecutivo genera contrato
   - Tablas: CContrato, CSolicitudes
   - Firma via ZohoSign

5. **Activacion de Poliza** - Pago verificado en SIPRO
   - Tablas: CContrato (fechas poliza), CSolicitudes

6. **Siniestro** (si aplica) - Mora del arrendatario
   - Tablas: CSiniestro, CSolicitudes

7. **Renovacion** (si aplica) - Vencimiento de poliza
   - Tablas: CRenovacion, CSolicitudes

### 4. Hallazgos Clave del Analisis

#### Flujo de datos confirmado:
```
BD RADICACIONES (temporal)          BD AGSSA (permanente)
┌─────────────────────┐            ┌─────────────────────┐
│ T_Radicaciones      │ ────────►  │ CSolicitudes        │
│ T_InformacionBasica │   Wompi    │ CArrendatario       │
│ T_Inmuebles         │   pago OK  │ CInmueble           │
│ T_ActividadEconomica│            │ CAnalisis           │
└─────────────────────┘            │ CContrato           │
                                   │ CSiniestro          │
                                   │ CRenovacion         │
                                   └─────────────────────┘
```

#### Primera tabla en cada BD:
- **RADICACIONES:** `T_Radicaciones` (creada por RadicacionesService.CrearRadicacionInicioProceso())
- **AGSSA:** `CSolicitudes` (creada por SP P_Crearsolicitud via WCF)

#### Stored Procedures encontrados en backup:
- P_Crearsolicitud (crear solicitud)
- P_CrearAnalisisSolicitud
- P_InsertarArrendatario
- P_InsertarInmueble
- P_InsertarCodeudores_API
- P_InsertarPropietario
- P_ActualizacionEstados
- P_ContratosXEstado
- Y muchos mas...

### 5. Entidades principales documentadas
Se extrajeron los campos completos de:
- CSolicitudes (30+ campos)
- CAnalisis (15+ campos)
- CContrato (25+ campos)
- CArrendatario (20+ campos)
- CInmueble (10+ campos)
- CCodeudor (15+ campos)
- CSiniestro (20+ campos)
- CRenovacion (25+ campos)
- CPolizaColectiva
- CPolizaIndividual

---

## Pendientes / Proximos pasos sugeridos

### Para la vista DataFlowView:
- [ ] Agregar mas campos a las tablas si se requiere mayor detalle
- [ ] Agregar CCodeudor y CArrendador como tablas separadas
- [ ] Incluir los Stored Procedures que se ejecutan en cada etapa
- [ ] Agregar diagrama visual de relaciones entre tablas

### Para el analisis de BD:
- [ ] Restaurar el .bak en SQL Server local para analisis completo
- [ ] Extraer DDL de todas las tablas (CREATE TABLE statements)
- [ ] Documentar los 120+ Stored Procedures
- [ ] Mapear las relaciones FK entre tablas

### Para el repositorio:
- [ ] Agregar los nuevos cambios al repo de GitHub
- [ ] Considerar agregar documentacion de la BD en formato markdown

---

## Archivos modificados en esta sesion

```
src/
├── App.tsx                    (agregada ruta /flujo-datos)
├── components/
│   └── layout/
│       └── Navbar.tsx         (agregado link "Flujo Datos")
└── views/
    └── DataFlowView.tsx       (NUEVO - vista interactiva)

BD/
├── BackUpProdAgssa_07_05_2026_184001.7z  (backup original)
├── extracted/
│   └── BackUpProdAGSSA_2026-05-07.bak    (backup extraido ~5GB)
├── extract_names.ps1          (script de extraccion)
└── extract_tables.ps1         (script de extraccion)

CLAUDE.md                      (agregada seccion de backup)
```

---

## Comandos utiles

```bash
# Iniciar servidor de desarrollo
cd C:\Work\Prosear\Agssa\agssa-explorer
npm run dev

# Ver la nueva vista
http://localhost:5173/flujo-datos  (o puerto 5174 si 5173 esta ocupado)

# Build de produccion
npm run build

# Push cambios a GitHub
git add .
git commit -m "feat: Add DataFlowView for visualizing table data flow"
git push
```

---

## Notas importantes

1. El backup .bak de 5GB esta en BD/extracted/ pero esta excluido de git (.gitignore)
2. Para analizar el backup completo necesitas restaurarlo en SQL Server
3. La vista DataFlowView tiene datos de ejemplo basados en el analisis del codigo fuente
4. Los campos marcados en cada etapa son aproximados - pueden ajustarse segun necesidad

---

*Ultima actualizacion: 21 Mayo 2026, 11:00 AM*
