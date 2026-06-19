import { request, app, seedTestEmployees, prisma } from './helpers';

describe('Analytics API', () => {
  beforeEach(async () => {
    await seedTestEmployees();
  });

  afterAll(async () => {
    await prisma.employee.deleteMany();
  });

  describe('GET /api/v1/analytics/summary', () => {
    it('returns org-wide summary', async () => {
      const res = await request(app).get('/api/v1/analytics/summary').expect(200);
      expect(res.body.totalEmployees).toBe(5);
      expect(res.body.byCurrency).toBeDefined();
      expect(res.body.byCurrency.USD).toBeDefined();
      expect(res.body.byCurrency.USD.count).toBe(3);
    });

    it('filters summary by currency', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/summary?currency=USD')
        .expect(200);
      expect(res.body.overall.count).toBe(3);
      expect(res.body.overall.avg).toBeCloseTo(85000, 0);
      expect(res.body.overall.median).toBe(80000);
    });
  });

  describe('GET /api/v1/analytics/by-dimension', () => {
    it('groups by country', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/by-dimension?dimension=country')
        .expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      const us = res.body.find((d: { name: string }) => d.name === 'US');
      expect(us.count).toBe(3);
    });

    it('groups by department', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/by-dimension?dimension=department')
        .expect(200);
      const eng = res.body.find((d: { name: string }) => d.name === 'Engineering');
      expect(eng.count).toBe(2);
    });
  });

  describe('GET /api/v1/analytics/distribution', () => {
    it('returns histogram and percentiles', async () => {
      const res = await request(app)
        .get('/api/v1/analytics/distribution?currency=USD')
        .expect(200);
      expect(res.body.histogram).toHaveLength(10);
      expect(res.body.percentiles.p50).toBeDefined();
      expect(res.body.percentiles.p25).toBeLessThanOrEqual(res.body.percentiles.p50);
      expect(res.body.percentiles.p75).toBeGreaterThanOrEqual(res.body.percentiles.p50);
    });
  });

  describe('GET /api/v1/analytics/filters', () => {
    it('returns filter options', async () => {
      const res = await request(app).get('/api/v1/analytics/filters').expect(200);
      expect(res.body.countries).toContain('US');
      expect(res.body.departments).toContain('Engineering');
      expect(res.body.currencies).toContain('USD');
    });
  });
});
