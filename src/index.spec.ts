import { describe, it, expect } from 'vitest';
import { ExtensionState } from './oca_extensions/extensions';
import Ordering from './oca_extensions/state/overlays/ordering';
import path from 'path';
import fs from 'fs';

describe('ordering overlay', () => {
  it('should return an ordering overlay', () => {
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));

    const extension_path = path.join(__dirname, '../bundles', 'ext_ordering.json');
    const extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));

    const extensionState = new ExtensionState(extension_obj);
    const ordering = new Ordering(extensionState, oca_bundle);
    console.dir(ordering.generate_overlay(), { depth: null });
  });
});
