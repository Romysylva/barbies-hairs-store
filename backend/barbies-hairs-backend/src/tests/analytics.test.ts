import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { User } from '../models/userModle.js';
import Order from '../models/orderModel.js';
import Booking from '../models/bookingModel.js';
import { Product } from '../models/productModules.js';
import { AnalyticsData, CustomerInsight, SalesPerformance } from '../models/analyticsModel.js';
import { AnalyticsService } from '../services/analyticsService.js';

describe('Analytics API Tests', () => {
  let adminToken: string;
  let userId: mongoose.Types.ObjectId;
  let productId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/barbies-hair-test');
    
    // Clear test data
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      Booking.deleteMany({}),
      Product.deleteMany({}),
      AnalyticsData.deleteMany({}),
      CustomerInsight.deleteMany({}),
      SalesPerformance.deleteMany({})
    ]);

    // Create test admin user
    const adminUser = new User({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
    await adminUser.save();

    // Login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      });

    adminToken = loginResponse.body.token;

    // Create test data
    await createTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      Booking.deleteMany({}),
      Product.deleteMany({}),
      AnalyticsData.deleteMany({}),
      CustomerInsight.deleteMany({}),
      SalesPerformance.deleteMany({})
    ]);
    
    await mongoose.connection.close();
  });

  // Helper function to create test data
  const createTestData = async () => {
    // Create test users
    const users = await User.insertMany([
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'user'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        password: 'password123',
        role: 'user'
      }
    ]);

    userId = users[0]._id as unknown as mongoose.Types.ObjectId;

    // Create test products
    const products = await Product.insertMany([
      {
        name: 'Hair Extensions',
        description: 'Premium hair extensions',
        price: 15000,
        category: 'Extensions',
        isActive: true
      },
      {
        name: 'Hair Treatment',
        description: 'Professional hair treatment',
        price: 8000,
        category: 'Treatment',
        isActive: true
      }
    ]);

    productId = products[0]._id as unknown as mongoose.Types.ObjectId;

    // Create test orders
    await Order.insertMany([
      {
        user: users[0]._id,
        items: [{
          product: products[0]._id,
          quantity: 2,
          price: 15000
        }],
        totalAmount: 30000,
        status: 'completed',
        shippingAddress: {
          street: '123 Test St',
          city: 'Lagos',
          state: 'Lagos',
          country: 'Nigeria',
          postalCode: '100001'
        },
        paymentMethod: 'Credit Card',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        user: users[1]._id,
        items: [{
          product: products[1]._id,
          quantity: 1,
          price: 8000
        }],
        totalAmount: 8000,
        status: 'pending',
        shippingAddress: {
          street: '456 Test Ave',
          city: 'Abuja',
          state: 'FCT',
          country: 'Nigeria',
          postalCode: '900001'
        },
        paymentMethod: 'Bank Transfer',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ]);

    // Create test bookings
    await Booking.insertMany([
      {
        user: users[0]._id,
        product: products[0]._id,
        appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        totalPrice: 15000,
        status: 'confirmed',
        notes: 'Test booking',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ]);

    // Create test customer insights
    await CustomerInsight.insertMany([
      {
        customerId: users[0]._id,
        segment: 'vip',
        lifetimeValue: 50000,
        averageOrderValue: 25000,
        totalOrders: 2,
        totalSpent: 50000,
        riskScore: 10,
        predictions: {
          churnProbability: 0.1,
          nextPurchaseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          recommendedProducts: [products[1]._id]
        }
      },
      {
        customerId: users[1]._id,
        segment: 'new',
        lifetimeValue: 8000,
        averageOrderValue: 8000,
        totalOrders: 1,
        totalSpent: 8000,
        riskScore: 30,
        predictions: {
          churnProbability: 0.3,
          nextPurchaseDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          recommendedProducts: [products[0]._id]
        }
      }
    ]);
  };

  describe('GET /api/analytics/dashboard/metrics', () => {
    it('should return dashboard metrics for authenticated admin', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard/metrics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('overview');
      expect(response.body.data).toHaveProperty('revenueChart');
      expect(response.body.data).toHaveProperty('kpis');
      expect(response.body.data.overview).toHaveProperty('totalRevenue');
      expect(response.body.data.overview).toHaveProperty('totalOrders');
      expect(response.body.data.overview).toHaveProperty('conversionRate');
    });

    it('should reject requests without admin token', async () => {
      await request(app)
        .get('/api/analytics/dashboard/metrics')
        .expect(401);
    });

    it('should handle different time periods', async () => {
      const periods = ['24h', '7d', '30d', '90d', '1y'];
      
      for (const period of periods) {
        const response = await request(app)
          .get(`/api/analytics/dashboard/metrics?period=${period}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.overview.period).toBe(period);
      }
    });
  });

  describe('GET /api/analytics/sales', () => {
    it('should return sales analytics data', async () => {
      const response = await request(app)
        .get('/api/analytics/sales?granularity=day')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderAnalytics');
      expect(response.body.data).toHaveProperty('trends');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.summary).toHaveProperty('totalRevenue');
      expect(response.body.data.summary).toHaveProperty('totalOrders');
    });

    it('should handle different granularities', async () => {
      const granularities = ['day', 'week', 'month'];
      
      for (const granularity of granularities) {
        const response = await request(app)
          .get(`/api/analytics/sales?granularity=${granularity}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('GET /api/analytics/customers', () => {
    it('should return customer analytics and segmentation', async () => {
      const response = await request(app)
        .get('/api/analytics/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('segments');
      expect(response.body.data).toHaveProperty('cohortAnalysis');
      expect(response.body.data).toHaveProperty('lifetimeValue');
      expect(response.body.data).toHaveProperty('churnRisk');
      expect(response.body.data).toHaveProperty('insights');
    });

    it('should filter by customer segment', async () => {
      const response = await request(app)
        .get('/api/analytics/customers?segment=vip')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should only return VIP segment data
      if (response.body.data.segments.length > 0) {
        expect(response.body.data.segments.every((seg: any) => seg._id === 'vip')).toBe(true);
      }
    });
  });

  describe('GET /api/analytics/products', () => {
    it('should return product performance analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/products?timeframe=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('productPerformance');
      expect(response.body.data).toHaveProperty('categoryAnalysis');
      expect(response.body.data).toHaveProperty('summary');
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/analytics/products?category=Extensions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      // Check if filtering worked
      if (response.body.data.productPerformance.length > 0) {
        expect(response.body.data.productPerformance.every((prod: any) => 
          prod.category === 'Extensions'
        )).toBe(true);
      }
    });
  });

  describe('GET /api/analytics/realtime', () => {
    it('should return real-time metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/realtime')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('liveStats');
      expect(response.body.data).toHaveProperty('recentActivity');
      expect(response.body.data).toHaveProperty('hourlyRevenue');
      expect(response.body.data.liveStats).toHaveProperty('activeUsers');
      expect(response.body.data.liveStats).toHaveProperty('ordersLastHour');
    });
  });

  describe('GET /api/analytics/reports/business-intelligence', () => {
    it('should generate business intelligence report', async () => {
      const response = await request(app)
        .get('/api/analytics/reports/business-intelligence?reportType=executive&period=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('reportType');
      expect(response.body.data).toHaveProperty('executiveSummary');
      expect(response.body.data).toHaveProperty('recommendations');
      expect(response.body.data.reportType).toBe('executive');
    });

    it('should handle different report types', async () => {
      const reportTypes = ['executive', 'sales', 'customer', 'product'];
      
      for (const reportType of reportTypes) {
        const response = await request(app)
          .get(`/api/analytics/reports/business-intelligence?reportType=${reportType}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.reportType).toBe(reportType);
      }
    });
  });

  describe('GET /api/analytics/forecast', () => {
    it('should return forecasting data', async () => {
      const response = await request(app)
        .get('/api/analytics/forecast?metric=revenue&period=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('historical');
      expect(response.body.data).toHaveProperty('forecast');
      expect(response.body.data).toHaveProperty('accuracy');
      expect(response.body.data).toHaveProperty('confidence');
    });

    it('should handle different metrics', async () => {
      const metrics = ['revenue', 'orders'];
      
      for (const metric of metrics) {
        const response = await request(app)
          .get(`/api/analytics/forecast?metric=${metric}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      }
    });
  });

  describe('Export Endpoints', () => {
    it('should export analytics data as CSV', async () => {
      const response = await request(app)
        .get('/api/analytics/export?format=csv&period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('analytics-export.csv');
    });

    it('should export analytics data as JSON', async () => {
      const response = await request(app)
        .get('/api/analytics/export?format=json&period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('exportedAt');
      expect(response.body).toHaveProperty('analytics');
    });

    it('should export business intelligence data', async () => {
      const response = await request(app)
        .get('/api/analytics/export/business-intelligence?format=json&period=30d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toHaveProperty('exportedAt');
      expect(response.body).toHaveProperty('kpis');
    });
  });

  describe('AnalyticsService Unit Tests', () => {
    it('should calculate KPIs correctly', async () => {
      const options = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        granularity: 'day' as const
      };

      const kpis = await AnalyticsService.calculateKPIs(options);

      expect(kpis).toHaveProperty('revenue');
      expect(kpis).toHaveProperty('orders');
      expect(kpis).toHaveProperty('customers');
      expect(kpis).toHaveProperty('averageOrderValue');
      expect(typeof kpis.averageOrderValue).toBe('number');
    });

    it('should calculate revenue correctly', async () => {
      const options = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        granularity: 'day' as const
      };

      const revenue = await AnalyticsService.calculateRevenue(options);

      expect(revenue).toHaveProperty('total');
      expect(revenue).toHaveProperty('breakdown');
      expect(revenue).toHaveProperty('growth');
      expect(typeof revenue.total).toBe('number');
      expect(Array.isArray(revenue.breakdown)).toBe(true);
    });

    it('should calculate customer metrics', async () => {
      const options = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };

      const customerMetrics = await AnalyticsService.calculateCustomerMetrics(options);

      expect(customerMetrics).toHaveProperty('new');
      expect(customerMetrics).toHaveProperty('active');
      expect(customerMetrics).toHaveProperty('segmentation');
      expect(customerMetrics).toHaveProperty('retention');
      expect(typeof customerMetrics.new).toBe('number');
      expect(typeof customerMetrics.active).toBe('number');
    });

    it('should calculate product performance', async () => {
      const options = {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date()
      };

      const productMetrics = await AnalyticsService.calculateProductPerformance(options);

      expect(Array.isArray(productMetrics)).toBe(true);
      if (productMetrics.length > 0) {
        expect(productMetrics[0]).toHaveProperty('name');
        expect(productMetrics[0]).toHaveProperty('totalRevenue');
        expect(productMetrics[0]).toHaveProperty('totalSales');
      }
    });

    it('should generate predictions', async () => {
      const historicalData = [
        { revenue: 10000 },
        { revenue: 12000 },
        { revenue: 11000 },
        { revenue: 13000 },
        { revenue: 15000 }
      ];

      const predictions = await AnalyticsService.generatePredictions('revenue', historicalData, 7);

      expect(Array.isArray(predictions)).toBe(true);
      expect(predictions.length).toBe(7);
      if (predictions.length > 0) {
        expect(predictions[0]).toHaveProperty('day');
        expect(predictions[0]).toHaveProperty('value');
        expect(predictions[0]).toHaveProperty('confidence');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges', async () => {
      const response = await request(app)
        .get('/api/analytics/sales?startDate=invalid-date')
        .set('Authorization', `Bearer ${adminToken}`);

      // Should either return 400 or handle gracefully with default dates
      expect([200, 400]).toContain(response.status);
    });

    it('should handle missing authentication', async () => {
      await request(app)
        .get('/api/analytics/dashboard/metrics')
        .expect(401);
    });

    it('should handle non-admin user access', async () => {
      // Create regular user and get token
      const regularUser = new User({
        firstName: 'Regular',
        lastName: 'User',
        email: 'regular@test.com',
        password: 'password123',
        role: 'user'
      });
      await regularUser.save();

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'regular@test.com',
          password: 'password123'
        });

      const regularToken = loginResponse.body.token;

      await request(app)
        .get('/api/analytics/dashboard/metrics')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);
    });
  });

  describe('Real-time Analytics', () => {
    it('should return real-time metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/realtime')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('liveStats');
      expect(response.body.data.liveStats).toHaveProperty('activeUsers');
      expect(response.body.data.liveStats).toHaveProperty('ordersLastHour');
      expect(response.body.data.liveStats).toHaveProperty('bookingsLastHour');
    });
  });

  describe('Data Validation', () => {
    it('should validate revenue calculations', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard/metrics?period=7d')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const totalRevenue = response.body.data.overview.totalRevenue;
      expect(typeof totalRevenue).toBe('number');
      expect(totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it('should validate order counts', async () => {
      const response = await request(app)
        .get('/api/analytics/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const totalOrders = response.body.data.summary.totalOrders;
      expect(typeof totalOrders).toBe('number');
      expect(totalOrders).toBeGreaterThanOrEqual(0);
    });

    it('should validate customer metrics', async () => {
      const response = await request(app)
        .get('/api/analytics/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const insights = response.body.data.insights;
      expect(typeof insights.totalCustomers).toBe('number');
      expect(insights.totalCustomers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time limits', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/api/analytics/dashboard/metrics')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/analytics/dashboard/metrics')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
