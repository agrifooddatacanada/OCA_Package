import OcaPackage from '../src/oca_package.js';
import Extensions from '../src/oca_extensions/extensions.js';
import path from 'path';
import fs from 'fs';

describe('oca_package', () => {
  it('should check if an oca_package is deterministic', () => {
    const oca_bundle_path = path.join(__dirname, '../..', 'bundles', 'oca_bundle.json');
    const oca_bundle = fs.readFileSync(oca_bundle_path, 'utf8');

    const extension_path = path.join(__dirname, '../..', 'bundles', 'extension.json');
    const extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const extensions = new Extensions(extension_obj, oca_bundle);
    const ocaPackageInstance = new OcaPackage(oca_bundle, extensions);

    const saidifiedOcaPackage = ocaPackageInstance.generate_oca_package();

    console.log('saidifiedOcaPackage : ', saidifiedOcaPackage);

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
    const reversedOcaPackageInstance = new OcaPackage(oca_bundle, reversed_extensions);
    const reversedSaidifiedOcaPackage = reversedOcaPackageInstance.generate_oca_package();

    expect(JSON.parse(saidifiedOcaPackage).d).toEqual(JSON.parse(reversedSaidifiedOcaPackage).d);
  });
});
