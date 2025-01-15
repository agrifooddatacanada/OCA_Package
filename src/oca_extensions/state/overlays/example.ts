import { saidify } from 'saidify';
import { getDigest, isPresent } from '../../../utils/helpers.js';
import { Said, OverlayTypes } from '../../../types/types.js';

export type ExamplesFields<T> = { [key: string]: T[] };

export type ExampleInput = {
  type: string;
  language: string;
  attribute_examples: ExamplesFields<string>;
};

export interface IExampleOverlay {
  said?: Said;
  language: string;
  type: OverlayTypes.Example;
  capture_base: Said;
  attribute_examples?: ExamplesFields<string>;
}

export class ExampleOverlay implements IExampleOverlay {
  d?: Said;
  language: string;
  type: OverlayTypes.Example;
  capture_base: Said;
  attribute_examples?: ExamplesFields<string>;
  oca_bundle: any;

  constructor(example: ExampleInput, oca_bundle: any) {
    if (!example || !oca_bundle) {
      throw new Error('Example or OCA bundle is undefined or null.');
    }
    this.type = OverlayTypes.Example;
    this.language = example.language;
    this.oca_bundle = oca_bundle;
    this.capture_base = getDigest(this.oca_bundle);
    this.attribute_examples = example.attribute_examples;
  }

  public attributes(): { key: string; value: string[] }[] {
    const sorted_attribute_examples: { key: string; value: string[] }[] = [];

    if (this.attribute_examples) {
      for (const key in this.attribute_examples) {
        if (Object.prototype.hasOwnProperty.call(this.attribute_examples, key)) {
          if (!isPresent(key, this.oca_bundle)) {
            throw new Error(`Attribute ${key} not found in OCA bundle Capture Base`);
          }
          sorted_attribute_examples.push({ key, value: this.attribute_examples[key] });
        }
      }
      // Sort the attribute examples by key
      sorted_attribute_examples.sort((a, b) => a.key.localeCompare(b.key));
    }
    return sorted_attribute_examples;
  }

  private toJSON(): object {
    const example_inputs: ExamplesFields<string> = {};
    const sorted_attribute_examples = this.attributes();

    for (const example of sorted_attribute_examples) {
      example_inputs[example.key] = example.value;
    }

    return {
      d: '',
      language: this.language,
      type: 'community/adc/overlays/example/1.0',
      capture_base: this.capture_base,
      attribute_examples: example_inputs,
    };
  }

  saidifying(): string {
    const [, sad] = saidify(this.toJSON());
    return JSON.stringify(sad);
  }
}

class ExampleOverlaysContainer {
  private example_overlays: ExampleInput[] = [];
  public capture_base: Said;
  public oca_bundle: any;

  constructor(example_overlays: ExampleInput[], oca_bundle: any) {
    this.example_overlays = example_overlays;
    this.capture_base = getDigest(oca_bundle);
    this.oca_bundle = oca_bundle;
  }

  generate_overlay(): string {
    if (this.example_overlays.length === 0) {
      return '[]';
    }

    const example_ovs: ExampleOverlay[] = this.example_overlays.map(example => {
      const example_ov = new ExampleOverlay(example, this.oca_bundle);
      return JSON.parse(example_ov.saidifying());
    });

    // Order the overlays by language
    example_ovs.sort((a, b) => a.language.localeCompare(b.language));

    return JSON.stringify(example_ovs);
  }
}

export default ExampleOverlaysContainer;
