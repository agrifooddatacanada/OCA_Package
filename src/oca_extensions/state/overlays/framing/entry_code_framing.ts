import { DynOverlay } from '../../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../../utils/canonical.js';
import { OVERLAY_VERSION } from '../../../../types/types.js';

export interface IEntryCodeFraming {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class EntryCodeFraming implements IEntryCodeFraming {
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

  private GetFramedEntryCodes(): any {
    const entry_codes = this.dynOverlay.entry_codes;
    const canonicalized_entry_codes = canonicalize(entry_codes);
    const sorted_entry_codes = JSON.parse(canonicalized_entry_codes);
    return sorted_entry_codes;
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
      type: `community/overlays/adc/entry_code_framing/${OVERLAY_VERSION}`,
      framing_metadata: this.GetFramingMetadata(),
      entry_codes: this.GetFramedEntryCodes(),
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

export default EntryCodeFraming;