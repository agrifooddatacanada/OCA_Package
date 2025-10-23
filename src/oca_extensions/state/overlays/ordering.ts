import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';

export interface IOrdering {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class Ordering implements IOrdering {
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

  private GetAttributeOrdering(): any {
    return this.dynOverlay.attribute_ordering;
  }

  private GetEntryCodeOrdering(): object {
    return this.dynOverlay.entry_code_ordering;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: 'community/overlays/adc/ordering/1.1',
      attribute_ordering: this.GetAttributeOrdering(),
      entry_code_ordering: this.GetEntryCodeOrdering(),
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

export default Ordering;
