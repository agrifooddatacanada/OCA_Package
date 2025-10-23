import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';

export interface IExampleOverlay {
  dynOverlay: DynOverlay;
  GenerateExampleOverlay(): string;
}

class ExampleOverlay implements IExampleOverlay {
  public dynOverlay: DynOverlay;
  private capture_base_digest: string;

  constructor(dynOverlay: DynOverlay, capture_base_digest: string) {
    if (!dynOverlay) {
      throw new Error('A dynamic extension overlay is required');
    }
    if (!capture_base_digest) {
      throw new Error('capture_base_digest is required');
    }
    this.dynOverlay = dynOverlay;
    this.capture_base_digest = capture_base_digest;
  }

  public get language(): any {
    return this.dynOverlay.language;
  }

  private GetAttributeExamples(): any {
    const examples = this.dynOverlay.attribute_examples;
    const canonicalizedExamples = canonicalize(examples);
    const sortedExamples = JSON.parse(canonicalizedExamples);
    return sortedExamples;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: 'community/overlays/adc/example/1.1',
      language: this.language,
      attribute_examples: this.GetAttributeExamples(),
    };
  }

  private Saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  // generates a single example overlay
  public GenerateExampleOverlay(): string {
    return JSON.stringify(this.Saidifying());
  }

  public static GenerateOverlay(dynOverlay: { example_overlays: any[] }, capture_base_digest: string): string {
    if (!dynOverlay || typeof dynOverlay !== 'object' || !Array.isArray(dynOverlay['example_overlays'])) {
      throw new Error('Invalid dynOverlay structure. Expected an object with an "example_overlays" array.');
    }

    const example_overlays: ExampleOverlay[] = [];
    const overlays = dynOverlay['example_overlays'];

    for (let example_ov of overlays) {
      try {
        const example_overlay = new ExampleOverlay(example_ov, capture_base_digest);
        example_overlays.push(JSON.parse(example_overlay.GenerateExampleOverlay()));
      } catch (error) {
        console.error('Failed to process example overlay:', error);
      }
    }

    example_overlays.sort((a, b) => a.language.localeCompare(b.language));

    return JSON.stringify(example_overlays);
  }
}

export default ExampleOverlay;
