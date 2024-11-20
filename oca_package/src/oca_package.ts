import Extensions from './oca_extensions/extensions.js';
import { IOcaPackage } from './types/types.js';
import { saidify } from 'saidify';

export interface OcaBundleCaptureBase {
  d: string;
  type: string;
  classification: string;
  attributes: { [key: string]: string };
  flagged_attributes: string[];
}

class OcaPackage implements IOcaPackage {
  public oca_bundle: string;
  public extensions: Extensions;

  constructor(oca_bundle: string, extensions: Extensions) {
    this.oca_bundle = oca_bundle;
    this.extensions = extensions;
  }

  private toJSON(): object {
    let ext_container;
    let oca_bundle;

    try {
      ext_container = JSON.parse(this.extensions.generate_extensions());
      oca_bundle = JSON.parse(this.oca_bundle);
    } catch (error) {
      throw new Error(`Failed to parse Extension JSON: ${error}`);
    }

    return {
      d: '',
      type: 'adc/package/1.0',
      oca_bundle: oca_bundle,
      extensions: ext_container,
    };
  }

  private saidifying(): string {
    const [, sad] = saidify(this.toJSON());
    return JSON.stringify(sad);
  }

  // Returns oca_package digest
  said(): string {
    const [said] = saidify(this.toJSON());
    return said;
  }

  generate_oca_package(): string {
    return this.saidifying();
  }
}

export default OcaPackage;
