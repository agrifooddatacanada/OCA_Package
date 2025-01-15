import { ocabundleDigest } from '../utils/helpers.js';
import Ordering from './state/overlays/ordering.js';
import { Said } from '../types/types.js';
import { saidify } from 'saidify';

export interface ExtensionInputJson {
  ordering_overlay?: {
    ordering_attributes: any;
    ordering_entry_codes?: Record<string, any>;
  };
}

export interface IExtensionState {
  ordering_arr: string[];
  entry_code_ordering_arr: object;
  // attributes: Attribute[];
}

// Internal representation of the extension json input
// From this state, we can generate the extension overlay in any format
export class ExtensionState implements IExtensionState {
  private _attributes_ordering_arr: string[];
  private _entry_code_ordering_arr: Record<string, any>;

  constructor(extension_obj: ExtensionInputJson) {
    if (!extension_obj) {
      throw new Error('Extension object is required');
    }
    this._attributes_ordering_arr = this.extractAttributeOrdering(extension_obj);
    this._entry_code_ordering_arr = this.extractEntryCodeOrdering(extension_obj);
  }

  private extractAttributeOrdering(extension_obj: ExtensionInputJson): string[] {
    if (extension_obj['ordering_overlay']) {
      return extension_obj.ordering_overlay?.ordering_attributes;
    } else {
      throw new Error('Ordering overlay is required');
    }
  }

  private extractEntryCodeOrdering(extension_obj: ExtensionInputJson): Record<string, any> {
    return extension_obj.ordering_overlay ? extension_obj.ordering_overlay.ordering_entry_codes || {} : {};
  }

  public get ordering_arr(): string[] {
    return this._attributes_ordering_arr;
  }

  public get entry_code_ordering_arr(): Record<string, any> {
    return this._entry_code_ordering_arr;
  }
}

export interface IExtension {
  d: Said;
  type: string;
  bundle_digest: Said;
  overlays: Record<string, any>;
}

// Generates a serialized extension overlay per OCA bundle
class Extension implements IExtension {
  public d: Said = '';
  public type: string = 'community/adc/extension/1.0';
  public bundle_digest: Said = '';
  public overlays: Record<string, any> = {};

  private extensionState: ExtensionState;
  private oca_bundle: any;

  constructor(extension_obj: ExtensionInputJson, oca_bundle: any) {
    if (!extension_obj || !oca_bundle) {
      throw new Error('Extension object and OCA bundle are required');
    }
    this.extensionState = new ExtensionState(extension_obj);
    this.oca_bundle = oca_bundle;
    this.overlays = this.generateOverlays();
  }

  private generateOverlays(): Record<string, any> {
    const overlays: Record<string, any> = {};

    try {
      if (this.extensionState.ordering_arr) {
        const ordering = new Ordering(this.extensionState, this.oca_bundle);
        overlays['ordering'] = JSON.parse(ordering.generateOverlay());
      }
    } catch (error) {
      console.error('Error generating overlays:', error);
    }
    return overlays;
  }

  private toJSON(): object {
    const oca_bundle_digest = ocabundleDigest(this.oca_bundle);

    return {
      d: '',
      type: 'community/adc/extension/1.0',
      bundle_digest: oca_bundle_digest,
      overlays: this.overlays,
    };
  }

  private saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public generateExtension(): string {
    return JSON.stringify(this.saidifying());
  }
}

export default Extension;
