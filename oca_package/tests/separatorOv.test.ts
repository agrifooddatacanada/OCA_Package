import Separator from '../src/oca_extensions/state/overlays/separator.js';

describe('Create a separator overlay', () => {
  it('should return a deterministic separator overlay', () => {
    const capture_base = {
      d: 'EL4q2aahA0RN-ftw97E_fmbVDVTyDbIaQR2B44HGsqFG',
      type: 'spec/capture_base/1.0',
      classification: '',
      attributes: {
        d: 'Text',
        i: 'Text',
        passed: 'Boolean',
      },
      flagged_attributes: [],
    };

    const separators = {
      type: 'separator',
      dataset_separator: {
        delimiter: ',',
        escape: '\\',
      },
      attribute_separators: {
        attr1: {
          delimiter: ',',
          escape: '\\',
        },
        attr2: {
          delimiter: ';',
          escape: '',
        },
      },
    };

    const separator_ov: Separator = new Separator(separators, capture_base);
    const separator_ov_serialized = separator_ov.generate_overlay();

    console.log(`separator_ov_serialized: ${JSON.stringify(JSON.parse(separator_ov_serialized), null, 2)}`);

    const reversed_separators = {
      type: 'separator',
      dataset_separator: {
        delimiter: ',',
        escape: '\\',
      },
      attribute_separators: {
        attr2: {
          delimiter: ';',
          escape: '',
        },
        attr1: {
          delimiter: ',',
          escape: '\\',
        },
      },
    };

    const reversed_separator_ov: Separator = new Separator(reversed_separators, capture_base);
    const reversed_separator_ov_serialized = reversed_separator_ov.generate_overlay();

    expect(separator_ov_serialized).toBe(reversed_separator_ov_serialized);
  });
});
