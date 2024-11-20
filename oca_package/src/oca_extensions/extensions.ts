import Separator from './state/overlays/separator.js';
import ExampleOverlaysContainer from './state/overlays/example.js';
import { OcaBundleCaptureBase, IExtensionsInputJSON, ExampleInput, SeparatorsInput } from '@oca_package/types/types.js';

import { OCABox } from 'oca.js';

class Extensions {
  #serialized_extensions: string = '';
  private extension_obj: IExtensionsInputJSON;
  oca_bundle: string;

  constructor(extensions_obj: IExtensionsInputJSON, oca_bundle: string) {
    if (!extensions_obj || !oca_bundle) {
      throw new Error('Extensions object and OCA bundle are required');
    }
    this.extension_obj = extensions_obj;
    this.oca_bundle = oca_bundle;
  }

  get ser_extensions(): string {
    return this.#serialized_extensions;
  }

  get_capture_base_from_oca_bundle(): OcaBundleCaptureBase {
    try {
      if (typeof this.oca_bundle !== 'string') {
        throw new Error('OCA bundle must be a string');
      }

      const parsedBundle = JSON.parse(this.oca_bundle);

      if (!parsedBundle || typeof parsedBundle !== 'object') {
        throw new Error('Invalid OCA bundle format');
      }

      if (!parsedBundle.bundle) {
        throw new Error('OCA bundle does not contain a bundle property');
      }

      const oca_box = new OCABox().load(parsedBundle.bundle);

      return oca_box.generateBundle().capture_base;
    } catch (error) {
      console.error('Error in get_capture_base_from_oca_bundle:', error);
      throw new Error(`Failed to get capture base from OCA bundle: ${error}`);
    }
  }

  generate_extensions(): string {
    // TODO: define the canonical rules for the extension overlays

    const extension_overlays: { [key: string]: string } = {};

    try {
      if (this.extension_obj.examples_ov) {
        const examples_ov = new ExampleOverlaysContainer(
          this.extension_obj.examples_ov as ExampleInput[],
          this.get_capture_base_from_oca_bundle(),
        );

        const exampleOverlays = examples_ov.generate_overlay();
        extension_overlays['example'] = Array.isArray(exampleOverlays)
          ? JSON.stringify(exampleOverlays)
          : exampleOverlays;
      }

      if (this.extension_obj.separator_ov) {
        const separator_ov = new Separator(
          this.extension_obj.separator_ov as SeparatorsInput,
          this.get_capture_base_from_oca_bundle(),
        );

        const separatorOverlays = separator_ov.saidifying();
        extension_overlays['separator'] = separatorOverlays;
      }

      // deserialize individual overlay to avoid escaping characters in the final JSON
      const deser_obj: { [key: string]: object } = {};

      for (const key of Object.keys(extension_overlays)) {
        const ov = extension_overlays[key];
        if (typeof ov === 'string') {
          deser_obj[key] = JSON.parse(ov);
        }
      }

      this.#serialized_extensions = JSON.stringify(deser_obj);
      return this.#serialized_extensions;
    } catch (error) {
      throw new Error(`Failed to generate extensions: ${error}`);
    }
  }
}

export default Extensions;
