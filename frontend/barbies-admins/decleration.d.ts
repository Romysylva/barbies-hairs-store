/* eslint-disable @typescript-eslint/no-explicit-any */
// declarations.d.ts
declare module "js-cookie" {
  interface CookieAttributes {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  }

  interface CookiesStatic<T = any> {
    get(name: string): string | undefined;
    get(): { [key: string]: string };
    set(
      name: string,
      value: string | T,
      options?: CookieAttributes
    ): string | undefined;
    remove(name: string, options?: CookieAttributes): void;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}
