import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';

import rentalRoutes   from './routes/rental.routes';
import suitRoutes     from './routes/suit.routes';
import userRoutes     from './routes/user.routes';
import supplierRoutes from './routes/supplier.routes';
import customerRoutes from './routes/customer.routes';
import categoryRoutes from './routes/category.routes';
import warehouseRoutes from './routes/warehouse.routes';
import productRoutes  from './routes/product.routes';
import purchaseRoutes from './routes/purchase.routes';
import saleRoutes     from './routes/sale.routes';
import voucherRoutes  from './routes/voucher.routes';
import reportRoutes   from './routes/report.routes';
import employeeRoutes  from './routes/employee.routes';
import itemRentalRoutes from './routes/item.rental.routes';

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Luxe Suits ERP API' });
});

app.use('/api/rentals',    rentalRoutes);
app.use('/api/suits',      suitRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/suppliers',  supplierRoutes);
app.use('/api/customers',  customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/purchases',  purchaseRoutes);
app.use('/api/sales',      saleRoutes);
app.use('/api/vouchers',   voucherRoutes);
app.use('/api/reports',    reportRoutes);
app.use('/api/employees',    employeeRoutes);
app.use('/api/item-rentals', itemRentalRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
