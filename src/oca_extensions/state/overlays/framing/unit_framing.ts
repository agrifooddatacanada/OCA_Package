import { DynOverlay } from '../../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../../utils/canonical.js';

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
    const units = this.dynOverlay.units;
    const canonicalizedUnits = canonicalize(units);
    const sortedUnits = JSON.parse(canonicalizedUnits);
    return sortedUnits;
  }
  private GetId(): string {
    return this.dynOverlay.properties.id;
  }
  private GetLabel(): string {
    return this.dynOverlay.properties.label;
  }
  private GetLocation(): string {
    return this.dynOverlay.properties.location;
  }
  private GetVersion(): string {
    return this.dynOverlay.properties.version;
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
