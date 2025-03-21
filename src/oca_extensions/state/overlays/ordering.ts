import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';

export interface IOrdering {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class Ordering implements IOrdering {
  public dynOverlay: DynOverlay;

  constructor(dynOverlay: DynOverlay) {
    if (!dynOverlay) {
      throw new Error('a dynamic extension overlay are required');
    }

    this.dynOverlay = dynOverlay;
  }

  private GetAttributeOrdering(): any[] {
    return this.dynOverlay.ordering_overlay.attribute_ordering;
  }

  private GetEntryCodeOrdering(): object {
    return this.dynOverlay.ordering_overlay.entry_code_ordering;
  }

  private toJSON(): object {
    return {
      d: '',
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
