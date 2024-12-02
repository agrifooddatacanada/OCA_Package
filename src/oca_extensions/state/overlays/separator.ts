import { OcaBundleCaptureBase } from '../../extensions.js';
import { OverlayTypes } from './overlalyTypes.js';
import { saidify } from 'saidify';

export interface SeparatorsInput {
  type: string;
  dataset_separator?: SeparatorValues;
  attribute_separators?: {
    [key: string]: SeparatorValues;
  };
}

export interface ISeparatorOverlay {
  said?: string;
  type: OverlayTypes.Separator;
  capture_base: OcaBundleCaptureBase;
  dataset_separator?: SeparatorsInput['dataset_separator'];
  attribute_separators?: SeparatorsInput['attribute_separators'];
}

export interface SeparatorValues {
  delimiter: string;
  escape: string;
}

class Separator implements ISeparatorOverlay {
  said?: string;
  type: OverlayTypes.Separator;
  capture_base: OcaBundleCaptureBase;
  dataset_separator?: SeparatorsInput['dataset_separator'];
  attribute_separators?: SeparatorsInput['attribute_separators'];
  separators: SeparatorsInput;

  constructor(separators: SeparatorsInput, oca_bundle_capture_base: OcaBundleCaptureBase) {
    this.type = OverlayTypes.Separator;
    this.separators = separators;
    this.capture_base = oca_bundle_capture_base;
  }

  oca_bundle_capture_base_said(): string {
    return this.capture_base.d;
  }

  overlay_type(): string {
    return this.type;
  }

  attributes(): { key: string; value: SeparatorValues }[] {
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

  private toJSON(): object {
    const serialized_attribute_separators: { [key: string]: SeparatorValues } = {};

    for (const attr of this.attributes()) {
      serialized_attribute_separators[attr.key] = attr.value;
    }

    return {
      d: '',
      type: 'adc/overlays/separator/1.0',
      capture_base: this.oca_bundle_capture_base_said(),
      dataset_separator: this.separators.dataset_separator,
      attribute_separators: serialized_attribute_separators,
    };
  }

  saidifying(): string {
    const [, sad] = saidify(this.toJSON());
    return JSON.stringify(sad);
  }

  generate_overlay(): string {
    return this.saidifying();
  }

  // TODO: find out if it neccessary to implement this methood for all overlays
  static deser(separator_ov_json_string: string): Separator {
    const separator_ov_json = JSON.parse(separator_ov_json_string);
    return new Separator(separator_ov_json, separator_ov_json.capture_base);
  }
}

export default Separator;
