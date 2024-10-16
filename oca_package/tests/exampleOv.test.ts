import ExampleOverlaysContainer from '../src/oca_extensions/state/overlays/example.js';

describe('Create an example overlay', () => {
  it('should return a serialized example overlay', () => {
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

    const examples = [
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
    ];

    const example_ov = new ExampleOverlaysContainer(examples, capture_base);
    console.log('example_ov : ', JSON.stringify(JSON.parse(example_ov.generate_overlay()), null, 2));

    const reversed_examples = [
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
    ];

    const reversed_example_ov = new ExampleOverlaysContainer(reversed_examples, capture_base);
    expect(example_ov.generate_overlay()).toEqual(reversed_example_ov.generate_overlay());
  });
});
