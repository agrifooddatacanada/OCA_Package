import { describe, it, expect } from 'vitest';
import Extension, { ExtensionInputJson } from './oca_extensions/extensions';
import ExtensionContainer from './oca_extensions/state/extenstionContainer';
import OcaPackage from './oca_package';
import path from 'path';
import fs from 'fs';

describe('extension overlay', () => {
  it('should return a saidified extension overlay', () => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    let extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));
    extension_obj = extension_obj['extensions'][0];

    const extension_instance = new Extension(extension_obj, oca_bundle);

    const extension = extension_instance.generateExtension();

    expect(extension).to.be.a('string');
    const parsedExtension = JSON.parse(extension);
    expect(parsedExtension).to.have.property('d');
    expect(parsedExtension).to.have.property('type', 'community/adc/extension/1.0');
    expect(parsedExtension).to.have.property('bundle_digest');
    expect(parsedExtension).to.have.property('overlays');
  });
});

describe('extension container', () => {
  it('should return an array of serialized extension objects', () => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    const extension_obj: ExtensionInputJson = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const extension_container_instance = new ExtensionContainer();
    const extension_container = extension_container_instance.generate_extensions(extension_obj, oca_bundle);

    expect(extension_container).toBeInstanceOf(Array);
    expect(extension_container.length).toBe(1);
  });
});

describe('oca package', () => {
  it('should return a serialized oca package', () => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    const extension_obj: ExtensionInputJson = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const oca_package_instance = new OcaPackage(extension_obj, oca_bundle);
    const oca_package = oca_package_instance.generateOcaPackage();

    console.log(typeof oca_package);
    console.log(oca_package);

    expect(typeof oca_package).toBe('string');
    expect(() => JSON.parse(oca_package)).not.toThrow();
    const parsedOcaPackage = JSON.parse(oca_package);
    // console.dir(parsedOcaPackage, { depth: null });
    expect(parsedOcaPackage.d).toBe('EBpX82P-HmRjGe3Qr-zQbQmvN7uqxVh0Xt_nM61I9oqA');
  });
});
