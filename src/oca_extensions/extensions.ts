import Ordering from './state/overlays/ordering.js';
import { Said } from '../types/types.js';
import { ocabundleDigest, getOcaBundleFromDeps, getDigest } from '../utils/helpers.js';
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
    type?: string;
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
          // overlay['ordering_overlay'] = ordering.generateOverlay();

          break;

        default:
          throw new Error('Invalid overlay name');
      }
    }
    return overlay;
  }
}

// Extension input key-value fields should follow the format of adc if they want to consume adc oca-package without any modification.
// e.g: "example": {"EPTBqhF1nhW_DaLMk6kr5EXceZAM9b327yWO5iGNwRkf": [{"attribute_ordering": {"type": "attribute_ordering","attributes": ["book.id"]}}]}
// where "example" is the community name, "EPTBqhF1nhW_DaLMk6kr5EXceZAM9b327yWO5iGNwRkf" is the bundle digest and "attribute_ordering" is the overlay name.
// and the other properties specific to the overlay. In the above example we only have one overlay "attributes" which is an array of strings that contains the attribute names in the order they should appear.
// The code below will then know how to work with the overlay and generate the serialized version of the extension, and integrate it with the oca-package.
export class DynCommunityOverlay {
  private communityExtensionInput: {
    [community: string]: {
      [bundle_digest: Said]: DynOverlay[];
    };
  };

  constructor(community: string, bundle_digest: Said, overlay: DynOverlay) {
    this.communityExtensionInput = {
      [community]: {
        [bundle_digest]: [overlay],
      },
    };
  }

  private sadifying(capture_base: Said): Record<string, any> {
    const [, sad] = saidify(this.toJSON(capture_base));
    return sad;
  }

  public toJSON(capture_base: Said): object {
    const community = Object.keys(this.communityExtensionInput)[0];
    const bundle_digest = Object.keys(this.communityExtensionInput[community])[0];
    const overlayData = this.communityExtensionInput[community][bundle_digest][0];
    const overlay_type = Object.keys(overlayData)[0];

    // properties is the overlay object without the type key
    const properties = { ...overlayData[overlay_type] };
    delete properties.type;

    return {
      d: '',
      type: `community/overlays/${community}/${overlay_type}/1.1`,
      capture_base: capture_base,
      ...properties,
    };
  }

  public generateCommunityOverlay(capture_base: Said): DynOverlay {
    return this.sadifying(capture_base);
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
  private static hasUsedParentOcaBundle: boolean = false;

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

          for (const index in current_extension) {
            const overlay = current_extension[index];
            let current_oca_bundle = '';

            if (Extension.hasUsedParentOcaBundle === false) {
              current_oca_bundle = this.oca_bundle;
              Extension.hasUsedParentOcaBundle = true;
            } else if (Extension.hasUsedParentOcaBundle === true) {
              current_oca_bundle = getOcaBundleFromDeps(this.oca_bundle, bundle_digest);
            }

            const overlay_instance = new Overlay(overlay, current_oca_bundle);
            overlays.push(overlay_instance.generateOverlay());
          }
        }
        break;

      default:
        for (const bundle_digest in extensionState_communities.extensions[this._community]) {
          const current_extension: DynOverlay = extensionState_communities.extensions[this._community][bundle_digest];

          for (const index in current_extension) {
            const overlay = current_extension[index];
            const overlay_keys = Object.keys(overlay);
            const overlay_type = overlay_keys[0];

            let current_oca_bundle = '';

            if (Extension.hasUsedParentOcaBundle === false) {
              current_oca_bundle = this.oca_bundle;
              Extension.hasUsedParentOcaBundle = true;
            } else if (Extension.hasUsedParentOcaBundle === true) {
              current_oca_bundle = getOcaBundleFromDeps(this.oca_bundle, bundle_digest);
            }

            const overlay_instance = new DynCommunityOverlay(this._community, bundle_digest, overlay);
            const capture_base = getDigest(current_oca_bundle);
            overlays.push({ [overlay_type]: overlay_instance.generateCommunityOverlay(capture_base) });
          }
        }
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

  public generateExtension(): any {
    return this.saidifying();
  }
}

type ExtensionBoxType = { [community: string]: Extension[] };

class ExtensionBox {
  public _extensions_box: ExtensionBoxType;
  public _extension_input_json: ExtensionInputJson;
  public _oca_bundle: any;

  constructor(extension_input_json: ExtensionInputJson, oca_bundle: any) {
    this._extensions_box = {};
    this._extension_input_json = extension_input_json;
    this._oca_bundle = oca_bundle;
  }

  public generateExtensionsBox(): ExtensionBoxType {
    const extensionState = new ExtensionState(this._extension_input_json);
    const extensionState_communities = extensionState.extensions;

    for (const community in extensionState_communities.extensions) {
      this._extensions_box[community] = [];
      const extension = new Extension(this._extension_input_json, this._oca_bundle, community);

      this._extensions_box[community].push(extension.generateExtension());
    }
    return this._extensions_box;
  }
}

export default ExtensionBox;
