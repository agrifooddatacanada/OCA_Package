import { DynOverlay } from '../../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../../utils/canonical.js';
import { OVERLAY_VERSION } from '../../../../types/types.js';

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
  private GetImports():
    | Record<string, { id: string; label?: string; location?: string; version?: string }>
    | undefined {
    const imports = this.dynOverlay.framing_metadata.imports;
    if (!imports) return undefined;
    return JSON.parse(canonicalize(imports));
  }

  private GetFramingMetadata(): any {
    const metadata: any = {
      id: this.GetId(),
      label: this.GetLabel(),
      location: this.GetLocation(),
      version: this.GetVersion(),
    };
    const imports = this.GetImports();
    if (imports !== undefined) {
      metadata.imports = imports;
    }
    return metadata;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: `community/overlays/adc/attribute_framing/${OVERLAY_VERSION}`,
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

  // A framing source is one vocabulary framed against the attributes. Sources arrive wrapped in
  // "attribute_framing_overlays"; a bare { framing_metadata, attributes } predates multi-source
  // support and is read as a single source.
  private static ResolveFramingSources(dynOverlay: { attribute_framing_overlays?: any[]; [key: string]: any }): any[] {
    if (Array.isArray(dynOverlay.attribute_framing_overlays)) {
      return dynOverlay.attribute_framing_overlays;
    }
    if (dynOverlay.framing_metadata || dynOverlay.attributes) {
      return [dynOverlay];
    }
    throw new Error('Invalid dynOverlay structure. Expected an object with an "attribute_framing_overlays" array.');
  }

  public static GenerateOverlay(
    dynOverlay: { attribute_framing_overlays?: any[]; [key: string]: any },
    capture_base_digest: string,
  ): string {
    if (!dynOverlay || typeof dynOverlay !== 'object') {
      throw new Error('Invalid dynOverlay structure. Expected an object with an "attribute_framing_overlays" array.');
    }

    const attribute_framing_overlays: any[] = [];
    const sources = AttributeFraming.ResolveFramingSources(dynOverlay);

    for (let framing_ov of sources) {
      try {
        const attribute_framing_overlay = new AttributeFraming(framing_ov, capture_base_digest);
        attribute_framing_overlays.push(JSON.parse(attribute_framing_overlay.GenerateOverlay()));
      } catch (error) {
        console.error('Failed to process attribute framing overlay:', error);
      }
    }

    attribute_framing_overlays.sort((a, b) =>
      (a.framing_metadata?.id ?? '').localeCompare(b.framing_metadata?.id ?? ''),
    );

    return JSON.stringify(attribute_framing_overlays);
  }
}
export default AttributeFraming;
