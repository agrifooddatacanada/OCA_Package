import { describe, it, expect } from 'vitest';
import OcaPackage from '../src/oca_package.js';
import Extensions from '../src/oca_extensions/extensions.js';
import Extensionbuild from './oca_extensions/state/extenstionsBuild.js';
import path from 'path';
import fs from 'fs';

describe('oca_package', () => {
  it('should check if an oca_package is deterministic', () => {
    // Load the OCA bundle
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    // Load the extensions
    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    const extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));
    const extensions = new Extensions(extension_obj, oca_bundle);

    // Create an OcaPackage
    const ocaPackage = new OcaPackage(extensions, oca_bundle);

    // Testing the reverse of the extensions object for deterministic purposes
    const reversed_extension_obj = {
      examples_ov: [
        {
          type: 'example',
          language: 'fra',
          attribute_examples: {
            d: ['va', 'aller'],
            i: ['toi', 'moi'],
          },
        },
        {
          type: 'example',
          language: 'eng',
          attribute_examples: {
            d: ['come', 'go'],
            i: ['me', 'you'],
          },
        },
      ],
      separator_ov: {
        type: 'separator',
        dataset_separator: {
          delimiter: ',',
          escape: '\\',
        },
        attribute_separators: {
          d: {
            delimiter: ',',
            escape: '\\',
          },
          i: {
            delimiter: ';',
            escape: '',
          },
        },
      },
    };

    const reversed_extensions = new Extensions(reversed_extension_obj, oca_bundle);
    const reversedOcaPackage = new OcaPackage(reversed_extensions, oca_bundle);

    // console.log('ocaPackage:', ocaPackage.generate_oca_package());
    expect(ocaPackage.said()).toEqual('EEHL3D7mg5FV0See7MBAvShVvONElImOgc7V1gnJt3tD');
    expect(reversedOcaPackage.said()).toEqual(ocaPackage.said());
  });
});

describe('extensions build', () => {
  it('should return a list of attributes only existing in both oca_bundle & extension input json', () => {
    // Load the OCA bundle
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    // Load the extension
    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    const extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    // Create an Extension Build
    const extensionBuild = new Extensionbuild();

    const attributeName = 'd';
    extensionBuild.addAttribute(attributeName, extension_obj, oca_bundle);

    console.log('attributeContainer:', extensionBuild.attributeContainer);

    expect(extensionBuild.attributeContainer.length).toEqual(1);
  });
});
