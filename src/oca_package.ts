import ExtensionBox from './oca_extensions/extensions.js';
import { ExtensionInputJson } from './oca_extensions/extensions.js';
import { saidify } from 'saidify';

interface IOcaPackage {
  oca_bundle: string;
  extensions_box: ExtensionBox;
}

class OcaPackage implements IOcaPackage {
  public oca_bundle: string;
  public extension_input_json: ExtensionInputJson;
  public extensions_box: ExtensionBox;

  constructor(extension_input_json: ExtensionInputJson, oca_bundle: string) {
    this.extensions_box = new ExtensionBox(extension_input_json, oca_bundle);
    this.extension_input_json = extension_input_json;
    this.oca_bundle = oca_bundle;
  }

  private saidifying(): string {
    const [, sad] = saidify(this.toJSON());
    return JSON.stringify(sad);
  }

  public said(): string {
    const [said] = saidify(this.toJSON());
    return said;
  }

  private toJSON(): object {
    try {
      return {
        d: '',
        type: 'oca_package/1.0',
        oca_bundle: this.oca_bundle,
        extensions: this.extensions_box.generateExtensionsBox(),
      };
    } catch (error) {
      throw new Error(`Failed to parse Extension JSON: ${error}`);
    }
  }

  public generateOcaPackage(): string {
    return this.saidifying();
  }
}

export default OcaPackage;
