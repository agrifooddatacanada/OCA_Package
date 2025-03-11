import Ordering from './state/overlays/ordering.js';
import { Said } from '../types/types.js';
import { ocabundleDigest, getOcaBundleFromDeps } from '../utils/helpers.js';
import { saidify } from 'saidify';

const ADC_COMMUNITY = 'adc';
const SEM_VER = '1.0';

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
  private _extension_input_json: ExtensionInputJson;
  private _extensionState: IExtensionState;

  constructor(ExtensionInputJson: ExtensionInputJson) {
    this._extension_input_json = ExtensionInputJson;
    this._extensionState = this.buildExtensionState();
  }

  private buildExtensionState(): IExtensionState {
    const state: IExtensionState = {};

    for (const community in this._extension_input_json) {
      state[community] = {};

      for (const bundle_digest in this._extension_input_json[community]) {
        state[community][bundle_digest] = this._extension_input_json[community][bundle_digest];
      }
    }

    return state;
  }

  public get extensions(): IExtensionState {
    return this._extensionState;
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

  public generateOverlay(): Required<DynOverlay> {
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

export interface IExtension {
  d: Said;
  type: string;
  _community: string;
}

export class Extension implements IExtension {
  readonly d: Said = '';
  public _community: string;
  readonly type: string;
  readonly oca_bundle: any;
  public _extensionState: ExtensionState;
  readonly overlays: DynOverlay[] = [];
  private hasUsedParentOcaBundle: boolean = false;

  constructor(_extension_input_json: ExtensionInputJson, oca_bundle: any, community: string) {
    if (!_extension_input_json || !oca_bundle || !community) {
      throw new Error('Extension object, OCA bundle and community are required');
    }

    this._extensionState = new ExtensionState(_extension_input_json);
    this.oca_bundle = oca_bundle;
    this._community = community;
    this.type = `community/${this._community}/extension/${SEM_VER}`;
  }

  private generateOverlays(): DynOverlay[] {
    const overlays: DynOverlay[] = [];
    const extensionState_communities = this._extensionState.extensions;

    switch (this._community) {
      case ADC_COMMUNITY:
        for (const bundle_digest in extensionState_communities.extensions[this._community]) {
          const current_extension: DynOverlay = extensionState_communities.extensions[this._community][bundle_digest];

          for (const overlayType in current_extension) {
            const overlay = current_extension[overlayType];
            let current_oca_bundle = '';

            if (this.hasUsedParentOcaBundle === false) {
              current_oca_bundle = this.oca_bundle;
              this.hasUsedParentOcaBundle = true;
            } else if (this.hasUsedParentOcaBundle === true) {
              current_oca_bundle = getOcaBundleFromDeps(this.oca_bundle, bundle_digest);
            }

            const overlay_instance = new Overlay(overlay, current_oca_bundle);
            overlays.push(overlay_instance.generateOverlay());
          }
        }
        break;

      default:
        // throw new Error(`Invalid community: ${this._community}`);
        break;
    }
    return overlays;
  }

  private toJSON(): object {
    const oca_bundle_digest = ocabundleDigest(this.oca_bundle);

    return {
      d: '',
      type: `community/${this._community}/extension/1.0`,
      bundle_digest: oca_bundle_digest,
      overlays: this.generateOverlays(),
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

type ExtensionBoxType = { [community: string]: Extension[] };

class ExtensionBox {
  public _extensions_box: ExtensionBoxType[];
  public _extension_input_json: ExtensionInputJson;
  public _oca_bundle: any;

  constructor(extension_input_json: ExtensionInputJson, oca_bundle: any) {
    this._extensions_box = [];
    this._extension_input_json = extension_input_json;
    this._oca_bundle = oca_bundle;
  }

  public generateExtensionsBox(): ExtensionBoxType[] {
    const extensionState = new ExtensionState(this._extension_input_json);
    const extensionState_communities = extensionState.extensions;

    for (const community in extensionState_communities.extensions) {
      this._extensions_box[community] = [];
      const extension = new Extension(this._extension_input_json, this._oca_bundle, community);

      this._extensions_box[community].push(JSON.parse(extension.generateExtension()));
    }
    return this._extensions_box;
  }
}

export default ExtensionBox;
