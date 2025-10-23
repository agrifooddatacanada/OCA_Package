import { DynOverlay } from '../../extensions.js';
import { saidify } from 'saidify';
import canonicalize from '../../../utils/canonical.js';

export interface IFormOverlay {
  dynOverlay: DynOverlay;
  GenerateFormOverlay(): string;
}

class FormOverlay implements IFormOverlay {
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

  private GetPages(): any {
    const pages = this.dynOverlay.pages;
    const canonicalizedPages = canonicalize(pages);
    const sortedPages = JSON.parse(canonicalizedPages);
    return sortedPages;
  }

  private GetPageOrder(): any {
    return this.dynOverlay.page_order;
  }

  private GetPageLabels(): any {
    // language specific page labels
    const allPageLabels = this.dynOverlay.page_labels;
    if (allPageLabels && allPageLabels[this.language]) {
      return allPageLabels[this.language];
    }
    return {};
  }

  private GetSidebarLabel(): any {
    // language specific sidebar labels
    const allSidebarLabels = this.dynOverlay.sidebar_label;
    if (allSidebarLabels && allSidebarLabels[this.language]) {
      return allSidebarLabels[this.language];
    }
    return {};
  }

  private GetDescription(): any {
    // language specific descriptions
    const allDescriptions = this.dynOverlay.description;
    if (allDescriptions && allDescriptions[this.language]) {
      return allDescriptions[this.language];
    }
    return {};
  }

  private GetTitle(): any {
    // language specific title
    const allTitles = this.dynOverlay.title;
    if (allTitles && allTitles[this.language]) {
      return allTitles[this.language];
    }
    return '';
  }

  private GetInteraction(): any {
    const interaction = this.dynOverlay.interaction;
    
    if (!interaction || !Array.isArray(interaction) || interaction.length === 0) {
      return interaction;
    }


    // language specific interaction
    const languageSpecificInteraction = interaction.map(interactionItem => {
      const languageSpecificArguments: any = {};

      for (const [attributeName, attributeConfig] of Object.entries(interactionItem.arguments || {})) {
        const config = attributeConfig as any;
        const newConfig: any = {
          type: config.type
        };

        // language specific placeholder
        if (config.placeholder) {
          if (typeof config.placeholder === 'object' && config.placeholder !== null) {
            const placeholder = config.placeholder[this.language] || '';
            if (placeholder) {
              newConfig.placeholder = placeholder;
            }
          } else {
            newConfig.placeholder = config.placeholder;
          }
        }

        if (config.options) {
          newConfig.options = config.options;
        }

        if (config.input_type) {
          newConfig.input_type = config.input_type;
        }

        languageSpecificArguments[attributeName] = newConfig;
      }

      return {
        ...interactionItem,
        arguments: languageSpecificArguments
      };
    });

    const canonicalizedInteraction = canonicalize(languageSpecificInteraction);
    const sortedInteraction = JSON.parse(canonicalizedInteraction);
    return sortedInteraction;
  }

  private toJSON(): object {
    return {
      d: '',
      capture_base: this.capture_base_digest,
      type: 'community/overlays/adc/form/1.1',
      language: this.language,
      pages: this.GetPages(),
      page_order: this.GetPageOrder(),
      page_labels: this.GetPageLabels(),
      sidebar_label: this.GetSidebarLabel(),
      description: this.GetDescription(),
      title: this.GetTitle(),
      interaction: this.GetInteraction(),
    };
  }

  private Saidifying(): Record<string, any> {
    const [, sad] = saidify(this.toJSON());
    return sad;
  }

  // generates a single form overlay
  public GenerateFormOverlay(): string {
    return JSON.stringify(this.Saidifying());
  }

  public static GenerateOverlay(dynOverlay: { form_overlays: any[] }, capture_base_digest: string): string {
    if (!dynOverlay || typeof dynOverlay !== 'object' || !Array.isArray(dynOverlay['form_overlays'])) {
      console.error('[Form ERROR] Invalid structure. dynOverlay:', dynOverlay);
      throw new Error('Invalid dynOverlay structure. Expected an object with a "form_overlays" array.');
    }

    const form_overlays: FormOverlay[] = [];
    const overlays = dynOverlay['form_overlays'];
    
    for (let form_ov of overlays) {
      try {
        const form_overlay = new FormOverlay(form_ov, capture_base_digest);
        const generated = form_overlay.GenerateFormOverlay();
        form_overlays.push(JSON.parse(generated));
      } catch (error) {
        console.error('Failed to process form overlay:', error);
      }
    }

    form_overlays.sort((a, b) => a.language.localeCompare(b.language));

    return JSON.stringify(form_overlays);
  }
}

export default FormOverlay;
