import Attribute from './state/attribute.js';
import { getCaptureBase } from '../utils/helpers';
import Ordering from './state/overlays/ordering.js';

type ExtensionInputJson = {
  ordering_ov: any;
};

export interface IExtensionState {
  ordering_arr: string[];
  entry_code_ordering_arr: object;
  // attributes: Attribute[];
}
export class ExtensionState implements IExtensionState {
  private _ordering_arr: string[];
  private _entry_code_ordering_arr: object = {};

  constructor(extension_obj: ExtensionInputJson) {
    if (!extension_obj) {
      throw new Error('Extension object is required');
    }
    this._ordering_arr = this.setAttributeOrdering(extension_obj);
    this.setEntryCodeOrdering(extension_obj);
  }

  public setAttributeOrdering(extension_obj: ExtensionInputJson): string[] {
    if (extension_obj['ordering_ov']) {
      this._ordering_arr = extension_obj.ordering_ov.ordering_attribute;
      return this._ordering_arr;
    } else {
      throw new Error('Ordering overlay is required');
    }
  }

  public get ordering_arr(): string[] {
    return this._ordering_arr;
  }

  public setEntryCodeOrdering(extension_obj: ExtensionInputJson): void {
    if (extension_obj['ordering_ov']) {
      this._entry_code_ordering_arr = extension_obj.ordering_ov.ordering_entry_codes || {};
    } else {
      this._entry_code_ordering_arr = {};
    }
  }

  public get entry_code_ordering_arr(): object {
    return this._entry_code_ordering_arr;
  }
}

class Extension {
  public extensionState: ExtensionState;
  public oca_bundle: any;

  constructor(extensionState: ExtensionState, oca_bundle: any) {
    if (!extensionState || !oca_bundle) {
      throw new Error('Extension state and OCA bundle are required');
    }
  }

  public generate_overlays(extensionState: ExtensionState, oca_bundle: any): object {
    return {};
  }

  private toJSON(): object {
    return {
      d: '',
      type: 'community/adc/extension/1.0',
      bundle_digest: getCaptureBase(this.oca_bundle),
      overlays: this.generate_overlays(this.extensionState, this.oca_bundle),
    };
  }

  // Todo: Implement the generate_extension method and calculate the digest(said) for the extension
  public generate_extension(): string {
    return JSON.stringify(this.toJSON());
  }
}

export default Extension;
