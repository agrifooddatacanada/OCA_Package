import { OverlayTypes } from './overlalyTypes.js';
import { saidify } from 'saidify';
import { getDigest } from '../../../utils/helpers.js';
import { Said } from '../../../types/types.js';

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

  constructor(separators: SeparatorsInput, oca_bundle: any) {
    this.type = OverlayTypes.Separator;
    this.separators = separators;
    this.capture_base = getDigest(oca_bundle);
  }

  public overlay_type(): string {
    return this.type;
  }

  public attributes(): { key: string; value: SeparatorValues }[] {
    const sorted_attribute_separators: { key: string; value: SeparatorValues }[] = [];

    if (this.separators.attribute_separators) {
      for (const key in this.separators.attribute_separators) {
        if (Object.prototype.hasOwnProperty.call(this.separators.attribute_separators, key)) {
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
      d: '',
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
