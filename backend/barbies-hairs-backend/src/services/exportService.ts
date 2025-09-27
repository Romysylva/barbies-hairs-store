import { Response } from 'express';
import { AnalyticsService } from './analyticsService.js';
import { BusinessReport } from '../models/analyticsModel.js';
import mongoose from 'mongoose';

export interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel' | 'json';
  period: string;
  startDate?: Date;
  endDate?: Date;
  reportType?: string;
  includeCharts?: boolean;
}

export class ExportService {
  // 📊 Export Analytics Data
  static async exportAnalyticsData(options: ExportOptions, res: Response) {
    const { format, period, startDate, endDate } = options;

    try {
      // Calculate date range
      const dates = this.calculateDateRange(period, startDate, endDate);

      // Get analytics data
      const kpis = await AnalyticsService.calculateKPIs({
        startDate: dates.start,
        endDate: dates.end,
        granularity: 'day',
      });

      switch (format) {
        case 'csv':
          return this.exportToCSV(kpis, res);
        case 'pdf':
          return this.exportToPDF(kpis, res, options);
        case 'excel':
          return this.exportToExcel(kpis, res);
        case 'json':
          return this.exportToJSON(kpis, res);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting data',
      });
    }
  }

  // 📄 Export to CSV
  private static exportToCSV(data: any, res: Response) {
    try {
      // Flatten the data for CSV export
      const flatData = this.flattenAnalyticsData(data);

      // Simple CSV generation without external library
      const headers = Object.keys(flatData[0] || {});
      const csvRows = [headers.join(',')];

      flatData.forEach((row: any) => {
        const values = headers.map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        });
        csvRows.push(values.join(','));
      });

      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=analytics-export.csv',
      );
      res.send(csv);
    } catch (error) {
      throw new Error('Failed to export CSV');
    }
  }

  // 📑 Export to PDF (simplified without PDFKit)
  private static exportToPDF(data: any, res: Response, options: ExportOptions) {
    // For now, return JSON with PDF structure until PDFKit is properly installed
    const pdfData = {
      title: 'Barbies Hair Analytics Report',
      generated: new Date().toLocaleDateString(),
      period: options.period,
      executiveSummary: {
        totalRevenue: data.revenue?.total || 0,
        totalOrders: data.orders?.total || 0,
        averageOrderValue: data.averageOrderValue || 0,
        conversionRate: data.conversionRate?.rate || 0,
      },
      customerMetrics: {
        newCustomers: data.customers?.new || 0,
        activeCustomers: data.customers?.active || 0,
        customerLifetimeValue: data.customerLifetimeValue?.averageCLV || 0,
        churnRate: data.churnRate?.rate || 0,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=analytics-report.json',
    );
    res.json(pdfData);
  }

  // 📊 Export to Excel (simplified without ExcelJS)
  private static async exportToExcel(data: any, res: Response) {
    try {
      // Create Excel-like JSON structure
      const excelData = {
        Summary: [
          {
            Metric: 'Total Revenue',
            Value: `₦${(data.revenue?.total || 0).toLocaleString()}`,
          },
          { Metric: 'Total Orders', Value: data.orders?.total || 0 },
          {
            Metric: 'Average Order Value',
            Value: `₦${(data.averageOrderValue || 0).toLocaleString()}`,
          },
          {
            Metric: 'Conversion Rate',
            Value: `${(data.conversionRate?.rate || 0).toFixed(2)}%`,
          },
          { Metric: 'New Customers', Value: data.customers?.new || 0 },
          { Metric: 'Active Customers', Value: data.customers?.active || 0 },
        ],
        RevenueBreakdown: data.revenue?.breakdown || [],
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=analytics-export.json',
      );
      res.json(excelData);
    } catch (error) {
      throw new Error('Failed to export Excel');
    }
  }

  // 📝 Export to JSON
  private static exportToJSON(data: any, res: Response) {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        period: data.period,
        analytics: data,
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename=analytics-export.json',
      );
      res.json(exportData);
    } catch (error) {
      throw new Error('Failed to export JSON');
    }
  }

  // 🔄 Generate Scheduled Reports
  static async generateScheduledReport(reportConfig: any) {
    try {
      const { reportType, period, recipients, format = 'pdf' } = reportConfig;

      // Calculate date range
      const dates = this.calculateDateRange(period);

      // Get analytics data
      const kpis = await AnalyticsService.calculateKPIs({
        startDate: dates.start,
        endDate: dates.end,
        granularity: 'day',
      });

      // Create business report record
      const report = new BusinessReport({
        reportType,
        title: `${reportType} Report - ${new Date().toLocaleDateString()}`,
        parameters: {
          startDate: dates.start,
          endDate: dates.end,
          granularity: 'day',
        },
        data: {
          summary: kpis,
          charts: [], // Would include chart data
          tables: [], // Would include table data
          insights: this.generateInsights(kpis),
          recommendations: this.generateRecommendations(kpis),
        },
        status: 'completed',
        generatedBy: new mongoose.Types.ObjectId(), // Should be actual admin user ID
        isScheduled: true,
        scheduleConfig: reportConfig,
      });

      await report.save();

      // Send report to recipients (email integration would go here)
      console.log(`Scheduled report generated: ${report.reportId}`);

      return report;
    } catch (error) {
      console.error('Error generating scheduled report:', error);
      throw error;
    }
  }

  // 📈 Bulk Export for Business Intelligence
  static async exportBusinessIntelligenceData(
    options: ExportOptions,
    res: Response,
  ) {
    try {
      const dates = this.calculateDateRange(
        options.period,
        options.startDate,
        options.endDate,
      );

      // Get comprehensive BI data
      const [kpis, productPerformance, customerSegmentation, salesTrends] =
        await Promise.all([
          AnalyticsService.calculateKPIs({
            startDate: dates.start,
            endDate: dates.end,
            granularity: 'day',
          }),
          AnalyticsService.calculateProductPerformance({
            startDate: dates.start,
            endDate: dates.end,
          }),
          AnalyticsService.calculateCustomerSegmentation({
            startDate: dates.start,
            endDate: dates.end,
          }),
          AnalyticsService.calculateRevenue({
            startDate: dates.start,
            endDate: dates.end,
            granularity: 'day',
          }),
        ]);

      const biData = {
        kpis,
        productPerformance,
        customerSegmentation,
        salesTrends,
        exportMetadata: {
          generatedAt: new Date(),
          period: options.period,
          dateRange: dates,
        },
      };

      switch (options.format) {
        case 'csv':
          return this.exportBIToCSV(biData, res);
        case 'excel':
          return this.exportBIToExcel(biData, res);
        case 'json':
          return this.exportBIToJSON(biData, res);
        default:
          throw new Error('Unsupported format for BI export');
      }
    } catch (error) {
      console.error('Error exporting BI data:', error);
      res.status(500).json({
        success: false,
        message: 'Error exporting business intelligence data',
      });
    }
  }

  // Helper Methods
  private static calculateDateRange(
    period: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const end = endDate || new Date();
    const start = startDate || new Date();

    if (!startDate) {
      switch (period) {
        case '7d':
          start.setDate(start.getDate() - 7);
          break;
        case '30d':
          start.setDate(start.getDate() - 30);
          break;
        case '90d':
          start.setDate(start.getDate() - 90);
          break;
        case '1y':
          start.setFullYear(start.getFullYear() - 1);
          break;
        default:
          start.setDate(start.getDate() - 30);
      }
    }

    return { start, end };
  }

  private static flattenAnalyticsData(data: any): any[] {
    const flattened: any[] = [];

    // Revenue breakdown
    if (data.revenue?.breakdown) {
      data.revenue.breakdown.forEach((item: any) => {
        flattened.push({
          date: item._id,
          type: 'revenue',
          revenue: item.totalRevenue,
          orders: item.orderCount,
          averageOrderValue: item.averageOrderValue,
        });
      });
    }

    // Customer data
    if (data.customers?.segmentation) {
      data.customers.segmentation.forEach((segment: any) => {
        flattened.push({
          segment: segment._id,
          type: 'customer_segment',
          count: segment.count,
          averageLifetimeValue: segment.averageLifetimeValue,
          totalSpent: segment.totalSpent,
        });
      });
    }

    return flattened.length > 0
      ? flattened
      : [{ message: 'No data available for export' }];
  }

  private static async exportBIToExcel(data: any, res: Response) {
    // Create Excel-like JSON structure for BI data
    const excelData = {
      KPIs: [
        {
          Metric: 'Total Revenue',
          Value: data.kpis.revenue?.total || 0,
          Growth: data.kpis.revenue?.growth || 0,
        },
        {
          Metric: 'Total Orders',
          Value: data.kpis.orders?.total || 0,
          Growth: 0,
        },
        {
          Metric: 'Average Order Value',
          Value: data.kpis.averageOrderValue || 0,
          Growth: 0,
        },
        {
          Metric: 'Conversion Rate',
          Value: data.kpis.conversionRate?.rate || 0,
          Growth: 0,
        },
      ],
      ProductPerformance: data.productPerformance || [],
      CustomerSegmentation: data.customerSegmentation || [],
      SalesTrends: data.salesTrends || [],
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=business-intelligence-export.json',
    );
    res.json(excelData);
  }

  private static exportBIToCSV(data: any, res: Response) {
    // Combine all data into a single CSV structure
    const csvData = [];

    // Add KPIs
    csvData.push({
      category: 'KPI',
      metric: 'Total Revenue',
      value: data.kpis.revenue?.total || 0,
      period: data.exportMetadata.period,
    });

    csvData.push({
      category: 'KPI',
      metric: 'Total Orders',
      value: data.kpis.orders?.total || 0,
      period: data.exportMetadata.period,
    });

    // Add product performance
    data.productPerformance?.forEach((product: any) => {
      csvData.push({
        category: 'Product',
        metric: product.name,
        value: product.totalRevenue,
        period: data.exportMetadata.period,
        additionalInfo: `Sales: ${product.totalSales}, Category: ${product.category}`,
      });
    });

    // Add customer segments
    data.customerSegmentation?.forEach((segment: any) => {
      csvData.push({
        category: 'Customer Segment',
        metric: segment._id,
        value: segment.totalSpent,
        period: data.exportMetadata.period,
        additionalInfo: `Count: ${segment.count}, Avg CLV: ${segment.averageLifetimeValue}`,
      });
    });

    // Simple CSV generation
    const headers = ['category', 'metric', 'value', 'period', 'additionalInfo'];
    const csvRows = [headers.join(',')];

    csvData.forEach((row: any) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (
          typeof value === 'string' &&
          (value.includes(',') || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(values.join(','));
    });

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=business-intelligence-export.csv',
    );
    res.send(csv);
  }

  private static exportBIToJSON(data: any, res: Response) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=business-intelligence-export.json',
    );
    res.json({
      exportedAt: new Date().toISOString(),
      ...data,
    });
  }

  // 📧 Generate Email Report
  static async generateEmailReport(reportConfig: any) {
    try {
      const dates = this.calculateDateRange(reportConfig.period);

      const kpis = await AnalyticsService.calculateKPIs({
        startDate: dates.start,
        endDate: dates.end,
        granularity: 'day',
      });

      const emailContent = this.generateEmailHTML(kpis, reportConfig);

      // Email service integration would go here
      return {
        success: true,
        recipients: reportConfig.recipients,
        subject: `Business Intelligence Report - ${new Date().toLocaleDateString()}`,
        content: emailContent,
      };
    } catch (error) {
      console.error('Error generating email report:', error);
      throw error;
    }
  }

  private static generateEmailHTML(data: any, config: any): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
            .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
            .metric { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; }
            .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .metric-label { font-size: 14px; color: #6c757d; }
            .section { margin: 20px 0; padding: 15px; border-left: 4px solid #667eea; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Barbies Hair Business Intelligence Report</h1>
            <p suppressHydrationWarning>Period: ${config.period} | Generated: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="metrics">
            <div class="metric">
              <div class="metric-value">₦${(data.revenue?.total || 0).toLocaleString()}</div>
              <div class="metric-label">Total Revenue</div>
            </div>
            <div class="metric">
              <div class="metric-value">${(data.orders?.total || 0).toLocaleString()}</div>
              <div class="metric-label">Total Orders</div>
            </div>
            <div class="metric">
              <div class="metric-value">₦${(data.averageOrderValue || 0).toLocaleString()}</div>
              <div class="metric-label">Average Order Value</div>
            </div>
            <div class="metric">
              <div class="metric-value">${(data.conversionRate?.rate || 0).toFixed(2)}%</div>
              <div class="metric-label">Conversion Rate</div>
            </div>
          </div>

          <div class="section">
            <h3>Customer Insights</h3>
            <p><strong>New Customers:</strong> ${data.customers?.new || 0}</p>
            <p><strong>Active Customers:</strong> ${data.customers?.active || 0}</p>
            <p><strong>Customer Lifetime Value:</strong> ₦${(data.customerLifetimeValue?.averageCLV || 0).toLocaleString()}</p>
            <p><strong>Churn Rate:</strong> ${(data.churnRate?.rate || 0).toFixed(2)}%</p>
          </div>

          <div class="section">
            <h3>Business Recommendations</h3>
            <ul>
              ${this.generateRecommendations(data)
                .map((rec) => `<li>${rec}</li>`)
                .join('')}
            </ul>
          </div>
        </body>
      </html>
    `;
  }

  private static generateInsights(data: any): string[] {
    const insights = [];

    if (data.revenue?.growth > 10) {
      insights.push(
        `Revenue is growing strongly at ${data.revenue.growth.toFixed(1)}%`,
      );
    } else if (data.revenue?.growth < -5) {
      insights.push(
        `Revenue is declining at ${Math.abs(data.revenue.growth).toFixed(1)}%`,
      );
    }

    if (data.customers?.new > 100) {
      insights.push('Strong customer acquisition this period');
    }

    if (data.churnRate?.rate > 15) {
      insights.push(
        'High churn rate detected - customer retention needs attention',
      );
    }

    return insights;
  }

  private static generateRecommendations(data: any): string[] {
    const recommendations = [];

    if (data.averageOrderValue < 5000) {
      recommendations.push(
        'Implement upselling strategies to increase average order value',
      );
    }

    if (data.conversionRate?.rate < 2) {
      recommendations.push(
        'Optimize conversion funnel to improve conversion rate',
      );
    }

    if (data.churnRate?.rate > 10) {
      recommendations.push(
        'Implement customer retention programs to reduce churn',
      );
    }

    if (data.customers?.new < 50) {
      recommendations.push(
        'Increase marketing efforts to acquire new customers',
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ['Business metrics are performing well'];
  }
}
