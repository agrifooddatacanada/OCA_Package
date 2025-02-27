import { DynOverlay } from '../../extensions.js';
import { getDigest, ocabundleDigest } from '../../../utils/helpers.js';
import { saidify } from 'saidify';
import { Said } from '../../../types/types.js';

export interface IOrdering {
  readonly oca_bundle: any;
  dynOverlay: DynOverlay;
  generateOverlay(): string;
}

class Ordering implements IOrdering {
  public oca_bundle: any;
  public dynOverlay: DynOverlay;
  public oca_bundle_digest: Said;

  constructor(dynOverlay: DynOverlay, oca_bundle: any) {
    if (!oca_bundle || !dynOverlay) {
      throw new Error('OCA bundle and a dynamic extension overlay are required');
    }
    this.oca_bundle = oca_bundle;
    this.dynOverlay = dynOverlay;
    this.oca_bundle_digest = ocabundleDigest(this.oca_bundle);
  }

  private getAttributeOrdering(): any[] {
    return this.dynOverlay.ordering_overlay.attribute_ordering;
  }

  private getEntryCodeOrdering(): object {
    return this.dynOverlay.ordering_overlay.entry_code_ordering;
  }

  private toJSON(): object {
    return {
      d: '',
      type: 'community/overlays/adc/ordering/1.0',
      capture_base: getDigest(this.oca_bundle),
      attribute_ordering: this.getAttributeOrdering(),
      entry_code_ordering: this.getEntryCodeOrdering(),
    };
  }

  private saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public generateOverlay(): string {
    return JSON.stringify(this.saidifying());
  }
}

export default Ordering;
