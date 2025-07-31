// TODO: use canonicalize to consistently order how properties of overlays should appear
// Do validation for the generation exentension chunck, and parts of oca_package.

import Ordering from './state/overlays/ordering.js';
import UnitFraming from './state/overlays/framing/unit_framing.js';
import ExampleOverlay from './state/overlays/example.js';
import Range from './state/overlays/range.js';
import Sensitive from './state/overlays/sensitive.js';
import AttributeFraming from './state/overlays/framing/attribute_framing.js';
import { Said } from '../types/types.js';
import { ocabundleDigest, getOcaBundleFromDeps, getDigest, isOcaBundleWithDeps } from '../utils/helpers.js';
import { saidify } from 'saidify';

const ADC_COMMUNITY = 'adc';
const EXTENSION_VERSION = '1.0';

// ExtensionInputJson: the input json object that contains the extension overlays
export interface ExtensionInputJson {
  [community: string]: {
    [bundle_digest: Said]: DynOverlay[];
  };
}

// IExtensionState: the interface that defines the extension state
export interface IExtensionState {
  [community: string]: {
    [bundle_digest: Said]: DynOverlay;
  };
}

export class ExtensionState {
  private _extension_input_json: ExtensionInputJson;
  public _extensionState: IExtensionState;

  constructor(ExtensionInputJson: ExtensionInputJson) {
    this._extension_input_json = ExtensionInputJson;
    this._extensionState = this.BuildExtensionState();
  }

  private BuildExtensionState(): IExtensionState {
    let state: IExtensionState = {};

    for (const community in this._extension_input_json.extensions) {
      const community_extensions = this._extension_input_json.extensions[community];

      state[community] = {};
      for (const bundle_digest in community_extensions) {
        state[community][bundle_digest] = community_extensions[bundle_digest];
      }
    }

    return state;
  }

  // TODO: list the overlays

  public get communities(): IExtensionState {
    return this._extensionState;
  }
}

// DynOverlay: dynamic overlay, the overlay must contain a key-value pair
// where the key is the name_overlay (e.g: ordering_overlay) and type is a required key in the overlay value.
// type should follow the format: community/[community_name]/extension/[semantic_version] e.g: community/adc/extension/1.0
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

    for (const ov_type in this._overlay) {
      if (ov_type === 'ordering_overlay') {
        const ordering_instance = new Ordering(this._overlay.ordering_overlay);
        const ordering_ov = ordering_instance.GenerateOverlay();
        overlay['ordering'] = JSON.parse(ordering_ov);
      } else if (ov_type === 'unit_framing_overlay') {
        const unit_framing_instance = new UnitFraming(this._overlay.unit_framing_overlay);
        const unit_framing_ov = unit_framing_instance.GenerateOverlay();
        overlay['unit_framing'] = JSON.parse(unit_framing_ov);
      } else if (ov_type === 'range_overlay') {
        const range_instance = new Range(this._overlay.range_overlay);
        const range_ov = range_instance.GenerateOverlay();
        overlay['range'] = JSON.parse(range_ov);
      } else if (ov_type === 'example_overlay') {
        const example_ov = ExampleOverlay.GenerateOverlay(this._overlay.example_overlay);
        overlay['example'] = JSON.parse(example_ov);
      } else if (ov_type === 'sensitive_overlay') {
        const sensitive_instance = new Sensitive(this._overlay.sensitive_overlay);
        const sensitive_ov = sensitive_instance.GenerateOverlay();
        overlay['sensitive'] = JSON.parse(sensitive_ov);
      } else if (ov_type === 'attribute_framing_overlay') {
        const attribute_framing_instance = new AttributeFraming(this._overlay.attribute_framing_overlay);
        const attribute_framing_ov = attribute_framing_instance.GenerateOverlay();
        overlay['attribute_framing'] = JSON.parse(attribute_framing_ov);
      } else {
        throw new Error(
          `Unsupported overaly type ${ov_type}. Supported extension overlays at ADC are [ ordering_overlay, unit_framing_overlay, range_overlay, example_overlay, sensitive_overlay ]`,
        );
      }
    }

    const sortedOverlays: Required<DynOverlay> = Object.keys(overlay)
      .sort()
      .reduce((acc, key) => {
        acc[key] = overlay[key];
        return acc;
      }, {} as Required<DynOverlay>);
    return sortedOverlays;
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
  GenerateOverlay(extensions: DynOverlay): { [key: string]: {} };
}

class ADCOverlayStrategy implements OverlayStrategy {
  GenerateOverlay(extensions: DynOverlay): { [key: string]: {} } {
    const overlays: { [key: string]: any } = {};

    for (const extKey in extensions) {
      const ext = extensions[extKey];
      const overlay_instance = new Overlay(ext);
      const generated_overlay = overlay_instance.GenerateOverlay();

      for (const overlay_type in generated_overlay) {
        overlays[overlay_type] = generated_overlay[overlay_type];
      }
    }
    return overlays;
  }
}

// To implement overlays for external communities, create a new class that implements the OverlayStrategy interface.
// For example, if you have a community called "external_community", you can create a class like this:
class DefaultOverlayStrategy implements OverlayStrategy {
  GenerateOverlay(_extensions: DynOverlay): { [key: string]: {} } {
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
  public _exensions: DynOverlay;
  readonly overlays = {};

  constructor(_extensions_input: DynOverlay, community: string) {
    if (!_extensions_input || !community) {
      throw new Error('extension array is required from extension state and community is required');
    }

    this._community = community;
    this._exensions = _extensions_input;
    this.type = `community/${this._community}/extension/${EXTENSION_VERSION}`;
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

  public get buildExtensionsBox(): ExtensionBoxType {
    const extensionsBox: ExtensionBoxType = {};
    const extensionState_communities = this._extensionState.communities;

    for (const community in extensionState_communities) {
      extensionsBox[community] = {};
      const current_community = extensionState_communities[community];

      for (const bundle_digest in current_community) {
        if (bundle_digest === ocabundleDigest(this._oca_bundle)) {
          const capture_base_digest = getDigest(this._oca_bundle);
          const community_extension_input = extensionState_communities[community][bundle_digest];

          const extension = new Extension(community_extension_input, community);
          extensionsBox[community][capture_base_digest] = extension.GenerateExtension();
        } else if (bundle_digest !== ocabundleDigest(this._oca_bundle)) {
          if (isOcaBundleWithDeps(this._oca_bundle)) {
            const current_bundle = getOcaBundleFromDeps(this._oca_bundle, bundle_digest);
            const capture_base_digest = getDigest(current_bundle);
            const community_extension_input = extensionState_communities[community][bundle_digest];

            const extension = new Extension(community_extension_input, community);
            extensionsBox[community][capture_base_digest] = extension.GenerateExtension();
          }
        }
      }
    }
    return extensionsBox;
  }
}

export default ExtensionBox;
