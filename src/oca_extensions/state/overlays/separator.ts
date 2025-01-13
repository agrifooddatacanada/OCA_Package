/*
Separator overlay

This overlay is used to define the separators used in the dataset and the attributes in the dataset.

Canoncial rules:
- d, type, capture_base has to be present in this order
- other properties (dataset_separator, attribute_separators) will be lexically sorted by key
- attributes in attribute_separators will lexically sorted by key as currently current canonical rules applied in the OCA bundle

- Example:
{
  "d": "said:...",
  "type": "community/adc/overlays/separator/1.0",
  "capture_base": "said:...",
  "attribute_separators": {
    "attribute_name": {
      "attr1": {  
        "delimiter": "...",
        "escape": "..."
      }
    }
  },
  "dataset_separator": {
    "delimiter": "...",
    "escape": "..."
  }
}
*/

import { saidify } from 'saidify';
import { getDigest, isPresent } from '../../../utils/helpers.js';
import { Said, OverlayTypes } from '../../../types/types.js';

export interface SeparatorOverlayInput {
  type: string;
  dataset_separator: SeparatorValues;
  attribute_separators: { [key: string]: SeparatorValues };
}

export interface SeparatorsInput {
  type: string;
  dataset_separator?: SeparatorValues;
  attribute_separators?: {
    [key: string]: SeparatorValues;
  };
}

export interface ISeparatorOverlay {
  said?: Said;
  type: OverlayTypes.Separator;
  capture_base: Said;
  dataset_separator?: SeparatorsInput['dataset_separator'];
  attribute_separators?: SeparatorsInput['attribute_separators'];
  overlay_type(): string;
}

export interface SeparatorValues {
  delimiter: string;
  escape: string;
}

class Separator implements ISeparatorOverlay {
  said?: Said;
  type: OverlayTypes.Separator;
  capture_base: Said;
  dataset_separator?: SeparatorsInput['dataset_separator'];
  attribute_separators?: SeparatorsInput['attribute_separators'];
  separators: SeparatorsInput;
  oca_bundle: any;

  constructor(separators: SeparatorsInput, oca_bundle: any) {
    this.said = '';
    this.type = OverlayTypes.Separator;
    this.separators = separators;
    this.oca_bundle = oca_bundle;
    this.capture_base = getDigest(this.oca_bundle);
  }

  public overlay_type(): string {
    return this.type;
  }

  public attributes(): { key: string; value: SeparatorValues }[] {
    const sorted_attribute_separators: { key: string; value: SeparatorValues }[] = [];

    if (this.separators.attribute_separators) {
      for (const key in this.separators.attribute_separators) {
        if (Object.prototype.hasOwnProperty.call(this.separators.attribute_separators, key)) {
          if (!isPresent(key, this.oca_bundle)) {
            throw new Error(`Attribute ${key} not found in OCA bundle Capture Base.`);
          }
          sorted_attribute_separators.push({ key, value: this.separators.attribute_separators[key] });
        }
      }
      // Sort the attribute separators by key
      sorted_attribute_separators.sort((a, b) => a.key.localeCompare(b.key));
    }
    return sorted_attribute_separators;
  }

  // serialize the separator overlay
  private toJSON(): object {
    const serialized_attribute_separators: { [key: string]: SeparatorValues } = {};

    for (const attr of this.attributes()) {
      serialized_attribute_separators[attr.key] = attr.value;
    }

    return {
      d: this.said,
      type: 'community/adc/overlays/separator/1.0',
      capture_base: this.capture_base,
      dataset_separator: this.separators.dataset_separator,
      attribute_separators: serialized_attribute_separators,
    };
  }

  private saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public generate_overlay(): string {
    return JSON.stringify(this.saidifying());
  }

  // TODO: find out if it neccessary to implement this methood for all overlays
  static deser(separator_ov_json_string: string): Separator {
    const separator_ov_json = JSON.parse(separator_ov_json_string);
    return new Separator(separator_ov_json, separator_ov_json.capture_base);
  }
}

export default Separator;
