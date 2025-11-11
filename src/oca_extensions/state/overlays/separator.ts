import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';
import { OVERLAY_VERSION } from '../../../types/types.js';

interface Iseparator {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class Separator implements Iseparator {
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

  private GetAttributesSeparators(): any {
    const separator_overlay_attributes = this.dynOverlay.attribute_separators;
    const canonicalized_attributes = canonicalize(separator_overlay_attributes);
    const sortedAttributes = JSON.parse(canonicalized_attributes);
    return sortedAttributes;
  }

  private GetDatasetSeparator(): any {
    const separator_overlay_dataset = this.dynOverlay.dataset_separator;
    const canonicalized_dataset = canonicalize(separator_overlay_dataset);
    const sortedDataset = JSON.parse(canonicalized_dataset);
    return sortedDataset;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: `community/overlays/adc/separator/${OVERLAY_VERSION}`,
      attribute_separators: this.GetAttributesSeparators(),
      dataset_separator: this.GetDatasetSeparator(),
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

export default Separator;
