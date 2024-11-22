import { OcaBundleCaptureBase } from '../../extensions.js';
import { OverlayTypes } from './overlalyTypes.js';
import { saidify } from 'saidify';

export type ExamplesFields<T> = { [key: string]: T[] };

export type ExampleInput = {
  type: string;
  language: string;
  attribute_examples: ExamplesFields<string>;
};

export interface IExampleOverlay {
  said?: string;
  language: string;
  type: OverlayTypes.Example;
  capture_base: OcaBundleCaptureBase;
  attribute_examples?: ExamplesFields<string>;
}

export class ExampleOverlay implements IExampleOverlay {
  d?: string;
  language: string;
  type: OverlayTypes.Example;
  capture_base: OcaBundleCaptureBase;
  attribute_examples?: ExamplesFields<string>;

  constructor(example: ExampleInput, capture_base: OcaBundleCaptureBase) {
    this.type = OverlayTypes.Example;
    this.language = example.language;
    this.capture_base = capture_base;
    this.attribute_examples = example.attribute_examples;
  }

  attributes(): { key: string; value: string[] }[] {
    const sorted_attribute_examples: { key: string; value: string[] }[] = [];

    if (this.attribute_examples) {
      for (const key in this.attribute_examples) {
        if (Object.prototype.hasOwnProperty.call(this.attribute_examples, key)) {
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
      type: 'adc/overlays/example/1.0',
      capture_base: this.capture_base.d,
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
  private capture_base: OcaBundleCaptureBase;

  constructor(example_overlays: ExampleInput[], capture_base: OcaBundleCaptureBase) {
    this.example_overlays = example_overlays;
    this.capture_base = capture_base;
  }

  generate_overlay(): string {
    if (this.example_overlays.length === 0) {
      return '[]';
    }

    const example_ovs: ExampleOverlay[] = this.example_overlays.map(example => {
      const example_ov = new ExampleOverlay(example, this.capture_base);
      return JSON.parse(example_ov.saidifying());
    });

    // Order the overlays by language
    example_ovs.sort((a, b) => a.language.localeCompare(b.language));

    return JSON.stringify(example_ovs);
  }
}

export default ExampleOverlaysContainer;
