// Jest type declarations

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeCloseTo(expected: number, precision?: number): R;
      toContain(expected: any): R;
      toEqual(expected: any): R;
      toHaveProperty(property: string, value?: any): R;
    }
  }

  const describe: (name: string, fn: () => void) => void;
  const it: (name: string, fn: () => void | Promise<void>) => void;
  const test: (name: string, fn: () => void | Promise<void>) => void;
  const expect: (actual: any) => jest.Matchers<any>;
  const beforeEach: (fn: () => void | Promise<void>) => void;
  const afterEach: (fn: () => void | Promise<void>) => void;
  const beforeAll: (fn: () => void | Promise<void>) => void;
  const afterAll: (fn: () => void | Promise<void>) => void;
  
  namespace jest {
    interface Mock<T = any, Y extends any[] = any> {
      (...args: Y): T;
      mockReturnValue(value: T): Mock<T, Y>;
      mockResolvedValue(value: T): Mock<Promise<T>, Y>;
      mockRejectedValue(error: any): Mock<Promise<never>, Y>;
      mockImplementation(fn: (...args: Y) => T): Mock<T, Y>;
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
    }

    interface SpyInstance<T = any, Y extends any[] = any> extends Mock<T, Y> {}
  }

  const jest: {
    fn<T extends (...args: any[]) => any>(implementation?: T): jest.Mock<ReturnType<T>, Parameters<T>>;
    spyOn<T extends {}, M extends keyof T>(object: T, method: M): jest.SpyInstance<T[M] extends (...args: any[]) => any ? ReturnType<T[M]> : any, T[M] extends (...args: any[]) => any ? Parameters<T[M]> : any[]>;
    clearAllMocks(): void;
    resetAllMocks(): void;
    restoreAllMocks(): void;
  };
}

export {};
