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
    const digest = 'EDbJHdL1JZ2UcCW2umPEKU11zAGeBEXrV12kbj6gt7tf';
    // const isValid = oca_package_instance.VerifyOcaPackage(parsedOcaPackage, digest);
    const isValid = VerifyOcaPackage(parsedOcaPackage, digest);
    expect(isValid).toBe(true);
  });

  it('should produce a serialized oca-package with separators', () => {
    const ext_with_separators_path = path.join(__dirname, '../bundles', 'extension_input_with_separators.json');
    const ext_obj_with_separators = JSON.parse(fs.readFileSync(ext_with_separators_path, 'utf8'));

    const oca_with_separators_path = path.join(__dirname, '../bundles', 'oca_bundle_with_separators.json');
    const oca_bundle_with_separators = JSON.parse(fs.readFileSync(oca_with_separators_path, 'utf8'));

    const oca_pkg_instance_with_separators = new OcaPackage(ext_obj_with_separators, oca_bundle_with_separators);

    const oca_pkg = oca_pkg_instance_with_separators.GenerateOcaPackage();

    const parsed_oca_pkg = JSON.parse(oca_pkg);

    console.dir(parsed_oca_pkg, { depth: null, colors: true });
  });
});

describe('Attribute framing overlay', () => {
  const capture_base_digest = 'EJXNTP69W5wu-5ypWqLZX_nY4lQjCE2mdjw0diko-56l';

  const readExtensionInput = () => {
    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    return JSON.parse(fs.readFileSync(extension_path, 'utf8'));
  };

  const buildAttributeFraming = (extension_obj: any) => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const oca_package = JSON.parse(new OcaPackage(extension_obj, oca_bundle).GenerateOcaPackage());
    return oca_package.extensions.adc[capture_base_digest].overlays.attribute_framing;
  };

  it('should return every framing source as an array entry, sorted by framing_metadata id', () => {
    const attribute_framing = buildAttributeFraming(readExtensionInput());

    expect(Array.isArray(attribute_framing)).toBe(true);
    expect(attribute_framing).toHaveLength(2);
    expect(attribute_framing.map((ov: any) => ov.framing_metadata.id)).toEqual(['ENVO', 'FOODON']);

    for (const overlay of attribute_framing) {
      expect(overlay.d).toMatch(/^E/);
      expect(overlay.capture_base).toBe(capture_base_digest);
      expect(overlay.type).toBe('community/overlays/adc/attribute_framing/1.0');
    }

    // each source keeps its own digest
    expect(attribute_framing[0].d).not.toBe(attribute_framing[1].d);
  });

  it('should preserve framing_metadata imports and per-attribute framing data of each source', () => {
    const [envo, foodon] = buildAttributeFraming(readExtensionInput());

    expect(foodon.framing_metadata).toEqual({
      id: 'FOODON',
      label: 'FoodOntology',
      location: 'https://raw.githubusercontent.com/FoodOntology/foodon/master/foodon.owl',
      version: '1.0',
      imports: {
        dcterms: {
          id: 'dcterms',
          label: 'DCMI Metadata Terms',
          location: 'http://purl.org/dc/terms/',
          version: '1.1',
        },
        // imports only require an id
        foaf: { id: 'foaf' },
      },
    });
    expect(foodon.attributes).toEqual({
      age: {
        framing_justification: 'semapv:ManualMappingCuration',
        predicate_id: 'skos:closeMatch',
        term_id: 'FOODON:00002',
      },
      height: {
        description: 'Height of the athlete.',
        framing_justification: 'semapv:ManualMappingCuration',
        predicate_id: 'skos:exactMatch',
        term_id: 'FOODON:00001',
      },
    });

    // a source without imports is emitted without the key
    expect(envo.framing_metadata).toEqual({
      id: 'ENVO',
      label: 'Environment Ontology',
      location: 'http://purl.obolibrary.org/obo/envo.owl',
      version: '2.0',
    });
    expect(envo.attributes).toEqual({
      age: {
        description: 'Age as recorded in the environmental sample record.',
        framing_justification: 'semapv:LexicalMatching',
        predicate_id: 'skos:broadMatch',
        term_id: 'ENVO:00010',
      },
    });
  });

  it('should read a single un-wrapped framing source as a one-entry array', () => {
    const extension_obj = readExtensionInput();
    const [first_source] =
      extension_obj.extensions.adc['EFPGBEwn5Hzl9Cbx1r9Od54IwhkqJXc3vE4Jm7mjvHy2'][0].attribute_framing_overlay
        .attribute_framing_overlays;

    extension_obj.extensions.adc['EFPGBEwn5Hzl9Cbx1r9Od54IwhkqJXc3vE4Jm7mjvHy2'][0].attribute_framing_overlay = {
      type: 'attribute_framing',
      ...first_source,
    };

    const attribute_framing = buildAttributeFraming(extension_obj);

    expect(Array.isArray(attribute_framing)).toBe(true);
    expect(attribute_framing).toHaveLength(1);
    expect(attribute_framing[0].framing_metadata.id).toBe('FOODON');
    expect(attribute_framing[0].attributes.height.description).toBe('Height of the athlete.');
  });

  it('should skip a malformed source instead of failing the whole export', () => {
    const extension_obj = readExtensionInput();
    extension_obj.extensions.adc[
      'EFPGBEwn5Hzl9Cbx1r9Od54IwhkqJXc3vE4Jm7mjvHy2'
    ][0].attribute_framing_overlay.attribute_framing_overlays.push(null);

    const attribute_framing = buildAttributeFraming(extension_obj);

    expect(attribute_framing).toHaveLength(2);
    expect(attribute_framing.map((ov: any) => ov.framing_metadata.id)).toEqual(['ENVO', 'FOODON']);
  });

  it('should throw when the framing overlay carries neither an array nor a single source', () => {
    const extension_obj = readExtensionInput();
    extension_obj.extensions.adc['EFPGBEwn5Hzl9Cbx1r9Od54IwhkqJXc3vE4Jm7mjvHy2'][0].attribute_framing_overlay = {
      type: 'attribute_framing',
    };

    expect(() => buildAttributeFraming(extension_obj)).toThrow(/attribute_framing_overlays/);
  });
});
