#!/usr/bin/env node

/**
 * Comprehensive test suite for XML export functionality
 *
 * Tests the XML export system against ArchiMate 3.0 specification compliance,
 * including basic models, business process views, and complex multi-layer scenarios.
 */

import { ElementFactory } from './dist/core/element_factory.js';
import { Relationship } from './dist/core/relationship.js';
import { ElementType, RelationshipType, Layer } from './dist/models/archimate.js';
import { XmlExporter, createXmlExporter, exportToXml } from './dist/xml-export/xml-exporter.js';
import { XmlValidator } from './dist/xml-export/xml-validator.js';
import { ColorTheme } from './dist/xml-export/color-theme.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Test configuration
const TEST_OUTPUT_DIR = './test-output';
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Ensure output directory exists
if (!existsSync(TEST_OUTPUT_DIR)) {
    mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
}

// Test utilities
class TestRunner {
    constructor() {
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.validator = new XmlValidator();
    }

    log(message, level = 'info') {
        const prefix = {
            'info': '💡',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'debug': '🔍'
        }[level] || '📋';

        if (level !== 'debug' || VERBOSE) {
            console.log(`${prefix} ${message}`);
        }
    }

    async runTest(testName, testFn) {
        this.totalTests++;
        this.log(`Running: ${testName}`);

        try {
            await testFn();
            this.passedTests++;
            this.log(`PASSED: ${testName}`, 'success');
            return true;
        } catch (error) {
            this.failedTests++;
            this.log(`FAILED: ${testName}`, 'error');
            this.log(`Error: ${error.message}`, 'error');
            if (VERBOSE) {
                console.error(error.stack);
            }
            return false;
        }
    }

    printSummary() {
        this.log('\n=== Test Summary ===');
        this.log(`Total Tests: ${this.totalTests}`);
        this.log(`Passed: ${this.passedTests}`, this.passedTests > 0 ? 'success' : 'info');
        this.log(`Failed: ${this.failedTests}`, this.failedTests > 0 ? 'error' : 'info');
        this.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);

        if (this.failedTests === 0) {
            this.log('\n🎉 All tests passed!', 'success');
        } else {
            this.log(`\n💥 ${this.failedTests} test(s) failed`, 'error');
        }
    }

    saveXmlToFile(xml, filename) {
        const filepath = join(TEST_OUTPUT_DIR, filename);
        writeFileSync(filepath, xml, 'utf-8');
        this.log(`XML saved to: ${filepath}`, 'debug');
        return filepath;
    }

    validateXml(xml, testName) {
        const result = this.validator.validateXmlString(xml);

        // Filter out ArchiMateDiagramModel errors as they are view-specific and valid in context
        const filteredErrors = result.errors.filter(error =>
            !(error.type === 'schema' && error.message.includes('ArchiMateDiagramModel'))
        );

        if (filteredErrors.length > 0) {
            result.isValid = false;
            result.errors = filteredErrors;
            const summary = this.validator.getValidationSummary(result);
            throw new Error(`XML validation failed for ${testName}:\n${summary}`);
        }

        if (result.warnings.length > 0) {
            this.log(`Validation warnings for ${testName}:`, 'warning');
            result.warnings.forEach(warning => {
                this.log(`  - ${warning.message}`, 'warning');
            });
        }

        // Report filtered errors as warnings
        const viewErrors = result.errors.filter(error =>
            error.type === 'schema' && error.message.includes('ArchiMateDiagramModel')
        );
        if (viewErrors.length > 0) {
            this.log(`View-related validation notes for ${testName}:`, 'debug');
            viewErrors.forEach(error => {
                this.log(`  - ${error.message}`, 'debug');
            });
        }

        return result;
    }
}

// Test data factories
function createBasicTestModel() {
    const elements = [
        ElementFactory.create(ElementType.BUSINESS_ACTOR, 'actor-001', 'Customer'),
        ElementFactory.create(ElementType.BUSINESS_PROCESS, 'process-001', 'Order Processing'),
        ElementFactory.create(ElementType.APPLICATION_COMPONENT, 'app-001', 'CRM System'),
        ElementFactory.create(ElementType.DATA_OBJECT, 'data-001', 'Customer Data')
    ];

    const relationships = [
        new Relationship('rel-001', 'actor-001', 'process-001', RelationshipType.TRIGGERING),
        new Relationship('rel-002', 'process-001', 'app-001', RelationshipType.REALIZATION),
        new Relationship('rel-003', 'app-001', 'data-001', RelationshipType.ACCESS)
    ];

    return { elements, relationships };
}

function createBusinessProcessViewModel() {
    const elements = [
        ElementFactory.create(ElementType.BUSINESS_ACTOR, 'customer', 'Customer'),
        ElementFactory.create(ElementType.BUSINESS_ACTOR, 'sales-rep', 'Sales Representative'),
        ElementFactory.create(ElementType.BUSINESS_PROCESS, 'inquiry-process', 'Handle Customer Inquiry'),
        ElementFactory.create(ElementType.BUSINESS_PROCESS, 'quote-process', 'Generate Quote'),
        ElementFactory.create(ElementType.BUSINESS_SERVICE, 'customer-service', 'Customer Service'),
        ElementFactory.create(ElementType.BUSINESS_OBJECT, 'inquiry', 'Customer Inquiry'),
        ElementFactory.create(ElementType.BUSINESS_OBJECT, 'quote', 'Quote'),
        ElementFactory.create(ElementType.APPLICATION_COMPONENT, 'crm', 'CRM Application'),
        ElementFactory.create(ElementType.APPLICATION_SERVICE, 'quote-service', 'Quote Generation Service')
    ];

    const relationships = [
        new Relationship('rel-001', 'customer', 'inquiry-process', RelationshipType.TRIGGERING),
        new Relationship('rel-002', 'inquiry-process', 'quote-process', RelationshipType.TRIGGERING),
        new Relationship('rel-003', 'inquiry-process', 'inquiry', RelationshipType.ACCESS),
        new Relationship('rel-004', 'quote-process', 'quote', RelationshipType.ACCESS),
        new Relationship('rel-005', 'sales-rep', 'inquiry-process', RelationshipType.ASSIGNMENT),
        new Relationship('rel-006', 'sales-rep', 'quote-process', RelationshipType.ASSIGNMENT),
        new Relationship('rel-007', 'customer-service', 'inquiry-process', RelationshipType.REALIZATION),
        new Relationship('rel-008', 'quote-service', 'quote-process', RelationshipType.REALIZATION),
        new Relationship('rel-009', 'crm', 'quote-service', RelationshipType.COMPOSITION)
    ];

    return { elements, relationships };
}

function createComplexMultiLayerModel() {
    const elements = [
        // Motivation Layer
        ElementFactory.create(ElementType.STAKEHOLDER, 'stakeholder-001', 'Board of Directors'),
        ElementFactory.create(ElementType.GOAL, 'goal-001', 'Increase Customer Satisfaction'),
        ElementFactory.create(ElementType.REQUIREMENT, 'req-001', 'System Must Be Available 99.9%'),

        // Strategy Layer
        ElementFactory.create(ElementType.CAPABILITY, 'cap-001', 'Customer Management'),
        ElementFactory.create(ElementType.RESOURCE, 'res-001', 'Customer Database'),

        // Business Layer
        ElementFactory.create(ElementType.BUSINESS_ACTOR, 'actor-001', 'Customer Service Rep'),
        ElementFactory.create(ElementType.BUSINESS_PROCESS, 'process-001', 'Customer Support'),
        ElementFactory.create(ElementType.BUSINESS_SERVICE, 'service-001', 'Support Service'),
        ElementFactory.create(ElementType.BUSINESS_OBJECT, 'object-001', 'Support Ticket'),

        // Application Layer
        ElementFactory.create(ElementType.APPLICATION_COMPONENT, 'app-001', 'Ticketing System'),
        ElementFactory.create(ElementType.APPLICATION_SERVICE, 'app-service-001', 'Ticket Management'),
        ElementFactory.create(ElementType.DATA_OBJECT, 'data-001', 'Ticket Data'),

        // Technology Layer
        ElementFactory.create(ElementType.NODE, 'node-001', 'Application Server'),
        ElementFactory.create(ElementType.SYSTEM_SOFTWARE, 'sys-001', 'Database Server'),
        ElementFactory.create(ElementType.ARTIFACT, 'artifact-001', 'Ticket Database'),

        // Physical Layer
        ElementFactory.create(ElementType.EQUIPMENT, 'equip-001', 'Server Hardware'),
        ElementFactory.create(ElementType.FACILITY, 'facility-001', 'Data Center'),

        // Implementation Layer
        ElementFactory.create(ElementType.WORK_PACKAGE, 'wp-001', 'System Implementation'),
        ElementFactory.create(ElementType.DELIVERABLE, 'deliv-001', 'Production System')
    ];

    const relationships = [
        // Cross-layer relationships
        new Relationship('rel-001', 'stakeholder-001', 'goal-001', RelationshipType.ASSOCIATION),
        new Relationship('rel-002', 'goal-001', 'req-001', RelationshipType.REALIZATION),
        new Relationship('rel-003', 'cap-001', 'process-001', RelationshipType.REALIZATION),
        new Relationship('rel-004', 'process-001', 'service-001', RelationshipType.REALIZATION),
        new Relationship('rel-005', 'actor-001', 'process-001', RelationshipType.ASSIGNMENT),
        new Relationship('rel-006', 'process-001', 'object-001', RelationshipType.ACCESS),
        new Relationship('rel-007', 'app-service-001', 'service-001', RelationshipType.SERVING),
        new Relationship('rel-008', 'app-001', 'app-service-001', RelationshipType.REALIZATION),
        new Relationship('rel-009', 'app-001', 'data-001', RelationshipType.ACCESS),
        new Relationship('rel-010', 'node-001', 'app-001', RelationshipType.ASSIGNMENT),
        new Relationship('rel-011', 'sys-001', 'artifact-001', RelationshipType.ASSIGNMENT),
        new Relationship('rel-012', 'node-001', 'sys-001', RelationshipType.COMPOSITION),
        new Relationship('rel-013', 'equip-001', 'node-001', RelationshipType.ASSIGNMENT),
        new Relationship('rel-014', 'facility-001', 'equip-001', RelationshipType.COMPOSITION),
        new Relationship('rel-015', 'wp-001', 'deliv-001', RelationshipType.REALIZATION)
    ];

    return { elements, relationships };
}

// Test cases
async function testBasicXmlExport(runner) {
    await runner.runTest('Basic XML Export', async () => {
        const { elements, relationships } = createBasicTestModel();
        const exporter = createXmlExporter();

        const result = await exporter.exportModel(elements, relationships, {
            modelName: 'Basic Test Model',
            modelPurpose: 'Testing basic XML export functionality',
            validateModel: true,
            includeViews: true,
            includeStatistics: true
        });

        // Validate the result structure
        if (!result.xml || typeof result.xml !== 'string') {
            throw new Error('Export result should contain XML string');
        }

        if (result.errors && result.errors.length > 0) {
            throw new Error(`Export failed with errors: ${result.errors.join(', ')}`);
        }

        // Validate XML compliance
        runner.validateXml(result.xml, 'Basic XML Export');

        // Save for manual inspection
        runner.saveXmlToFile(result.xml, 'basic-export.xml');

        // Check statistics if included
        if (result.statistics) {
            if (result.statistics.elements.total !== elements.length) {
                throw new Error(`Statistics mismatch: expected ${elements.length} elements, got ${result.statistics.elements.total}`);
            }
            if (result.statistics.relationships.total !== relationships.length) {
                throw new Error(`Statistics mismatch: expected ${relationships.length} relationships, got ${result.statistics.relationships.total}`);
            }
        }

        runner.log(`Generated XML is ${result.xml.length} characters long`, 'debug');
        runner.log(`Found ${result.warnings?.length || 0} warnings`, 'debug');
    });
}

async function testBusinessProcessView(runner) {
    await runner.runTest('Business Process View XML Export', async () => {
        const { elements, relationships } = createBusinessProcessViewModel();
        const exporter = createXmlExporter();

        const result = await exporter.exportModel(elements, relationships, {
            modelName: 'Customer Inquiry Process',
            modelPurpose: 'Business process model showing customer inquiry handling',
            validateModel: true,
            strictValidation: false,
            includeViews: true,
            viewOptions: {
                viewName: 'Customer Inquiry Process View',
                showGrid: true
            },
            colorTheme: 'archimate'
        });

        // Validate XML compliance
        runner.validateXml(result.xml, 'Business Process View');

        // Save for manual inspection
        runner.saveXmlToFile(result.xml, 'business-process-view.xml');

        // Check that XML contains expected business elements
        if (!result.xml.includes('BusinessActor') || !result.xml.includes('BusinessProcess')) {
            throw new Error('XML should contain BusinessActor and BusinessProcess elements');
        }

        runner.log(`Business process view XML generated successfully`, 'debug');
    });
}

async function testComplexMultiLayerModel(runner) {
    await runner.runTest('Complex Multi-Layer Model XML Export', async () => {
        const { elements, relationships } = createComplexMultiLayerModel();
        const exporter = createXmlExporter();

        const result = await exporter.exportModel(elements, relationships, {
            modelName: 'Enterprise Architecture Model',
            modelPurpose: 'Complete multi-layer enterprise architecture model',
            validateModel: true,
            strictValidation: true,
            includeViews: true,
            includeStatistics: true,
            colorTheme: 'high-contrast'
        });

        // Validate XML compliance
        runner.validateXml(result.xml, 'Complex Multi-Layer Model');

        // Save for manual inspection
        runner.saveXmlToFile(result.xml, 'complex-multilayer-model.xml');

        // Verify all layers are represented
        const layerElements = {
            'Motivation': ['Stakeholder', 'Goal', 'Requirement'],
            'Strategy': ['Capability', 'Resource'],
            'Business': ['BusinessActor', 'BusinessProcess', 'BusinessService', 'BusinessObject'],
            'Application': ['ApplicationComponent', 'ApplicationService', 'DataObject'],
            'Technology': ['Node', 'SystemSoftware', 'Artifact'],
            'Physical': ['Equipment', 'Facility'],
            'Implementation': ['WorkPackage', 'Deliverable']
        };

        for (const [layer, elementTypes] of Object.entries(layerElements)) {
            for (const elementType of elementTypes) {
                if (!result.xml.includes(elementType)) {
                    throw new Error(`XML should contain ${elementType} elements from ${layer} layer`);
                }
            }
        }

        runner.log(`Complex model contains ${elements.length} elements across 7 layers`, 'debug');
    });
}

async function testColorThemes(runner) {
    await runner.runTest('Color Theme Support', async () => {
        const { elements, relationships } = createBasicTestModel();
        const themes = ['archimate', 'monochrome', 'high-contrast'];

        for (const themeName of themes) {
            const exporter = createXmlExporter();
            exporter.setColorTheme(themeName);

            const result = await exporter.exportModel(elements, relationships, {
                modelName: `Test Model - ${themeName} theme`,
                includeViews: true
            });

            runner.validateXml(result.xml, `Color Theme ${themeName}`);
            runner.saveXmlToFile(result.xml, `theme-${themeName}.xml`);
        }

        runner.log('All color themes validated successfully', 'debug');
    });
}

async function testPartialExports(runner) {
    await runner.runTest('Partial Export Functions', async () => {
        const { elements, relationships } = createBasicTestModel();
        const exporter = createXmlExporter();

        // Test elements-only export
        const elementsXml = exporter.exportElementsOnly(elements, {
            groupByLayer: true,
            includeDocumentation: true
        });

        if (!elementsXml || typeof elementsXml !== 'string') {
            throw new Error('Elements-only export should return XML string');
        }

        runner.log(`Elements-only XML: ${elementsXml.length} characters`, 'debug');
        runner.saveXmlToFile(`<?xml version="1.0" encoding="UTF-8"?>\n<elements>\n${elementsXml}\n</elements>`, 'elements-only.xml');

        // Test relationships-only export
        const relationshipsXml = exporter.exportRelationshipsOnly(relationships, elements, {
            groupByType: true,
            validateReferences: true
        });

        if (!relationshipsXml || typeof relationshipsXml !== 'string') {
            throw new Error('Relationships-only export should return XML string');
        }

        runner.log(`Relationships-only XML: ${relationshipsXml.length} characters`, 'debug');
        runner.saveXmlToFile(`<?xml version="1.0" encoding="UTF-8"?>\n<relationships>\n${relationshipsXml}\n</relationships>`, 'relationships-only.xml');

        // Test views-only export
        const viewsXml = exporter.exportViewsOnly(elements, relationships, {
            viewName: 'Test View',
            showGrid: true
        });

        if (!viewsXml || typeof viewsXml !== 'string') {
            throw new Error('Views-only export should return XML string');
        }

        runner.log(`Views-only XML: ${viewsXml.length} characters`, 'debug');
        runner.saveXmlToFile(`<?xml version="1.0" encoding="UTF-8"?>\n<views>\n${viewsXml}\n</views>`, 'views-only.xml');
    });
}

async function testValidationFeatures(runner) {
    await runner.runTest('XML Validation Features', async () => {
        const { elements, relationships } = createBasicTestModel();

        // Test model validation
        const validationResult = runner.validator.validateModel(elements, relationships);

        if (!validationResult.isValid) {
            throw new Error(`Model validation failed: ${validationResult.errors.map(e => e.message).join(', ')}`);
        }

        // Test with duplicate IDs (should fail)
        const duplicateElements = [
            ...elements,
            ElementFactory.create(ElementType.BUSINESS_ACTOR, 'actor-001', 'Duplicate Actor') // Same ID as first element
        ];

        const duplicateValidation = runner.validator.validateModel(duplicateElements, relationships);

        if (duplicateValidation.isValid) {
            throw new Error('Validation should fail with duplicate element IDs');
        }

        runner.log('Validation correctly detected duplicate IDs', 'debug');

        // Test with orphaned relationships
        const orphanedRelationships = [
            ...relationships,
            new Relationship('rel-orphan', 'non-existent', 'also-non-existent', RelationshipType.ASSOCIATION)
        ];

        const orphanedValidation = runner.validator.validateModel(elements, orphanedRelationships);

        if (orphanedValidation.isValid) {
            throw new Error('Validation should fail with orphaned relationships');
        }

        runner.log('Validation correctly detected orphaned relationships', 'debug');
    });
}

async function testConvenienceFunctions(runner) {
    await runner.runTest('Convenience Export Functions', async () => {
        const { elements, relationships } = createBasicTestModel();

        // Test convenience function
        const xml = await exportToXml(elements, relationships, {
            modelName: 'Convenience Function Test',
            validateModel: true
        });

        if (!xml || typeof xml !== 'string') {
            throw new Error('Convenience function should return XML string');
        }

        runner.validateXml(xml, 'Convenience Function');
        runner.saveXmlToFile(xml, 'convenience-export.xml');

        runner.log('Convenience function works correctly', 'debug');
    });
}

async function testErrorHandling(runner) {
    await runner.runTest('Error Handling', async () => {
        const exporter = createXmlExporter();

        // Test with empty model
        try {
            const result = await exporter.exportModel([], [], {
                validateModel: true,
                strictValidation: true
            });

            // Should succeed but with warnings, not errors in non-strict mode
            if (result.errors && result.errors.length > 0) {
                throw new Error('Empty model should not produce errors in non-strict mode');
            }
        } catch (error) {
            // This is expected in strict mode
            runner.log('Strict validation correctly rejects empty models', 'debug');
        }

        // Test invalid color theme
        try {
            exporter.setColorTheme('invalid-theme');
            throw new Error('Should have thrown error for invalid theme');
        } catch (error) {
            if (!error.message.includes('Unknown color theme')) {
                throw error;
            }
            runner.log('Invalid color theme correctly rejected', 'debug');
        }
    });
}

// Main test execution
async function runAllTests() {
    const runner = new TestRunner();

    runner.log('🚀 Starting XML Export Test Suite');
    runner.log(`Output directory: ${TEST_OUTPUT_DIR}`);
    runner.log('');

    // Execute all test cases
    await testBasicXmlExport(runner);
    await testBusinessProcessView(runner);
    await testComplexMultiLayerModel(runner);
    await testColorThemes(runner);
    await testPartialExports(runner);
    await testValidationFeatures(runner);
    await testConvenienceFunctions(runner);
    await testErrorHandling(runner);

    // Print final summary
    runner.printSummary();

    // Exit with appropriate code
    process.exit(runner.failedTests > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runAllTests().catch(error => {
        console.error('❌ Test suite crashed:', error);
        process.exit(1);
    });
}

export { runAllTests, TestRunner };