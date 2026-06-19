import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createEmployee,
  deleteEmployee,
  employeesToCsv,
  exportEmployees,
  getEmployeeById,
  listEmployees,
  updateEmployee,
} from '../services/employeeService';
import {
  createEmployeeSchema,
  listEmployeesSchema,
  updateEmployeeSchema,
} from '../validators/employee';

const router = Router();

router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const params = listEmployeesSchema.parse(req.query);
    const employees = await exportEmployees(params);
    const csv = employeesToCsv(employees);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    res.send(csv);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const params = listEmployeesSchema.parse(req.query);
    const result = await listEmployees(params);
    res.json(result);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const employee = await getEmployeeById(id);
    res.json(employee);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const input = createEmployeeSchema.parse(req.body);
    const employee = await createEmployee(input);
    res.status(201).json(employee);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    const input = updateEmployeeSchema.parse(req.body);
    const employee = await updateEmployee(id, input);
    res.json(employee);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = req.params.id as string;
    await deleteEmployee(id);
    res.status(204).send();
  })
);

export default router;
