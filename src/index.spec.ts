import { describe, it, expect } from 'vitest';
// import Extension, { ExtensionInputJson } from './oca_extensions/extensions';
// import ExtensionContainer from './oca_extensions/state/extenstionContainer';
import OcaPackage from './oca_package';
import path from 'path';
import fs from 'fs';
import ExtensionBox, { ExtensionState, DynOverlay, Overlay } from './oca_extensions/extensions';

describe('oca-package: ', () => {
  it('should produce serialized oca-package for multi-level schema', () => {
    const extension_path = path.join(__dirname, '../bundles', 'extension_with_deps.json');
    let extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle_with_deps.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));
    const oca_package_instance = new OcaPackage(extension_obj, oca_bundle);
    const oca_package = oca_package_instance.generateOcaPackage();

    // console.log(oca_package);

    expect(typeof oca_package).toBe('string');
    expect(() => JSON.parse(oca_package)).not.toThrow();
    const parsedOcaPackage = JSON.parse(oca_package);

    console.dir(parsedOcaPackage, { depth: null });

    expect(parsedOcaPackage.d).toBe('EO9qcIYd-jlup1lAwJfv7O6tA8FURYlU65vlF4Gow867');
  });
});
