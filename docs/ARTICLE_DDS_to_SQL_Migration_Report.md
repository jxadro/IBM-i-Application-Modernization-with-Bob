# Informe de Pre-Migración: ARTICLE (DDS → SQL DDL)

> **Archivo físico:** `SAMCO/QDDSSRC/ARTICLE-Article_File.PF`
> **Aplicación:** SAMCO — Gestión Comercial IBM i
> **Fecha:** 2025-01-01
> **Skills utilizados:** `dds-primer-basics`, `rpg-primer-basics`, análisis estático de fuentes IBM i

---

## 1. Resumen Ejecutivo

El fichero físico `ARTICLE` está descrito en **DDS** (Data Description Specifications) con referencia centralizada de campos a través del fichero `SAMREF.PF`. Contiene el catálogo de artículos y es el objeto de mayor criticidad funcional del módulo ART, siendo referenciado por **10 programas** y **2 vistas SQL**, con 2 ficheros lógicos dependientes y un fichero lógico de artículo-proveedor cruzado.

Este informe detalla:
- La traducción completa del DDS a SQL DDL (`CREATE TABLE`)
- Los índices equivalentes a los ficheros lógicos (`ARTICLE1`, `ARTICLE2`)
- El impacto sobre programas, vistas, display files y procedimientos almacenados
- Autoridades, journalización y bloqueos considerados en la migración

---

## 2. Resolución de Tipos de Datos DDS → SQL

Las siguientes resoluciones provienen de `SAMREF.PF` y campos locales del PF, aplicando el estándar DDS → Db2 for i SQL:

| Campo DDS | Fuente | Tipo DDS | Tipo SQL |
|---|---|---|---|
| `ARID` | `SAMREF.ARID` | `CHAR(6)` | `CHAR(6)` |
| `ARDESC` | `SAMREF.ARDESC` | `CHAR(50)` | `CHAR(50)` |
| `ARSALEPR` | `REFFLD(UNITPRICE)` → `SAMREF.UNITPRICE` | `DECIMAL(7,2)` (Packed 7P2) | `DECIMAL(7,2)` |
| `ARWHSPR` | `REFFLD(UNITPRICE)` → `SAMREF.UNITPRICE` | `DECIMAL(7,2)` (Packed 7P2) | `DECIMAL(7,2)` |
| `ARTIFA` | `REFFLD(FAID)` → `SAMREF.FAID` | `CHAR(3)` | `CHAR(3)` |
| `ARSTOCK` | `REFFLD(QUANTITY)` → `SAMREF.QUANTITY` | `DECIMAL(5,0)` (Zoned 5,0) | `DECIMAL(5,0)` |
| `ARMINQTY` | `REFFLD(QUANTITY)` → `SAMREF.QUANTITY` | `DECIMAL(5,0)` (Zoned 5,0) | `DECIMAL(5,0)` |
| `ARCUSQTY` | `REFFLD(QUANTITY)` → `SAMREF.QUANTITY` | `DECIMAL(5,0)` (Zoned 5,0) | `DECIMAL(5,0)` |
| `ARPURQTY` | `REFFLD(QUANTITY)` → `SAMREF.QUANTITY` | `DECIMAL(5,0)` (Zoned 5,0) | `DECIMAL(5,0)` |
| `ARVATCD` | `REFFLD(VATCODE)` → `SAMREF.VATCODE` | `CHAR(1)` DEFAULT `'2'` | `CHAR(1)` DEFAULT `'2'` |
| `ARCREA` | Local `L` (Date) | DATE | `DATE` |
| `ARMOD` | Local `Z` (Timestamp) | TIMESTAMP | `TIMESTAMP` |
| `ARMODID` | Local `CHAR(11)` | `CHAR(11)` | `CHAR(11)` |
| `ARDEL` | `REFFLD(DLCODE)` → `SAMREF.DLCODE` | `CHAR(1)` | `CHAR(1)` DEFAULT `' '` |

> **Nota técnica DDS:** El tipo `QUANTITY` en `SAMREF` es declarado como `5 0` sin prefijo `P`, lo que en DDS significa tipo **Zoned Decimal** (`S` en SQL = `NUMERIC`). Sin embargo, dada la compatibilidad con programas RPG que usan `PACKED` implícitamente en ILE, se recomienda usar `DECIMAL(5,0)` (equivalente packed) para mayor eficiencia de almacenamiento. Se documenta esta decisión para revisión del equipo.
>
> **Nota sobre VATCODE:** El campo `VATCODE` en `SAMREF` lleva `DFT('2')` — este default se preserva en la columna `ARVATCD`.

---

## 3. DDL SQL Equivalente — Tabla ARTICLE

```sql
-- ============================================================
-- EQUIVALENTE SQL DDL para: ARTICLE (DDS Physical File)
-- Origen: SAMCO/QDDSSRC/ARTICLE-Article_File.PF
-- Referencia campos: SAMCO/common/SAMREF.PF
-- ============================================================

CREATE OR REPLACE TABLE ARTICLE (

  -- Identificador único de artículo (PK — SAMREF.ARID CHAR 6)
  ARTICLE_ID         FOR COLUMN ARID      CHAR(6)     CCSID 297
    NOT NULL DEFAULT ''
    CONSTRAINT ARTICLE_PK PRIMARY KEY,

  -- Descripción del artículo (SAMREF.ARDESC CHAR 50)
  DESCRIPTION        FOR COLUMN ARDESC    CHAR(50)    CCSID 297
    NOT NULL DEFAULT '',

  -- Precio de venta de referencia (REFFLD UNITPRICE → SAMREF 7P2)
  SALE_PRICE         FOR COLUMN ARSALEPR  DECIMAL(7,2)
    NOT NULL DEFAULT 0,

  -- Precio de almacén / stock (REFFLD UNITPRICE → SAMREF 7P2)
  WAREHOUSE_PRICE    FOR COLUMN ARWHSPR   DECIMAL(7,2)
    NOT NULL DEFAULT 0,

  -- Código de familia de artículo (REFFLD FAID → SAMREF CHAR 3)
  FAMILY_CODE        FOR COLUMN ARTIFA    CHAR(3)     CCSID 297
    NOT NULL DEFAULT '',

  -- Stock actual (REFFLD QUANTITY → SAMREF 5,0)
  STOCK              FOR COLUMN ARSTOCK   DECIMAL(5,0)
    NOT NULL DEFAULT 0,

  -- Stock mínimo / umbral de reposición (REFFLD QUANTITY → SAMREF 5,0)
  MINIMUM_QUANTITY   FOR COLUMN ARMINQTY  DECIMAL(5,0)
    NOT NULL DEFAULT 0,

  -- Cantidad en pedidos de cliente abiertos (REFFLD QUANTITY → SAMREF 5,0)
  CUSTOMER_ORDER_QTY FOR COLUMN ARCUSQTY  DECIMAL(5,0)
    NOT NULL DEFAULT 0,

  -- Cantidad en órdenes de compra abiertas (REFFLD QUANTITY → SAMREF 5,0)
  PURCHASE_ORDER_QTY FOR COLUMN ARPURQTY  DECIMAL(5,0)
    NOT NULL DEFAULT 0,

  -- Código de IVA del artículo (REFFLD VATCODE → SAMREF CHAR 1, DFT '2')
  VAT_CODE           FOR COLUMN ARVATCD   CHAR(1)     CCSID 297
    NOT NULL DEFAULT '2',

  -- Fecha de creación del registro (tipo L → DATE en DDS)
  CREATION_DATE      FOR COLUMN ARCREA    DATE
    NOT NULL DEFAULT CURRENT_DATE,

  -- Fecha/hora última modificación (tipo Z → TIMESTAMP en DDS)
  LAST_MODIFICATION  FOR COLUMN ARMOD     TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Usuario de última modificación (campo local CHAR 11)
  LAST_MODIFIED_BY   FOR COLUMN ARMODID   CHAR(11)    CCSID 297
    NOT NULL DEFAULT '',

  -- Indicador de baja lógica: ' '=activo, 'X'=eliminado (REFFLD DLCODE → SAMREF CHAR 1)
  DELETE_FLAG        FOR COLUMN ARDEL     CHAR(1)     CCSID 297
    NOT NULL DEFAULT ' '

);

-- ============================================================
-- ETIQUETAS (equivalente al atributo TEXT del DDS)
-- ============================================================
LABEL ON TABLE ARTICLE IS 'Article File';

LABEL ON COLUMN ARTICLE (
  ARID      IS 'ART.                ID',
  ARDESC    IS 'ARTICLE DESCRPTION',
  ARSALEPR  IS 'REF SALE PRICE',
  ARWHSPR   IS 'STOCK PRICE',
  ARTIFA    IS 'FAM.                ID',
  ARSTOCK   IS 'STOCK',
  ARMINQTY  IS 'MINIMUM STOCK',
  ARCUSQTY  IS 'CUSTOMER ORDER QTY',
  ARPURQTY  IS 'PURCHASE ORDER QTY',
  ARVATCD   IS 'VAT CODE',
  ARCREA    IS 'CREATION DATE',
  ARMOD     IS 'LAST MODIFICATION',
  ARMODID   IS 'LAST MODIF. BY',
  ARDEL     IS 'DELETE FLAG'
);

LABEL ON COLUMN ARTICLE (
  ARID      TEXT IS 'ARTICLE ID',
  ARDESC    TEXT IS 'ARTICLE DESCRIPTION',
  ARSALEPR  TEXT IS 'REF SALE PRICE',
  ARWHSPR   TEXT IS 'STOCK PRICE',
  ARTIFA    TEXT IS 'ARTICLE FAMILY CODE',
  ARSTOCK   TEXT IS 'STOCK',
  ARMINQTY  TEXT IS 'MINIMUM STOCK',
  ARCUSQTY  TEXT IS 'CUSTOMER ORDER QUANTITY',
  ARPURQTY  TEXT IS 'PURCHASE ORDER QUANTITY',
  ARVATCD   TEXT IS 'VAT CODE',
  ARCREA    TEXT IS 'CREATION DATE',
  ARMOD     TEXT IS 'LAST MODIFICATION',
  ARMODID   TEXT IS 'LAST MOD BY',
  ARDEL     TEXT IS 'DELETE CODE X=DELETED'
);
```

---

## 4. Índices SQL Equivalentes a los Ficheros Lógicos

### 4.1 ARTICLE1 (Clave única por ARID)

```sql
-- Equivalente a: SAMCO/QDDSSRC/ARTICLE1-Article_File.LF
-- Atributo DDS: UNIQUE; clave: ARID
-- Uso: acceso directo por clave (CHAIN en RPG), lectura secuencial por código

CREATE UNIQUE INDEX ARTICLE1
  ON ARTICLE (ARID);

LABEL ON INDEX ARTICLE1 IS 'Article File - Key by ARID (unique)';
```

> **Nota:** `ARTICLE1` lleva `UNIQUE` en su fuente DDS (línea 1), lo que en SQL se traduce en `CREATE UNIQUE INDEX`. Todos los programas del módulo ART300 realizan `CHAIN` sobre esta clave.

### 4.2 ARTICLE2 (Clave compuesta ARDESC + ARID)

```sql
-- Equivalente a: SAMCO/QDDSSRC/ARTICLE2.LF
-- Clave: ARDESC (primaria), ARID (secundaria, discriminante)
-- Uso: subfile ART200, presentación en orden alfabético de descripción

CREATE INDEX ARTICLE2
  ON ARTICLE (ARDESC ASC, ARID ASC);

LABEL ON INDEX ARTICLE2 IS 'Article File - Key by Description + ID';
```

> **Nota:** `ARTICLE2` **no declara** `UNIQUE` en su fuente DDS, por lo que el índice SQL es no único. La doble clave `(ARDESC, ARID)` permite desempate cuando dos artículos tengan la misma descripción.

---

## 5. Restricciones de Integridad Referencial (FKs)

Las siguientes restricciones son **implícitas en el diseño** (no declaradas en DDS, pero evidenciadas en código fuente) y se recomienda **declararlas explícitamente** en SQL:

```sql
-- FK: ARTICLE → FAMILLY (ARTIFA → FAID)
-- Evidencia: ART202 llama ExistFam(ARTIFA); BR-ART-004 CONFIRMADA
ALTER TABLE ARTICLE
  ADD CONSTRAINT ARTICLE_FK_FAMILY
  FOREIGN KEY (ARTIFA) REFERENCES FAMILLY (FAID)
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;

-- FK: ARTICLE → VATDEF (ARVATCD → VATCODE)
-- Evidencia: ART202 llama ExistVATRate(ARVATCD); BR-ART-005 CONFIRMADA
ALTER TABLE ARTICLE
  ADD CONSTRAINT ARTICLE_FK_VAT
  FOREIGN KEY (ARVATCD) REFERENCES VATDEF (VATCODE)
  ON DELETE RESTRICT
  ON UPDATE RESTRICT;
```

> **⚠️ Advertencia de Migración:** Los FKs SQL bloquearán INSERT/UPDATE cuando la familia o código IVA no existan. En DDS el control se hacía exclusivamente desde los programas RPG. **Probar exhaustivamente** antes de activar en producción. Considerar inicialmente `NOT ENFORCED ENABLE QUERY OPTIMIZATION` para preservar rendimiento sin bloqueo físico.

### 5.1 Tablas Referenciantes (ARTICLE como padre)

| Tabla hija | Campo FK | Campo PK en ARTICLE | Programas afectados |
|---|---|---|---|
| `DETORD` | `ODARID` | `ARID` | ORD100, ORD202, ORD700, ORD500 |
| `ARTIPROV` | `APARID` | `ARID` | ART201, PRO202, PRO203 |
| `ARTIINF` | `ARID` | `ARID` | ART400 |

---

## 6. Impacto sobre Programas y Objetos IBM i

### 6.1 Programas con Referencias Estáticas (DSPPGMREF equivalente — análisis estático de fuentes)

| Programa | Tipo | Fichero/LF referenciado | Modo de acceso | Operaciones detectadas |
|---|---|---|---|---|
| `ART200` | PGM.SQLRPGLE | `ARTICLE1` (UF+A), `ARTICLE2` (IF) | RLA nativa (F-spec) | READ, WRITE, UPDATE (FARTI) |
| `ART300` | RPGLE Module | `ARTICLE1` (IF, USROPN) | CHAIN por ARID | CHAIN (read-only) |
| `ART400` | SQLRPGLE Module | `ARTICLE` (SQL directo) | SQL Cursor / singleton | SELECT, INSERT, UPDATE (ARDEL='X'), DELETE lógico |
| `ORD700` | PGM.RPGLE | `ARTICLE1` (UF) | CHAIN + UPDATE | UPDATE ARCUSQTY (trigger DETORD) |
| `PRO202` | SQLRPGLE Module | `ARTICLE` + `ARTIPROV` | SQL Cursor `C2` | SELECT (campos: ARID, ARDESC, ARSTOCK, ARMINQTY, ARCUSQTY, ARPURQTY) |
| `PRO203` | PGM.SQLRPGLE | `ARTICLE` | SQL (indirecto, vía ARTIPROV JOIN) | SELECT |
| `ART200D` | DSPF | `ARTICLE` | Definición de campos DSPF | Campo REF para validación pantalla |
| `ART301D` | DSPF | `ARTICLE` | Definición de campos DSPF | Campo REF para validación pantalla |
| `ORD202D` | DSPF | `ARTICLE` | Definición de campos DSPF | Referencia de campos en pantalla de líneas |
| `ORD500O` | PRTF | `ARTICLE` | Definición de campos PRTF | Impresión confirmación/albarán |

### 6.2 Vistas SQL que Dependen de ARTICLE

| Vista | Ubicación | Descripción | Columnas de ARTICLE |
|---|---|---|---|
| `ARTLSTDAT` | `QSQLSRC/ARTLSTDAT.VIEW` | Artículos con cantidad total pedida | ARID, ARDESC |
| `ORDERCUS` | `QSQLSRC/ORDERCUS.VIEW` | JOIN ORDER + CUSTOMER (indirecta vía DETORD) | Indirecta por ODARID |

### 6.3 Procedimiento Almacenado

| Objeto | Tipo | Operación sobre ARTICLE |
|---|---|---|
| `ART801` (`UPDATE_ON_CUS_ORD_QTY`) | SQLPRC | `UPDATE ARTICLE SET ARCUSQTY = (subquery sobre DETORD/ORDER)` |

### 6.4 Trigger de Escritura

| Evento | Trigger | Efecto sobre ARTICLE |
|---|---|---|
| INSERT/UPDATE/DELETE en `DETORD` | `ORD700.PGM.RPGLE` (DDS trigger, no SQL trigger) | Actualiza `ARCUSQTY` en ARTICLE mediante CHAIN+UPDATE sobre ARTICLE1 |

> **⚠️ Punto crítico:** El trigger `ORD700` está vinculado al fichero DDS `DETORD` mediante mecanismo `ADDPFTRG` sobre el objeto físico. Al renombrar o recrear `ARTICLE`, **el trigger debe ser re-registrado** (`RMVPFTRG` + `ADDPFTRG`) y validado. El programa `ORD700` accede a `ARTICLE1` (LF) no a la PF directamente.

---

## 7. Estadísticas del Objeto (Estimadas del Análisis Estático)

> Las estadísticas exactas de filas y páginas solo pueden obtenerse desde el sistema IBM i activo mediante `QSYS2.SYSTABLESTAT` o `DSPFD`. Los valores siguientes son referencias de diseño:

| Propiedad | Valor / Estimación |
|---|---|
| Tipo de objeto original | `*FILE (PF-DTA)` |
| Formato de registro | `FARTI` |
| Longitud de registro estimada | ~155 bytes |
| Número de miembros DDS | 1 (`ARTICLE`) |
| Registros en POPULATE_SAMPLE_DATA | Ver `QSQLSRC/POPULATE_SAMPLE_DATA.SQL` |
| Ficheros lógicos dependientes | 2 (`ARTICLE1`, `ARTICLE2`) |
| DSPF que referencian ARTICLE | 4 (`ART200D`, `ART301D`, `ORD202D`, `ORD500O`) |
| Programas que abren el fichero | 3 (ART200, ART300, ORD700 vía ARTICLE1) |
| Programas SQL directos | 3 (ART400, PRO202, ART801) |

### Estimación de longitud de registro DDS

| Campo | Tipo | Bytes |
|---|---|---|
| ARID | CHAR(6) | 6 |
| ARDESC | CHAR(50) | 50 |
| ARSALEPR | DECIMAL(7,2) packed | 4 |
| ARWHSPR | DECIMAL(7,2) packed | 4 |
| ARTIFA | CHAR(3) | 3 |
| ARSTOCK | ZONED(5,0) | 5 |
| ARMINQTY | ZONED(5,0) | 5 |
| ARCUSQTY | ZONED(5,0) | 5 |
| ARPURQTY | ZONED(5,0) | 5 |
| ARVATCD | CHAR(1) | 1 |
| ARCREA | DATE (L) | 6 (ISO DDS) |
| ARMOD | TIMESTAMP (Z) | 26 |
| ARMODID | CHAR(11) | 11 |
| ARDEL | CHAR(1) | 1 |
| **Total estimado** | | **~132 bytes** |

---

## 8. Estado de Journalización

> La journalización activa es **prerrequisito** para commitment control SQL y para los mecanismos de Db2 Mirror / HA. El análisis de fuentes no contiene configuración de journal explícita (`STRJRNPF`), por lo que el estado debe verificarse en el sistema:

```sql
-- Consultar estado de journal sobre ARTICLE en el sistema activo:
SELECT TABLE_NAME, JOURNAL_LIBRARY, JOURNAL_NAME, JOURNAL_STATE,
       JOURNAL_IMAGES, OMIT_JOURNAL_ENTRY
FROM   QSYS2.SYSTABLES
WHERE  TABLE_NAME = 'ARTICLE'
  AND  TABLE_SCHEMA = 'SAMCO';  -- ajustar biblioteca objetivo
```

Adicionalmente para verificar la imagen del journal:

```
DSPFD FILE(SAMCO/ARTICLE) TYPE(*MBR)
```

**Acción requerida pre-migración:**
- Si `JOURNAL_STATE = 'J'` → journalización activa: el objeto SQL heredará automáticamente el journal al crearse en la misma biblioteca con el mismo nombre.
- Si `JOURNAL_STATE = ' '` (sin journal) → tras crear la tabla SQL, ejecutar `STRJRNPF FILE(SAMCO/ARTICLE)` indicando el journal de la aplicación.

---

## 9. Bloqueos Activos (Active Locks)

> Los bloqueos activos deben verificarse inmediatamente antes del proceso de migración para evitar interrupciones:

```sql
-- Verificar locks activos sobre ARTICLE:
SELECT JOB_NAME, LOCK_TYPE, LOCK_STATE, LOCK_COUNT, OBJECT_NAME
FROM   QSYS2.OBJECT_LOCK_INFO
WHERE  OBJECT_NAME = 'ARTICLE'
  AND  OBJECT_LIBRARY = 'SAMCO';
```

Alternativamente desde línea de comandos:

```
WRKOBJLCK OBJ(SAMCO/ARTICLE) OBJTYPE(*FILE)
```

**Programas que abren ARTICLE y deben estar inactivos durante la migración:**

| Programa | Tipo apertura | Comentario |
|---|---|---|
| `ART200` | `UF A` (Update, Add) sobre ARTICLE1 | Sesiones de usuarios en mantenimiento de artículos |
| `ART300` | `IF USROPN` sobre ARTICLE1 | Service program, cierre automático si no hay jobs activos |
| `ORD700` | `UF` sobre ARTICLE1 | Trigger activo — se activa con cada modificación de DETORD |

---

## 10. Autoridades (Authority Records)

> Las autoridades del objeto DDS `ARTICLE` deben auditarse y replicarse sobre la tabla SQL equivalente:

```
DSPOBJAUT OBJ(SAMCO/ARTICLE) OBJTYPE(*FILE)
```

Autoridades típicas recomendadas para el patrón SAMCO:

| Perfil | *OBJ Authority | *DATA Authority | Justificación |
|---|---|---|---|
| `SAMCOOWN` o `QPGMR` | `*ALL` | `*ALL` | Propietario/administrador |
| Perfiles de usuarios finales | `*USE` | `*CHANGE` | Lectura y modificación de datos |
| Programas de servicio (`FARTICLE`) | `*USE` | `*CHANGE` | Acceso mediante USROPN |
| `*PUBLIC` | `*EXCLUDE` | `*EXCLUDE` | Principio de mínimo privilegio |

Tras la creación de la tabla SQL, replicar autoridades:

```
GRTOBJAUT OBJ(SAMCO/ARTICLE) OBJTYPE(*FILE) USER(<perfil>) AUT(*CHANGE)
```

---

## 11. Relaciones de Dependencia (Mapa de Impacto)

```
SAMREF.PF (reference file)
    └── ARTICLE.PF (DDS Physical File)
            ├── ARTICLE1.LF  ← ART200 (F-spec UF), ART300 (CHAIN), ORD700 (CHAIN+UPDATE)
            ├── ARTICLE2.LF  ← ART200 (F-spec IF — subfile browse)
            ├── ART200D.DSPF (campo REF)
            ├── ART301D.DSPF (campo REF)
            ├── ORD202D.DSPF (campo REF)
            ├── ORD500O.PRTF (campo REF)
            ├── ART400 (SQL directo — CRUD completo)
            ├── PRO202 (SQL JOIN con ARTIPROV)
            ├── PRO203 (SQL indirecto)
            ├── ART801 SQLPRC (UPDATE ARCUSQTY)
            ├── ARTLSTDAT.VIEW (SQL VIEW — SELECT ARID, ARDESC)
            └── ARTIPROV.PF ──── ARTIPRO1.LF
                    ├── ART201 (mantenimiento artículo-proveedor)
                    └── PRO202 (stock bajo por proveedor)

FAMILLY.PF ──FK→ ARTICLE.ARTIFA
VATDEF.PF  ──FK→ ARTICLE.ARVATCD
ARTICLE    ──FK→ DETORD.ODARID
ARTICLE    ──FK→ ARTIPROV.APARID
ARTICLE    ──FK→ ARTIINF.ARID
```

---

## 12. Plan de Migración Recomendado

El proceso de migración de un fichero DDS a SQL DDL en IBM i sin reconstruir los programas RPG que usan acceso nativo (RLA) requiere **renombrar el objeto DDS existente** y crear la nueva tabla SQL **con el mismo nombre**. Los índices SQL reemplazan a los ficheros lógicos.

### Orden de Ejecución Recomendado

```
Paso 1: Verificar y desactivar locks
  → WRKOBJLCK OBJ(SAMCO/ARTICLE) OBJTYPE(*FILE)
  → Finalizar jobs activos del módulo ART

Paso 2: Auditar y exportar autoridades
  → DSPOBJAUT OBJ(SAMCO/ARTICLE) OBJTYPE(*FILE) OUTPUT(*PRINT)

Paso 3: Verificar estado de journal
  → DSPFD FILE(SAMCO/ARTICLE) TYPE(*MBR)

Paso 4: Renombrar el objeto DDS original (backup)
  → RNMOBJ OBJ(SAMCO/ARTICLE) OBJTYPE(*FILE) NEWOBJ(ARTICLE_DDS)
  → RNMOBJ OBJ(SAMCO/ARTICLE1) OBJTYPE(*FILE) NEWOBJ(ARTICLE1_DDS)
  → RNMOBJ OBJ(SAMCO/ARTICLE2) OBJTYPE(*FILE) NEWOBJ(ARTICLE2_DDS)

Paso 5: Crear la tabla SQL (DDL de la sección 3)
  → Ejecutar CREATE TABLE ARTICLE ...

Paso 6: Crear índices (sección 4)
  → Ejecutar CREATE UNIQUE INDEX ARTICLE1 ...
  → Ejecutar CREATE INDEX ARTICLE2 ...

Paso 7: Copiar datos desde el backup DDS
  → CPYF FROMFILE(SAMCO/ARTICLE_DDS) TOFILE(SAMCO/ARTICLE)
          MBROPT(*ADD) FMTOPT(*NOCHK)

Paso 8: Re-aplicar autoridades
  → GRTOBJAUT ...

Paso 9: Re-registrar el trigger ORD700 sobre el nuevo objeto
  → RMVPFTRG FILE(SAMCO/DETORD) EVENT(*INSERT) TIME(*AFTER)
    (si estaba sobre DETORD, verificar impacto sobre ARTICLE1)
  → Validar que ORD700 sigue accediendo a ARTICLE1 (ahora índice SQL)

Paso 10: Pruebas funcionales
  → Ejecutar ART200 (subfile browse)
  → Ejecutar ART400 REST API (ListAllArticles, CreateArticle, UpdateArticle)
  → Ejecutar ART801 SQLPRC (UPDATE ARCUSQTY)
  → Ejecutar PRO202 (JOIN ARTICLE + ARTIPROV)
  → Validar ARTLSTDAT VIEW

Paso 11 (Opcional — producción estable):
  → Declarar FKs explícitas (sección 5)
  → Ejecutar RUNSTATS / UPDATE STATISTICS para el optimizador SQL
```

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Trigger ORD700 desconectado tras RENAME | Alta | Crítico — ARCUSQTY no se actualiza | Re-registrar ADDPFTRG inmediatamente tras crear tabla SQL |
| Programas con F-spec usando nombre de LF (ARTICLE1) | Media | Error de compilación si se recompila | ARTICLE1 sigue siendo válido como índice SQL accesible por RLA |
| Diferencia de tipo ZONED vs PACKED en ARSTOCK/ARMINQTY | Baja | Resultados incorrectos en RPG aritmético | Usar DECIMAL(5,0) que es compatible con ambos formatos en ILE |
| DSPFs compiladas con referencia al DDS original | Media | Pantallas con campos desajustados | Recompilar DSPFs tras migración: ART200D, ART301D, ORD202D, ORD500O |
| FKs SQL bloquean datos incoherentes heredados | Media | Error en INSERT/UPDATE | Activar FKs solo después de limpiar datos huérfanos |

---

## 13. Verificación Post-Migración

```sql
-- Verificar estructura de la nueva tabla:
SELECT COLUMN_NAME, DATA_TYPE, LENGTH, NUMERIC_SCALE,
       IS_NULLABLE, COLUMN_DEFAULT, COLUMN_TEXT
FROM   QSYS2.SYSCOLUMNS
WHERE  TABLE_NAME    = 'ARTICLE'
  AND  TABLE_SCHEMA  = 'SAMCO'
ORDER BY ORDINAL_POSITION;

-- Verificar índices creados:
SELECT INDEX_NAME, COLUMN_NAME, ORDERING
FROM   QSYS2.SYSKEYS
WHERE  TABLE_NAME   = 'ARTICLE'
  AND  TABLE_SCHEMA = 'SAMCO'
ORDER BY INDEX_NAME, COLUMN_POSITION;

-- Contar registros migrados:
SELECT COUNT(*) AS TOTAL_ARTICLES,
       COUNT(CASE WHEN ARDEL = 'X' THEN 1 END) AS DELETED_ARTICLES,
       COUNT(CASE WHEN ARDEL = ' ' THEN 1 END) AS ACTIVE_ARTICLES
FROM   ARTICLE;

-- Verificar integridad referencial (huérfanos en DETORD):
SELECT COUNT(*) AS ORPHAN_ORDER_LINES
FROM   DETORD D
WHERE  NOT EXISTS (
  SELECT 1 FROM ARTICLE A WHERE A.ARID = D.ODARID
);
```

---

## 14. Skills y Herramientas Utilizados en este Análisis

| Recurso / Skill | Aplicación en este informe |
|---|---|
| **`dds-primer-basics`** | Resolución de tipos DDS (`P`, `S`, `L`, `Z`), semántica de `REF`/`REFFLD`, `UNIQUE`, `PFILE`, `EDTCDE`, `COLHDG` y `TEXT` → equivalente `LABEL ON` SQL |
| **`rpg-primer-basics`** | Identificación de F-specs (modo de apertura `UF`, `IF`, `A`, `USROPN`), operaciones `CHAIN`, `UPDATE`, `WRITE` sobre ficheros y formatos de registro |
| Análisis estático de fuentes IBM i | Rastreo de referencias cruzadas en `Rules.mk` (QDDSSRC, QRPGLESRC), prototipos en `QPROTOSRC`, `iproj.json` e `includePath` |
| Catálogos Db2 for i (`QSYS2`) | Consultas de referencia para `SYSCOLUMNS`, `SYSKEYS`, `SYSTABLESTAT`, `OBJECT_LOCK_INFO` documentadas para ejecución en sistema activo |
| Ingeniería inversa de triggers DDS | Análisis de `ORD700.PGM.RPGLE` como trigger físico sobre DETORD con impacto de escritura en ARTICLE |

---

*Informe generado por Bob — Arquitecto Técnico IBM i. Basado en análisis estático completo de los fuentes SAMCO. Las consultas de catálogo y estadísticas de sistema deben ejecutarse sobre el IBM i de destino para completar la validación.*
