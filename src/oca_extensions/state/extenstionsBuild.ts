import Attribute from './attribute.js';
import Separator, { SeparatorValues, SeparatorsInput } from './overlays/separator.js';
import { isPresent } from '../../utils/helpers.js';

export interface ExtensionsInput {
  separator_ov: SeparatorsInput;
}

// TODO: Should OCA bundle interface inforce dependencies?
/*
interface OCABundle {
  bundle?: {
    capture_base?: {
      attributes?: {
        [key: string]: any;
      };
    };
  };
}
  */

export class Extensionbuild {
  attributeContainer: Attribute[];

  constructor() {
    this.attributeContainer = [];
  }

  public addAttribute(attrName: string, extensions: ExtensionsInput, oca_bundle: any): void {
    if (!attrName || !extensions || !oca_bundle) {
      throw new Error('Attribute, extension, or oca_bundle is undefined or null.');
    }

    const attribute = new Attribute(attrName);

    try {
      const attributeExistsInBundle = isPresent(attrName, oca_bundle);
      const attributeSeparators = extensions?.separator_ov?.attribute_separators;

      if (attributeExistsInBundle) {
        if (attributeSeparators && attrName in attributeSeparators) {
          const separatorValues: SeparatorValues = attributeSeparators[attrName];
          attribute.setAttributeSeparators(separatorValues);
        } else {
          throw new Error(`Attribute ${attrName} not found in separators.`);
        }
      } else {
        throw new Error(`Attribute ${attrName} not found in OCA bundle.`);
      }

      this.attributeContainer.push(attribute);
    } catch (error) {
      console.error('Error in addAttribute:', error);
      throw new Error(`Failed to add attribute: ${error.message}`);
    }
  }
}

// TODO: Figure out how to construct extension overlays from extensionBuild object
/*
class Extensions {
  public ocabundle: any;
  public extensions: ExtensionsInput;
  public extensionBuild: Extensionbuild;

  constructor(extensions: ExtensionsInput, oca_bundle: any) {
    if (!extensions || !oca_bundle) {
      throw new Error('Extensions object and OCA bundle are required');
    }
    this.ocabundle = oca_bundle;
    this.extensions = extensions;
  }


  public generate_separator_overlay(): string {
    const separator_ov_input = this.extensions.separator_ov;

    // TODO: Handle this case better
    if (!separator_ov_input) {
      throw new Error('Separator overlay is required');
    }

    try {
      if (separator_ov_input.attribute_separators) {
        for (const attr in separator_ov_input.attribute_separators) {
          this.extensionBuild.addAttribute(attr, this.extensions, this.ocabundle);
        }
      }

    } catch (error) {
      throw new Error(`Failed to generate separator overlay: ${error}`);
    }
  }
}

*/

export default Extensionbuild;
