import { DynOverlay } from '../../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../../utils/canonical.js';

export interface IAttributeFraming {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class AttributeFraming implements IAttributeFraming {
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

  private GetFramedAttributes(): any {
    const attributes = this.dynOverlay.attributes;
    const canonicalizedAttributes = canonicalize(attributes);
    const sortedAttributes = JSON.parse(canonicalizedAttributes);
    return sortedAttributes;
  }
  private GetId(): string {
    return this.dynOverlay.framing_metadata.id;
  }
  private GetLabel(): string {
    return this.dynOverlay.framing_metadata.label;
  }
  private GetLocation(): string {
    return this.dynOverlay.framing_metadata.location;
  }
  private GetVersion(): string {
    return this.dynOverlay.framing_metadata.version;
  }

  private GetFramingMetadata(): any {
    return {
      id: this.GetId(),
      label: this.GetLabel(),
      location: this.GetLocation(),
      version: this.GetVersion(),
    };
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: 'community/overlays/adc/attribute_framing/1.1',
      framing_metadata: this.GetFramingMetadata(),
      attributes: this.GetFramedAttributes(),
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
export default AttributeFraming;
