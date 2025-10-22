import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';

export interface IRange {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class Range implements IRange {
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

  private GetAttributes(): any {
    const range_overlay_attributes = this.dynOverlay.attributes;
    const canonicalized_attributes = canonicalize(range_overlay_attributes);
    const sortedAttributes = JSON.parse(canonicalized_attributes);

    return sortedAttributes;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: 'community/overlays/adc/range/1.1',
      attributes: this.GetAttributes(),
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
export default Range;
