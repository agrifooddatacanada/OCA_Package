import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';

export interface IExampleOverlay {
  dynOverlay: DynOverlay;
  GenerateOverlay(): string;
}

class ExampleOverlay implements IExampleOverlay {
  public dynOverlay: DynOverlay;

  constructor(dynOverlay: DynOverlay) {
    if (!dynOverlay) {
      throw new Error('a dynamic extension overlay are required');
    }
    this.dynOverlay = dynOverlay;
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
      type: 'community/overlays/adc/example/1.1',
      language: this.language,
      attribute_examples: this.GetAttributeExamples(),
    };
  }

  private Saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  public GenerateOverlay(): string {
    return JSON.stringify(this.Saidifying());
  }
}

class ExampleOverlaysContainer {
  private dynOverlays: DynOverlay[];

  constructor(dynOverlay: DynOverlay[]) {
    if (!dynOverlay || typeof dynOverlay !== 'object' || !Array.isArray(dynOverlay['example_overlays'])) {
      throw new Error('Invalid dynOverlay structure. Expected an object with an "example_overlays" array.');
    }
    this.dynOverlays = dynOverlay['example_overlays'];
  }

  public BuildExampleOverlays(): string {
    const example_overlays: ExampleOverlay[] = [];

    for (let example_ov of this.dynOverlays) {
      try {
        const example_overlay = new ExampleOverlay(example_ov);
        example_overlays.push(JSON.parse(example_overlay.GenerateOverlay()));
      } catch (error) {
        console.error('Failed to process example overlay:', error);
      }
    }

    example_overlays.sort((a, b) => a.language.localeCompare(b.language));

    return JSON.stringify(example_overlays);
  }
}

export default ExampleOverlaysContainer;
