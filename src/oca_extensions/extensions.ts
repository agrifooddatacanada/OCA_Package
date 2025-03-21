import Ordering from './state/overlays/ordering.js';
import { Said } from '../types/types.js';
import { ocabundleDigest, getOcaBundleFromDeps, getDigest, isOcaBundleWithDeps } from '../utils/helpers.js';
import { saidify } from 'saidify';

const ADC_COMMUNITY = 'adc';
const v = '1.0';

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
    this._extensionState = this.BuildExtensionState();
  }

  private BuildExtensionState(): IExtensionState {
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

  constructor(community_overlay: DynOverlay) {
    this._overlay = community_overlay;
  }

  public GenerateOverlay(): Required<DynOverlay> {
    const overlay: Required<DynOverlay> = {};

    for (const _ in this._overlay) {
      const ov_name = Object.keys(this._overlay)[0];
      switch (ov_name) {
        case 'ordering_overlay':
          const ordering_instance = new Ordering(this._overlay);
          const ordering = ordering_instance.GenerateOverlay();
          overlay['ordering'] = JSON.parse(ordering);

          break;

        default:
          throw new Error('Invalid overlay name');
      }
    }
    return overlay;
  }
}

/* 

// Extension input key-value fields should follow the format of adc if they want to consume adc oca-package without any modification.
// e.g: "example": {"EPTBqhF1nhW_DaLMk6kr5EXceZAM9b327yWO5iGNwRkf": [{"attribute_ordering": {"type": "attribute_ordering","attributes": ["book.id"]}}]}
// where "example" is the community name, "EPTBqhF1nhW_DaLMk6kr5EXceZAM9b327yWO5iGNwRkf" is the bundle digest and "attribute_ordering" is the overlay name.
// and the other properties specific to the overlay. In the above example we only have one property "attributes" which is an array of strings that contains the attribute names in the order they should appear.
// The code below will then know how to work with these properties & the whole overlay and generate the serialized version of the extension, and integrate it with the oca-package.
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

  private sadifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public toJSON(): object {
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
      ...properties,
    };
  }

  public generateCommunityOverlay(): DynOverlay {
    return this.sadifying();
  }
}

*/

interface OverlayStrategy {
  GenerateOverlay(extensions: DynOverlay[]): { [key: string]: {} };
}

class ADCOverlayStrategy implements OverlayStrategy {
  GenerateOverlay(extensions: DynOverlay[]): { [key: string]: {} } {
    const overlays: { [key: string]: any } = {};

    for (const ext of extensions) {
      const overlay_instance = new Overlay(ext);
      const generated_overlay = overlay_instance.GenerateOverlay();
      const overlay_type = Object.keys(generated_overlay)[0];
      overlays[overlay_type] = generated_overlay[overlay_type];
    }
    return overlays;
  }
}

class DefaultOverlayStrategy implements OverlayStrategy {
  GenerateOverlay(extensions: DynOverlay[]): { [key: string]: {} } {
    throw new Error('Unsupported community type');
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
  public _exensions: DynOverlay[];
  readonly overlays = {};

  constructor(_extensions_input: DynOverlay[], community: string) {
    if (!_extensions_input || !community) {
      throw new Error('extension array is required from extension state and community is required');
    }

    this._community = community;
    this._exensions = _extensions_input;
    this.type = `community/${this._community}/extension/${v}`;
  }

  private GenerateOverlays(): { [key: string]: {} } {
    const strategy: OverlayStrategy =
      this._community === ADC_COMMUNITY ? new ADCOverlayStrategy() : new DefaultOverlayStrategy();
    return strategy.GenerateOverlay(this._exensions);
  }

  private toJSON(): object {
    return {
      d: '',
      type: `community/${this._community}/extension/1.0`,
      overlays: this.GenerateOverlays(),
    };
  }

  private Saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public GenerateExtension(): any {
    return this.Saidifying();
  }
}

type ExtensionBoxType = { [community: string]: { [capture_base_digest: string]: Extension } };

class ExtensionBox {
  public _extensions_box: ExtensionBoxType;
  public _oca_bundle: any;
  public _extensionState: ExtensionState;

  constructor(extension_input_json: ExtensionInputJson, oca_bundle: any) {
    this._extensions_box = {};
    this._oca_bundle = oca_bundle;
    this._extensionState = new ExtensionState(extension_input_json);
  }

  public GenerateExtensionsBox(): ExtensionBoxType {
    const extensionState_communities = this._extensionState.extensions;

    for (const community in extensionState_communities.extensions) {
      this._extensions_box[community] = {};
      const current_community = extensionState_communities.extensions[community];

      for (const bundle_digest in current_community) {
        if (bundle_digest === ocabundleDigest(this._oca_bundle)) {
          const capture_base_digest = getDigest(this._oca_bundle);
          const community_extension_input = extensionState_communities.extensions[community][bundle_digest];

          const extension = new Extension([community_extension_input[0]], community);
          this._extensions_box[community][capture_base_digest] = extension.GenerateExtension();
        } else if (bundle_digest !== ocabundleDigest(this._oca_bundle)) {
          if (isOcaBundleWithDeps(this._oca_bundle)) {
            const current_bundle = getOcaBundleFromDeps(this._oca_bundle, bundle_digest);
            const capture_base_digest = getDigest(current_bundle);
            const community_extension_input = extensionState_communities.extensions[community][bundle_digest];

            const extension = new Extension([community_extension_input[0]], community);
            this._extensions_box[community][capture_base_digest] = extension.GenerateExtension();
          }
        }
      }
    }

    return this._extensions_box;
  }
}

export default ExtensionBox;
