import { describe, it, expect } from 'vitest';
import OcaPackage from './oca_package';
import path from 'path';
import fs from 'fs';

import { VerifyOcaPackage } from './verify';

describe('OCA Package', () => {
  it('should produce a serialized oca-package', () => {
    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    let extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const oca_package_instance = new OcaPackage(extension_obj, oca_bundle);

    const oca_package = oca_package_instance.GenerateOcaPackage();
    expect(typeof oca_package).toBe('string');
    expect(() => JSON.parse(oca_package)).not.toThrow();
    const parsedOcaPackage = JSON.parse(oca_package);

    console.dir(parsedOcaPackage, { depth: null, colors: true });

    expect(parsedOcaPackage).toHaveProperty('d');
    expect(parsedOcaPackage).toHaveProperty('type');
    expect(parsedOcaPackage.type).toBe('oca_package/1.0');
    expect(parsedOcaPackage).toHaveProperty('extensions');

    // Verify the OCA package
    const digest = 'EBc_Rp2ORodBJuTZacCFBJEyijL7dirtnc2aJ_uCwAsg';
    // const isValid = oca_package_instance.VerifyOcaPackage(parsedOcaPackage, digest);
    const isValid = VerifyOcaPackage(parsedOcaPackage, digest);
    expect(isValid).toBe(true);
  });
});
