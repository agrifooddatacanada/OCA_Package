import { describe, it, expect } from 'vitest';
// import { AttributeFraming } from './oca_extensions/state/overlays/framing';
import { ExtensionState } from './oca_extensions/extensions.js';
import OcaPackage from './oca_package';
import path from 'path';
import fs from 'fs';

describe('', () => {
  it('should produce a serialized oca-package for multi-level schemas', () => {
    const extension_path = path.join(__dirname, '../bundles', 'extension.json');
    let extension_obj = JSON.parse(fs.readFileSync(extension_path, 'utf8'));
    const oca_bundle_path = path.join(__dirname, '../bundles', 'oca_bundle.json');
    const oca_bundle = JSON.parse(fs.readFileSync(oca_bundle_path, 'utf8'));
    const oca_package_instance = new OcaPackage(extension_obj, oca_bundle);

    const oca_package = oca_package_instance.GenerateOcaPackage();
    expect(typeof oca_package).toBe('string');
    expect(() => JSON.parse(oca_package)).not.toThrow();
    const parsedOcaPackage = JSON.parse(oca_package);

    console.dir(parsedOcaPackage, { depth: null });

    // expect(parsedOcaPackage.d).toBe('EG5L9MmzrvRdscWysJKw7tfwutGD0MSkFNsbULms3AmV');
  });

  // it('attribute framing', () => {
  //   const input = {
  //     adc: {
  //       EDDBSQuhzsJtE9ksQxpWYVBblWwHhhtNxemYFeEFY1qX: [
  //         {
  //           attribute_framing_overlay: {
  //             type: 'attribute_framing',
  //             properties: {
  //               id: 'SNOMEDCT',
  //               label: 'Systematized Nomenclature of Medicine Clinical Terms',
  //               location: 'https://bioportal.bioontology.org/ontologies/SNOMEDCT',
  //               version: '2023AA',
  //             },
  //             attributes: {
  //               Albumin_concentration: {
  //                 'http://purl.bioontology.org/ontology/SNOMEDCT/365801005': {
  //                   Predicate_id: 'skos:exactMatch',
  //                   Framing_justification: 'semapv:ManualMappingCuration',
  //                 },
  //                 'http://purl.bioontology.org/ontology/SNOMEDCT/365799007': {
  //                   Predicate_id: 'skos:broadMatch',
  //                   Framing_justification: 'semapv:ManualMappingCuration',
  //                 },
  //               },
  //               Glucose_concentration: {
  //                 'http://purl.bioontology.org/ontology/SNOMEDCT/365811003': {
  //                   Predicate_id: 'skos:exactMatch',
  //                   Framing_justification: 'semapv:ManualMappingCuration',
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   };

  //   const ext_state = new ExtensionState(input);
  //   const framing_input = ext_state._extensionState.adc.EDDBSQuhzsJtE9ksQxpWYVBblWwHhhtNxemYFeEFY1qX[0];
  //   const attribute_framing_instance = new AttributeFraming(framing_input);
  //   const attribute_framing = attribute_framing_instance.GenerateOverlay();
  //   // console.log(`attribute_framing: ${attribute_framing}`);
  // });
});
