import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import { OVERLAY_VERSION } from '../../../types/types.js';

interface IFileDelimiter {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class FileDelimiter implements IFileDelimiter {
  public dynOverlay: DynOverlay;
  private capture_base_digest: string;

  constructor(dynOverlay: DynOverlay, capture_base_digest: string) {
    if (!dynOverlay) {
      throw new Error('a dynamic extension overlay are required');
    }
    if (!capture_base_digest) {
      throw new Error('capture_base_digest is required');
    }
    this.dynOverlay = dynOverlay;
    this.capture_base_digest = capture_base_digest;
  }

  private GetDelimiter(): string {
    const delim = this.dynOverlay.delimiter;
    if (typeof delim !== 'string' || delim.length === 0) {
      throw new Error('delimiter must be a non-empty string');
    }
    return delim;
  }

  private GetEscapeChar(): string | undefined {
    const v = this.dynOverlay.escape_char;
    if (v === undefined) return undefined;
    if (typeof v !== 'string') {
      throw new Error('escape_char must be a string when provided');
    }
    return v;
  }

  private GetQuoteChar(): string | undefined {
    const v = this.dynOverlay.quote_char;
    if (v === undefined) return undefined;
    if (typeof v !== 'string') {
      throw new Error('quote_char must be a string when provided');
    }
    return v;
  }

  private GetLineTerminator(): string | undefined {
    const v = this.dynOverlay.line_terminator;
    if (v === undefined) return undefined;
    if (typeof v !== 'string') {
      throw new Error('line_terminator must be a string when provided');
    }
    return v;
  }

  private GetDataStartRow(): number | undefined {
    const v = this.dynOverlay.data_start_row;
    if (v === undefined) return undefined;
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 1) {
      throw new Error('data_start_row must be a positive integer when provided');
    }
    return v;
  }

  private toJSON(): object {
    const json: any = {
      d: '',
      capture_base: this.capture_base_digest,
      type: `community/overlays/adc/file_delimiter/${OVERLAY_VERSION}`,
      delimiter: this.GetDelimiter(),
    };
    const escapeChar = this.GetEscapeChar();
    const quoteChar = this.GetQuoteChar();
    const lineTerminator = this.GetLineTerminator();
    const dataStartRow = this.GetDataStartRow();

    if (escapeChar !== undefined) json.escape_char = escapeChar;
    if (dataStartRow !== undefined) json.data_start_row = dataStartRow;
    if (lineTerminator !== undefined) json.line_terminator = lineTerminator;
    if (quoteChar !== undefined) json.quote_char = quoteChar;

    return json;
  }

  private Saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public GenerateOverlay(): string {
    return JSON.stringify(this.Saidifying());
  }
}

export default FileDelimiter;


