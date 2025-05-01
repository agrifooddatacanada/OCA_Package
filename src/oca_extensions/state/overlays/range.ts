import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';

export interface IRange {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class Range implements IRange {
  public dynOverlay: DynOverlay;

  constructor(dynOverlay: DynOverlay) {
    if (!dynOverlay) {
      throw new Error('a dynamic extension overlay are required');
    }

    this.dynOverlay = dynOverlay;
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
