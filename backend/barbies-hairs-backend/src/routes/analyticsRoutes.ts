import express from 'express';
import {
  getAdvancedDashboardMetrics,
  getSalesAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getRealTimeMetrics,
  getBusinessIntelligenceReport,
  getForecasting,
} from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middlewares/authmiddleware.js';
import { ExportService } from '../services/exportService.js';

const router = express.Router();

// Protect all analytics routes - admin only
router.use(protect);
router.use(adminOnly);

// 📊 Advanced Dashboard Metrics
router.get('/dashboard/metrics', getAdvancedDashboardMetrics);

// 📈 Sales Analytics
router.get('/sales', getSalesAnalytics);

// 👥 Customer Analytics & Insights
router.get('/customers', getCustomerAnalytics);

// 📦 Product Performance Analytics
router.get('/products', getProductAnalytics);

// 🔄 Real-time Analytics
router.get('/realtime', getRealTimeMetrics);

// 🎯 Business Intelligence Reports
router.get('/reports/business-intelligence', getBusinessIntelligenceReport);

// 📅 Forecasting and Predictions
router.get('/forecast', getForecasting);

// 📊 Cohort Analysis (specific endpoint for detailed cohort data)
router.get('/cohort', async (req, res) => {
  // This can be moved to controller later if needed
  res.status(501).json({
    success: false,
    message: 'Cohort analysis endpoint coming soon',
  });
});

// 🎯 A/B Testing Results
router.get('/ab-testing', async (req, res) => {
  // Placeholder for A/B testing analytics
  res.status(501).json({
    success: false,
    message: 'A/B testing analytics endpoint coming soon',
  });
});

// 📱 Channel Performance
router.get('/channels', async (req, res) => {
  // Placeholder for marketing channel analytics
  res.status(501).json({
    success: false,
    message: 'Channel performance analytics endpoint coming soon',
  });
});

// 📤 Export Routes
router.get('/export', async (req, res) => {
  const { format = 'csv', period = '30d', startDate, endDate } = req.query;

  await ExportService.exportAnalyticsData(
    {
      format: format as 'csv' | 'pdf' | 'excel' | 'json',
      period: period as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    },
    res,
  );
});

router.get('/export/business-intelligence', async (req, res) => {
  const { format = 'excel', period = '30d', startDate, endDate } = req.query;

  await ExportService.exportBusinessIntelligenceData(
    {
      format: format as 'csv' | 'excel' | 'json',
      period: period as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    },
    res,
  );
});

export default router;
