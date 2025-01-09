import { describe, it, expect } from 'vitest';
import Extension, { ExtensionInputJson } from './oca_extensions/extensions';
import ExtensionContainer from './oca_extensions/state/extenstionsBuild';
import OcaPackage from './oca_package';
import path from 'path';
import fs from 'fs';

describe('extension overlay', () => {
  it('should return a saidified extension overlay', () => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    const extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const extension = new Extension(extension_obj, oca_bundle);

    const overlay = extension.generate_extension();

    expect(overlay).to.be.a('string');
    const parsedOverlay = JSON.parse(overlay);
    expect(parsedOverlay).to.have.property('d');
    expect(parsedOverlay).to.have.property('type', 'community/adc/extension/1.0');
    expect(parsedOverlay).to.have.property('bundle_digest');
    expect(parsedOverlay).to.have.property('overlays');
    expect(parsedOverlay.overlays).to.have.property('ordering');
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
    // overlays.forEach(overlay => {
    //   expect(typeof overlay).toBe('string');
    //   expect(() => JSON.parse(overlay)).not.toThrow();
    // });
  });
});

describe('oca package', () => {
  it('should return a serialized oca package string', () => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    const extension_obj: ExtensionInputJson = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const oca_package_instance = new OcaPackage(extension_obj, oca_bundle);
    const oca_package = oca_package_instance.generate_oca_package();

    console.dir(oca_package, { depth: null });

    expect(typeof oca_package).toBe('string');
    expect(() => JSON.parse(oca_package)).not.toThrow();
  });
});
