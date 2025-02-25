// import { ocabundleDigest } from '../utils/helpers.js';
// import Ordering from './state/overlays/ordering.js';
// import { Said } from '../types/types.js';
// import { saidify } from 'saidify';

// export interface ExtensionInputJson {
//   ordering_overlay?: {
//     attribute_ordering: any;
//     entry_code_ordering?: Record<string, any>;
//   };
// }

// export interface IExtensionState {
//   attribute_ordering_arr: string[];
//   entry_code_ordering_arr: object;
//   // attributes: Attribute[];
// }

// // Internal representation of the extension json input
// // From this state, we can generate the extension overlay in any format
// export class ExtensionState implements IExtensionState {
//   private _attributes_ordering_arr: string[];
//   private _entry_code_ordering_arr: Record<string, any>;

//   constructor(extension_obj: ExtensionInputJson) {
//     if (!extension_obj) {
//       throw new Error('Extension object is required');
//     }
//     this._attributes_ordering_arr = this.extractAttributeOrdering(extension_obj);
//     this._entry_code_ordering_arr = this.extractEntryCodeOrdering(extension_obj);
//   }

//   private extractAttributeOrdering(extension_obj: ExtensionInputJson): string[] {
//     if (extension_obj['ordering_overlay']) {
//       return extension_obj.ordering_overlay?.attribute_ordering;
//     } else {
//       throw new Error('Ordering overlay is required');
//     }
//   }

//   private extractEntryCodeOrdering(extension_obj: ExtensionInputJson): Record<string, any> {
//     return extension_obj.ordering_overlay ? extension_obj.ordering_overlay.entry_code_ordering || {} : {};
//   }

//   public get attribute_ordering_arr(): string[] {
//     return this._attributes_ordering_arr;
//   }

//   public get entry_code_ordering_arr(): Record<string, any> {
//     return this._entry_code_ordering_arr;
//   }
// }

// export interface IExtension {
//   d: Said;
//   type: string;
//   bundle_digest: Said;
//   overlays: Record<string, any>;
// }

// // Generates a serialized extension overlay per OCA bundle
// class Extension implements IExtension {
//   public d: Said = '';
//   public type: string = 'community/adc/extension/1.0';
//   public bundle_digest: Said = '';
//   public overlays: Record<string, any> = {};

//   private extensionState: ExtensionState;
//   private oca_bundle: any;

//   constructor(extension_obj: ExtensionInputJson, oca_bundle: any) {
//     if (!extension_obj || !oca_bundle) {
//       throw new Error('Extension object and OCA bundle are required');
//     }
//     this.extensionState = new ExtensionState(extension_obj);
//     this.oca_bundle = oca_bundle;
//     this.overlays = this.generateOverlays();
//   }

//   private generateOverlays(): Record<string, any> {
//     const overlays: Record<string, any> = {};

//     console.log('extensionState:', this.extensionState);

//     try {
//       if (this.extensionState.attribute_ordering_arr) {
//         const ordering = new Ordering(this.extensionState, this.oca_bundle);
//         overlays['ordering'] = JSON.parse(ordering.generateOverlay());
//       }
//     } catch (error) {
//       console.error('Error generating overlays:', error);
//     }
//     return overlays;
//   }

//   private toJSON(): object {
//     const oca_bundle_digest = ocabundleDigest(this.oca_bundle);

//     return {
//       d: '',
//       type: 'community/adc/extension/1.0',
//       bundle_digest: oca_bundle_digest,
//       overlays: this.overlays,
//     };
//   }

//   private saidifying(): Record<string, any> {
//     const [, sad] = saidify(this.toJSON());
//     return sad;
//   }

//   public generateExtension(): string {
//     return JSON.stringify(this.saidifying());
//   }
// }

// -----------------------------------------------------------------------------

import Ordering from './state/overlays/ordering.js';
import { Said } from '../types/types.js';

// const ADC_COMMUNITY = 'adc';

// ExtensionInputJson: the input json object that contains the extension overlays
export interface ExtensionInputJson {
  [community: string]: {
    [bundle_digest: Said]: DynOverlay[];
  };
}

// IExtensionState: the interface that defines the extension state
export interface IExtensionState {
  [community: string]: {
    [bundle_digest: Said]: DynOverlay[];
  };
}

export class ExtensionState {
  private _extension_input: ExtensionInputJson;
  public extensionState: IExtensionState;

  constructor(ExtensionInputJson: ExtensionInputJson) {
    this._extension_input = ExtensionInputJson;
    this.extensionState = this.buildExtensionState();
  }

  private buildExtensionState(): IExtensionState {
    const state: IExtensionState = {};

    for (const community in this._extension_input) {
      state[community] = {};

      for (const bundle_digest in this._extension_input[community]) {
        state[community][bundle_digest] = this._extension_input[community][bundle_digest];
      }
    }

    return state;
  }
}

// DynOverlay: dynamic overlay, the overlay must contain a key-value pair
// where the key is the name_overlay (e.g: ordering_overlay) and type is a required key in the overlay value.
// the type key should follow the format: community/[community_name]/extension/[semantic_version] e.g: community/adc/extension/1.0
export interface DynOverlay {
  [ov_name: string]: {
    type: string;
    [key: string]: any;
  };
}

export class Overlay implements DynOverlay {
  [key: string]: any;

  constructor(community_overlay: DynOverlay, oca_bundle: any) {
    this._overlay = community_overlay;
    this._oca_bundle = oca_bundle;
  }

  public generateOverlay(): any {
    const overlay: Required<DynOverlay> = {};

    for (const ov_name in this._overlay) {
      switch (ov_name) {
        case 'ordering_overlay':
          const ordering = new Ordering(this._overlay, this._oca_bundle);
          overlay['ordering_overlay'] = JSON.parse(ordering.generateOverlay());
          break;

        default:
          throw new Error('Invalid overlay name');
      }
    }

    return overlay;
  }
}
