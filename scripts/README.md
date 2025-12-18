# Scripts de Base de Datos

## 🗑️ Limpiar Base de Datos

Este script elimina **todos los registros de las tablas de negocio** manteniendo intactos los usuarios y sesiones.

### ⚠️ ADVERTENCIA

**Este script es DESTRUCTIVO e IRREVERSIBLE.** Eliminará:

- ✅ Todas las ventas y sus detalles
- ✅ Todas las compras y sus detalles
- ✅ Todos los gastos
- ✅ Todas las cuentas por cobrar y pagos
- ✅ Todo el inventario y movimientos
- ✅ Todas las nóminas
- ✅ Todas las transacciones bancarias
- ✅ Todos los clientes
- ✅ Todos los proveedores
- ✅ Todos los bancos
- ✅ Todas las categorías (productos y gastos)
- ✅ Todos los productos

**NO eliminará:**
- ❌ Usuarios
- ❌ Sesiones activas
- ❌ Cuentas de autenticación

### 📋 Requisitos Previos

1. Instalar `tsx` (ya incluido en `devDependencies`):
```bash
pnpm install
```

2. Tener configurada la variable de entorno `DATABASE_URL` en tu `.env`

### 🚀 Uso

```bash
# Ejecutar el script de limpieza
pnpm db:clear
```

### 📝 Proceso

El script ejecuta las eliminaciones en el siguiente orden para respetar las claves foráneas:

1. **Transacciones Bancarias** → `BankTransaction`
2. **Nómina** → `PayrollRunItem`, `PayrollEntry`, `PayrollRun`
3. **Cuentas por Cobrar** → `AccountsReceivablePayment`, `AccountsReceivable`
4. **Ventas** → `SalePayment`, `SaleItem`, `Sale`
5. **Gastos** → `ExpenseItem`, `Expense`
6. **Compras** → `PurchaseItem`, `Purchase`
7. **Inventario** → `StockMovement`, `Product`, `ProductCategory`
8. **Categorías** → `ExpenseCategory`
9. **Entidades Base** → `Supplier`, `Customer`, `Bank`
10. **Reseteo de Contadores** → `saleNumber`, `purchaseNumber`

### ✅ Confirmación

El script mostrará el progreso de cada tabla y confirmará al final:

```
✅ ¡Base de datos limpiada exitosamente!
ℹ️  Los usuarios y sesiones se mantuvieron intactos.
```

### 🔄 Después de Limpiar

Después de ejecutar este script:

1. Los contadores de `saleNumber` y `purchaseNumber` se reiniciarán desde 1
2. Podrás empezar de nuevo con datos limpios
3. Tu sesión de usuario seguirá activa
4. No necesitarás volver a iniciar sesión

### 🆘 Soporte

Si algo sale mal:

1. Revisa los logs del script
2. Verifica que la conexión a la base de datos esté activa
3. Asegúrate de que no haya otros procesos usando la base de datos

### 💡 Consejo

**Antes de ejecutar en producción**, considera hacer un backup de la base de datos:

```bash
# Para PostgreSQL
pg_dump -U usuario -d nombre_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

