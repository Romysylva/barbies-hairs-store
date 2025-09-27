/**
 * Service Validation Utility
 * Tests API connectivity and service functionality
 */

import { API_BASE_URL, ENDPOINTS } from '../config/apiConfig';

interface ValidationResult {
  endpoint: string;
  status: 'success' | 'error' | 'not_implemented';
  message: string;
  responseTime?: number;
}

export class ServiceValidator {
  private static async testEndpoint(endpoint: string, expectedStatus: number = 200): Promise<ValidationResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;

      if (response.status === 501) {
        return {
          endpoint,
          status: 'not_implemented',
          message: 'Endpoint not yet implemented',
          responseTime
        };
      }

      if (response.status === expectedStatus || response.status === 401) {
        // 401 is expected for protected routes without auth
        return {
          endpoint,
          status: 'success',
          message: `Endpoint accessible (${response.status})`,
          responseTime
        };
      }

      return {
        endpoint,
        status: 'error',
        message: `Unexpected status: ${response.status}`,
        responseTime
      };
    } catch (error: any) {
      return {
        endpoint,
        status: 'error',
        message: `Connection failed: ${error.message}`,
        responseTime: Date.now() - startTime
      };
    }
  }

  static async validateCoreEndpoints(): Promise<ValidationResult[]> {
    console.log('🔍 Validating core API endpoints...');
    
    const coreEndpoints = [
      // Base endpoint
      '',
      // Admin endpoints
      ENDPOINTS.ADMIN.STATS,
      ENDPOINTS.ADMIN.ACTIVITY_LOGS,
      // Analytics endpoints
      ENDPOINTS.ANALYTICS.DASHBOARD_METRICS,
      ENDPOINTS.ANALYTICS.SALES,
      ENDPOINTS.ANALYTICS.CUSTOMERS,
      ENDPOINTS.ANALYTICS.PRODUCTS,
      // Entity endpoints
      ENDPOINTS.USERS.BASE,
      ENDPOINTS.ORDERS.BASE,
      ENDPOINTS.PRODUCTS.BASE,
      ENDPOINTS.BOOKINGS.BASE,
      ENDPOINTS.CATEGORIES.BASE,
    ];

    const results: ValidationResult[] = [];

    for (const endpoint of coreEndpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      
      console.log(`${result.status === 'success' ? '✅' : result.status === 'not_implemented' ? '⚠️' : '❌'} ${endpoint || '/'} - ${result.message} (${result.responseTime}ms)`);
    }

    return results;
  }

  static async validateAuthEndpoints(): Promise<ValidationResult[]> {
    console.log('\n🔐 Validating authentication endpoints...');
    
    const authEndpoints = [
      ENDPOINTS.AUTH.LOGIN,
      ENDPOINTS.AUTH.LOGOUT,
      ENDPOINTS.AUTH.REGISTER,
      ENDPOINTS.AUTH.ME,
    ];

    const results: ValidationResult[] = [];

    for (const endpoint of authEndpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      
      console.log(`${result.status === 'success' ? '✅' : result.status === 'not_implemented' ? '⚠️' : '❌'} ${endpoint} - ${result.message} (${result.responseTime}ms)`);
    }

    return results;
  }

  static async validateAnalyticsEndpoints(): Promise<ValidationResult[]> {
    console.log('\n📊 Validating analytics endpoints...');
    
    const analyticsEndpoints = [
      `${ENDPOINTS.ANALYTICS.DASHBOARD_METRICS}?period=7d`,
      `${ENDPOINTS.ANALYTICS.SALES}?period=30d`,
      `${ENDPOINTS.ANALYTICS.CUSTOMERS}?period=30d`,
      `${ENDPOINTS.ANALYTICS.PRODUCTS}?period=30d`,
      ENDPOINTS.ANALYTICS.REALTIME,
      `${ENDPOINTS.ANALYTICS.BUSINESS_INTELLIGENCE}?reportType=executive&period=30d`,
      `${ENDPOINTS.ANALYTICS.FORECAST}?metric=revenue&period=30d`,
    ];

    const results: ValidationResult[] = [];

    for (const endpoint of analyticsEndpoints) {
      const result = await this.testEndpoint(endpoint);
      results.push(result);
      
      console.log(`${result.status === 'success' ? '✅' : result.status === 'not_implemented' ? '⚠️' : '❌'} ${endpoint} - ${result.message} (${result.responseTime}ms)`);
    }

    return results;
  }

  static async validateAllServices(): Promise<{
    core: ValidationResult[];
    auth: ValidationResult[];
    analytics: ValidationResult[];
    summary: {
      total: number;
      successful: number;
      notImplemented: number;
      errors: number;
    };
  }> {
    console.log('🚀 Starting comprehensive service validation...\n');
    
    const core = await this.validateCoreEndpoints();
    const auth = await this.validateAuthEndpoints();
    const analytics = await this.validateAnalyticsEndpoints();

    const allResults = [...core, ...auth, ...analytics];
    const summary = {
      total: allResults.length,
      successful: allResults.filter(r => r.status === 'success').length,
      notImplemented: allResults.filter(r => r.status === 'not_implemented').length,
      errors: allResults.filter(r => r.status === 'error').length,
    };

    console.log('\n📈 Validation Summary:');
    console.log(`✅ Successful: ${summary.successful}/${summary.total}`);
    console.log(`⚠️ Not Implemented: ${summary.notImplemented}/${summary.total}`);
    console.log(`❌ Errors: ${summary.errors}/${summary.total}`);

    if (summary.successful > 0) {
      console.log('\n🎉 Services are connecting to the real backend API!');
    }

    return { core, auth, analytics, summary };
  }

  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(API_BASE_URL.replace('/api/barbies/v1', ''), {
        method: 'GET',
        timeout: 5000
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default ServiceValidator;
