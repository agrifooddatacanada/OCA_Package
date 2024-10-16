import Extensions from '../src/oca_extensions/extensions.js';
import path from 'path';
import fs from 'fs';

describe('Build extension container', () => {
  it('should return a deterministic extension container', () => {
    const oca_bundle_path = path.join(__dirname, '../..', 'bundles', 'oca_bundle.json');
    const oca_bundle = fs.readFileSync(oca_bundle_path, 'utf8');

    const extension_obj = {
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
      examples_ov: [
        {
          type: 'example',
          language: 'eng',
          attribute_examples: {
            d: ['come', 'go'],
            i: ['me', 'you'],
          },
        },
        {
          type: 'example',
          language: 'fra',
          attribute_examples: {
            d: ['va', 'aller'],
            i: ['toi', 'moi'],
          },
        },
      ],
    };

    const extensions: Extensions = new Extensions(extension_obj, oca_bundle);
    const serializedExtensions = extensions.generate_extensions();

    const reversedExtensionObj = {
      separator_ov: {
        type: 'separator',
        dataset_separator: {
          delimiter: ',',
          escape: '\\',
        },
        attribute_separators: {
          i: {
            delimiter: ';',
            escape: '',
          },
          d: {
            delimiter: ',',
            escape: '\\',
          },
        },
      },
      examples_ov: [
        {
          type: 'example',
          language: 'fra',
          attribute_examples: {
            i: ['toi', 'moi'],
            d: ['va', 'aller'],
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
    };

    const reversedExtensions: Extensions = new Extensions(reversedExtensionObj, oca_bundle);
    const reversedSerializedExtensions = reversedExtensions.generate_extensions();

    expect(serializedExtensions).toBe(reversedSerializedExtensions);
  });
});
