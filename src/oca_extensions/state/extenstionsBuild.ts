import Attribute from './attribute.js';
import { SeparatorValues, SeparatorsInput } from './overlays/separator.js';
import { isPresent } from '../../utils/helpers.js';

export interface Extensions {
  separator_ov: SeparatorsInput;
}

interface OCABundle {
  bundle?: {
    capture_base?: {
      attributes?: {
        [key: string]: any;
      };
    };
  };
}

class Extensionbuild {
  attributeContainer: Attribute[];

  constructor() {
    this.attributeContainer = [];
  }

  public addAttribute(attrName: string, extensions: Extensions, oca_bundle: OCABundle): void {
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

export default Extensionbuild;
