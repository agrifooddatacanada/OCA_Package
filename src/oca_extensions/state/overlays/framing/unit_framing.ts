import { DynOverlay } from '../../../extensions.js';
import { saidify } from 'saidify';

// UCUM is used to map units
// https://ucum.org/

export interface IUnitFraming {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class UnitFraming implements IUnitFraming {
  public dynOverlay: DynOverlay;

  constructor(dynOverlay: DynOverlay) {
    if (!dynOverlay) {
      throw new Error('a dynamic extension overlay are required');
    }

    this.dynOverlay = dynOverlay;
  }

  private GetUnits(): any {
    return this.dynOverlay.unit_framing_overlay.units;
  }
  private GetId(): string {
    return this.dynOverlay.unit_framing_overlay.properties.id;
  }
  private GetLabel(): string {
    return this.dynOverlay.unit_framing_overlay.properties.label;
  }
  private GetLocation(): string {
    return this.dynOverlay.unit_framing_overlay.properties.location;
  }
  private GetVersion(): string {
    return this.dynOverlay.unit_framing_overlay.properties.version;
  }
  private toJSON(): object {
    return {
      d: '',
      type: 'community/overlays/adc/unit_framing/1.1',
      framing_metadata: {
        id: this.GetId(),
        label: this.GetLabel(),
        location: this.GetLocation(),
        version: this.GetVersion(),
      },
      units: this.GetUnits(),
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
export default UnitFraming;
