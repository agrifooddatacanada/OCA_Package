import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';

export interface ISensitive {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class Sensitive implements ISensitive {
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

  private GetSensitiveAttributes(): any {
    const sensitive_overlay_attributes = this.dynOverlay.sensitive_attributes;
    // to match the canonicalization of of attributs in the capture base
    const sortedAttributes = sensitive_overlay_attributes.sort();

    return sortedAttributes;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: 'community/overlays/adc/sensitive/1.1',
      sensitive_attributes: this.GetSensitiveAttributes(),
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

export default Sensitive;
