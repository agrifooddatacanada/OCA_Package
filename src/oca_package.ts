import ExtensionContainer from './oca_extensions/state/extenstionContainer.js';
import { ExtensionInputJson } from './oca_extensions/extensions.js';
import { saidify } from 'saidify';

interface IOcaPackage {
  oca_bundle: string;
  extensions: ExtensionContainer;
}

class OcaPackage implements IOcaPackage {
  public oca_bundle: string;
  public extension_input: ExtensionInputJson;
  public extensions: ExtensionContainer;

  constructor(extension_input: ExtensionInputJson, oca_bundle: string) {
    this.extensions = new ExtensionContainer();
    this.extension_input = extension_input;
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
      const extension_container = this.extensions.generate_extensions(this.extension_input, this.oca_bundle);
      return {
        d: '',
        type: 'adc/oca_package/1.0',
        oca_bundle: this.oca_bundle,
        extensions: extension_container,
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
