// Type declarations for external libraries

declare module 'slugify' {
  interface SlugifyOptions {
    replacement?: string;
    remove?: RegExp;
    lower?: boolean;
    strict?: boolean;
    locale?: string;
    trim?: boolean;
  }

  function slugify(string: string, options?: SlugifyOptions): string;
  export = slugify;
}

declare module 'json2csv' {
  export interface ParserOptions {
    fields?: string[];
    delimiter?: string;
    eol?: string;
    quote?: string;
    header?: boolean;
    includeEmptyRows?: boolean;
    withBOM?: boolean;
  }

  export class Parser {
    constructor(options?: ParserOptions);
    parse(data: any[]): string;
  }
}

declare module 'pdfkit' {
  interface PDFDocumentOptions {
    compress?: boolean;
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
    };
    userPassword?: string;
    ownerPassword?: string;
    permissions?: {
      modifying?: boolean;
      copying?: boolean;
      annotating?: boolean;
      fillingForms?: boolean;
      contentAccessibility?: boolean;
      documentAssembly?: boolean;
    };
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    pipe(stream: NodeJS.WritableStream): void;
    fontSize(size: number): this;
    text(text: string, x?: number, y?: number): this;
    end(): void;
  }

  export = PDFDocument;
}

declare module 'exceljs' {
  export interface Workbook {
    addWorksheet(name: string): Worksheet;
    xlsx: {
      write(stream: NodeJS.WritableStream): Promise<void>;
    };
  }

  export interface Worksheet {
    addRow(values: any[]): void;
  }

  export class Workbook implements Workbook {
    constructor();
  }
}
