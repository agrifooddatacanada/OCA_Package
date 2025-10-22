import ExtensionBox from './oca_extensions/extensions.js';
import { ExtensionInputJson } from './oca_extensions/extensions.js';
// import { saidify, verify } from 'saidify';
import { saidify, verify, SAIDDex, Serials } from 'saidify';

interface IOcaPackage {
  oca_bundle: string;
  extensions_box: ExtensionBox;
  GenerateOcaPackage(): string;
  Said(): string;
}

class OcaPackage implements IOcaPackage {
  public oca_bundle: string;
  public extensions_box: ExtensionBox;

  constructor(extension_input_json: ExtensionInputJson, oca_bundle: string) {
    this.oca_bundle = oca_bundle;
    this.extensions_box = new ExtensionBox(extension_input_json, oca_bundle);
  }

  private Saidifying(): any {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public Said(): string {
    const [said] = saidify(this.toJSON());
    return said;
  }

  private toJSON(): object {
    try {
      return {
        d: '',
        type: 'oca_package/1.0',
        oca_bundle: this.oca_bundle,
        extensions: this.extensions_box.buildExtensionsBox,
      };
    } catch (error) {
      throw new Error(`Failed to parse Extension JSON: ${error}`);
    }
  }

  public GenerateOcaPackage(): string {
    return JSON.stringify(this.Saidifying());
  }

  /**
   * Verifies the OCA package against a digest.
   * @param oca_package - The OCA package to verify.
   * @param digest - The digest to verify against.
   * @returns {boolean} - Returns true if the verification is successful, otherwise false.
   */
  public VerifyOcaPackage(oca_package: IOcaPackage, digest: string): boolean {
    const label = 'd';
    // prefixed is set to true this avoid d = '' to be considered as a valid self-addressing data
    return verify(oca_package, digest, label, SAIDDex.Blake3_256, Serials.JSON, true);
  }
}

export default OcaPackage;
