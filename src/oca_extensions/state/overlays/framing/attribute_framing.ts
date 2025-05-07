import { DynOverlay } from '../../../extensions.js';
import { saidify } from 'saidify';

export interface IAttributeFraming {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class AttributeFraming implements IAttributeFraming {
  public dynOverlay: DynOverlay;

  constructor(dynOverlay: DynOverlay) {
    if (!dynOverlay) {
      throw new Error('a dynamic extension overlay are required');
    }

    this.dynOverlay = dynOverlay;
  }

  private GetAttributeFraming(): any {
    return this.dynOverlay.attribute_framing_overlay.attributes;
  }
  private GetId(): string {
    return this.dynOverlay.attribute_framing_overlay.properties.id;
  }
  private GetLabel(): string {
    return this.dynOverlay.attribute_framing_overlay.properties.label;
  }
  private GetLocation(): string {
    return this.dynOverlay.attribute_framing_overlay.properties.location;
  }
  private GetVersion(): string {
    return this.dynOverlay.attribute_framing_overlay.properties.version;
  }
  private toJSON(): object {
    return {
      d: '',
      type: 'community/overlays/adc/attribute_framing/1.1',
      framing_metadata: {
        id: this.GetId(),
        label: this.GetLabel(),
        location: this.GetLocation(),
        version: this.GetVersion(),
      },
      attribute_framing: this.GetAttributeFraming(),
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
