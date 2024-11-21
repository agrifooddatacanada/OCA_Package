import Extensions from './oca_extensions/extensions.js';
import { saidify } from 'saidify';

interface IOcaPackage {
  oca_bundle: string;
  extensions: Extensions;
}

class OcaPackage implements IOcaPackage {
  public oca_bundle: string;
  public extensions: Extensions;

  constructor(oca_bundle: string, extensions: Extensions) {
    this.oca_bundle = oca_bundle;
    this.extensions = extensions;
  }

  private toJSON(): object {
    try {
      const ext_container = JSON.parse(this.extensions.generate_extensions());
      const oca_bundle = JSON.parse(this.oca_bundle);

      return {
        d: '',
        type: 'adc/package/1.0',
        oca_bundle: oca_bundle,
        extensions: ext_container,
      };
    } catch (error) {
      throw new Error(`Failed to parse Extension JSON: ${error}`);
    }
  }

  private saidifying(): string {
    const [, sad] = saidify(this.toJSON());
    return JSON.stringify(sad);
  }

  public said(): string {
    const [said] = saidify(this.toJSON());
    return said;
  }

  public generate_oca_package(): string {
    return this.saidifying();
  }
}

export default OcaPackage;
