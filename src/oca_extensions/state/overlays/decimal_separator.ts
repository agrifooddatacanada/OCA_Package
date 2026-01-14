import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';
import { OVERLAY_VERSION } from '../../../types/types.js';

interface IDecimalSeparator {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class DecimalSeparator implements IDecimalSeparator {
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

  private GetDecimalSeparator(): string {
    const sep: any = (this.dynOverlay as any).decimal_separator;
    if (typeof sep !== 'string' || sep === '') {
      throw new Error('decimal_separator must be a non-empty string');
    }
    return sep;
  }

  private GetAttributeOverrides(): any {
    const overrides = this.dynOverlay.attribute_overrides || {};
    const canonicalized = canonicalize(overrides);
    const sorted = JSON.parse(canonicalized);
    return sorted;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: `community/overlays/adc/decimal_separator/${OVERLAY_VERSION}`,
      decimal_separator: this.GetDecimalSeparator(),
      attribute_overrides: this.GetAttributeOverrides(),
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

export default DecimalSeparator;


