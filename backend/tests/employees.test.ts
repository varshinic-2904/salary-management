import { request, app, prisma, seedTestEmployees } from './helpers';

describe('Employee API', () => {
  let employeeId: string;

  beforeEach(async () => {
    await seedTestEmployees();
    const employees = await prisma.employee.findMany();
    employeeId = employees[0].id;
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
  });

  describe('GET /api/v1/employees', () => {
    it('returns paginated employees', async () => {
      const res = await request(app).get('/api/v1/employees').expect(200);
      expect(res.body.data).toHaveLength(5);
      expect(res.body.total).toBe(5);
      expect(res.body.page).toBe(1);
      expect(res.body.totalPages).toBe(1);
    });

    it('filters by country', async () => {
      const res = await request(app)
        .get('/api/v1/employees?country=US')
        .expect(200);
      expect(res.body.data.every((e: { country: string }) => e.country === 'US')).toBe(true);
      expect(res.body.total).toBe(3);
    });

    it('filters by department', async () => {
      const res = await request(app)
        .get('/api/v1/employees?department=Engineering')
        .expect(200);
      expect(res.body.total).toBe(2);
    });

    it('searches by name case-insensitively', async () => {
      const res = await request(app)
        .get('/api/v1/employees?search=alice')
        .expect(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].firstName).toBe('Alice');
    });

    it('paginates results', async () => {
      const res = await request(app)
        .get('/api/v1/employees?page=1&limit=2')
        .expect(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.totalPages).toBe(3);
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('returns employee by id', async () => {
      const res = await request(app)
        .get(`/api/v1/employees/${employeeId}`)
        .expect(200);
      expect(res.body.firstName).toBe('Alice');
      expect(res.body.baseSalary).toBe(100000);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app)
        .get('/api/v1/employees/nonexistent')
        .expect(404);
      expect(res.body.error).toBe('Employee not found');
    });
  });

  describe('POST /api/v1/employees', () => {
    it('creates a new employee', async () => {
      const res = await request(app)
        .post('/api/v1/employees')
        .send({
          firstName: 'Frank',
          lastName: 'Foster',
          email: 'frank@acme.com',
          department: 'Engineering',
          jobTitle: 'Software Engineer',
          country: 'US',
          currency: 'USD',
          baseSalary: 95000,
          employmentType: 'FULL_TIME',
          hireDate: '2023-01-01',
        })
        .expect(201);

      expect(res.body.firstName).toBe('Frank');
      expect(res.body.employeeCode).toBeDefined();
      expect(res.body.baseSalary).toBe(95000);
    });

    it('rejects invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/employees')
        .send({ firstName: 'Bad' })
        .expect(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('PATCH /api/v1/employees/:id', () => {
    it('updates employee salary', async () => {
      const res = await request(app)
        .patch(`/api/v1/employees/${employeeId}`)
        .send({ baseSalary: 110000 })
        .expect(200);
      expect(res.body.baseSalary).toBe(110000);
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('deletes an employee', async () => {
      await request(app).delete(`/api/v1/employees/${employeeId}`).expect(204);
      const count = await prisma.employee.count();
      expect(count).toBe(4);
    });
  });

  describe('GET /api/v1/employees/export', () => {
    it('exports employees as CSV', async () => {
      const res = await request(app)
        .get('/api/v1/employees/export?country=US')
        .expect(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('employeeCode');
      expect(res.text).toContain('Alice');
    });
  });
});
