import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';
import { OVERLAY_VERSION } from '../../../types/types.js';

interface IArrayDelimiter {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class ArrayDelimiter implements IArrayDelimiter {
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

  private GetDefaultDelimiter(): string {
    const delim = this.dynOverlay.delimiter;
    if (delim === undefined) {
      return '';
    }
    if (typeof delim !== 'string') {
      throw new Error('delimiter must be a string when provided');
    }
    return delim;
  }

  private GetAttributesConfig(): any {
    const attributes = this.dynOverlay.attributes || {};
    const canonicalized = canonicalize(attributes);
    const sorted = JSON.parse(canonicalized);
    return sorted;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: `community/overlays/adc/array_delimiter/${OVERLAY_VERSION}`,
      attributes: this.GetAttributesConfig(),
      delimiter: this.GetDefaultDelimiter(),
    };
  }

  private Saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public GenerateOverlay(): string {
    return JSON.stringify(this.Saidifying());
  }
}

export default ArrayDelimiter;


