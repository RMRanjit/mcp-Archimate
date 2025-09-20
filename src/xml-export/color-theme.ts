import { ElementType } from '../models/archimate.js';

export interface ColorMapping {
  fillColor: string;
  lineColor: string;
  textColor: string;
}

export class ColorTheme {
  private static readonly DEFAULT_COLORS: Record<string, ColorMapping> = {
    // Motivation Layer - Purple tones
    [ElementType.STAKEHOLDER]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.DRIVER]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.ASSESSMENT]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.GOAL]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.OUTCOME]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.PRINCIPLE]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.REQUIREMENT]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },
    [ElementType.CONSTRAINT]: { fillColor: '#E6D3FF', lineColor: '#8B66CC', textColor: '#000000' },

    // Strategy Layer - Light blue tones
    [ElementType.RESOURCE]: { fillColor: '#D1E7FF', lineColor: '#5B9BD5', textColor: '#000000' },
    [ElementType.CAPABILITY]: { fillColor: '#D1E7FF', lineColor: '#5B9BD5', textColor: '#000000' },
    [ElementType.VALUE_STREAM]: { fillColor: '#D1E7FF', lineColor: '#5B9BD5', textColor: '#000000' },
    [ElementType.COURSE_OF_ACTION]: { fillColor: '#D1E7FF', lineColor: '#5B9BD5', textColor: '#000000' },

    // Business Layer - Yellow tones
    [ElementType.BUSINESS_ACTOR]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_ROLE]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_COLLABORATION]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_INTERFACE]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_PROCESS]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_FUNCTION]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_INTERACTION]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_EVENT]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_SERVICE]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.BUSINESS_OBJECT]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.CONTRACT]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.REPRESENTATION]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },
    [ElementType.PRODUCT]: { fillColor: '#FFFACD', lineColor: '#FFD700', textColor: '#000000' },

    // Application Layer - Light green tones
    [ElementType.APPLICATION_COMPONENT]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_COLLABORATION]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_INTERFACE]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_FUNCTION]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_INTERACTION]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_PROCESS]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_EVENT]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.APPLICATION_SERVICE]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },
    [ElementType.DATA_OBJECT]: { fillColor: '#E6FFE6', lineColor: '#70AD47', textColor: '#000000' },

    // Technology Layer - Light orange tones
    [ElementType.NODE]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.DEVICE]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.SYSTEM_SOFTWARE]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_COLLABORATION]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_INTERFACE]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_FUNCTION]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_PROCESS]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_INTERACTION]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_EVENT]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.TECHNOLOGY_SERVICE]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.PATH]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.COMMUNICATION_NETWORK]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },
    [ElementType.ARTIFACT]: { fillColor: '#FFE6CC', lineColor: '#C5504B', textColor: '#000000' },

    // Physical Layer - Gray tones
    [ElementType.EQUIPMENT]: { fillColor: '#F2F2F2', lineColor: '#7F7F7F', textColor: '#000000' },
    [ElementType.FACILITY]: { fillColor: '#F2F2F2', lineColor: '#7F7F7F', textColor: '#000000' },
    [ElementType.DISTRIBUTION_NETWORK]: { fillColor: '#F2F2F2', lineColor: '#7F7F7F', textColor: '#000000' },
    [ElementType.MATERIAL]: { fillColor: '#F2F2F2', lineColor: '#7F7F7F', textColor: '#000000' },

    // Implementation & Migration Layer - Pink tones
    [ElementType.WORK_PACKAGE]: { fillColor: '#FFCCCB', lineColor: '#FF6B6B', textColor: '#000000' },
    [ElementType.DELIVERABLE]: { fillColor: '#FFCCCB', lineColor: '#FF6B6B', textColor: '#000000' },
    [ElementType.IMPLEMENTATION_EVENT]: { fillColor: '#FFCCCB', lineColor: '#FF6B6B', textColor: '#000000' },
    [ElementType.PLATEAU]: { fillColor: '#FFCCCB', lineColor: '#FF6B6B', textColor: '#000000' },
    [ElementType.GAP]: { fillColor: '#FFCCCB', lineColor: '#FF6B6B', textColor: '#000000' }
  };

  private colorMappings: Map<ElementType, ColorMapping>;

  constructor(customMappings?: Partial<Record<ElementType, ColorMapping>>) {
    this.colorMappings = new Map();

    // Load default colors
    for (const [elementType, colors] of Object.entries(ColorTheme.DEFAULT_COLORS)) {
      this.colorMappings.set(elementType as ElementType, colors);
    }

    // Apply custom overrides if provided
    if (customMappings) {
      for (const [elementType, colors] of Object.entries(customMappings)) {
        if (colors) {
          this.colorMappings.set(elementType as ElementType, colors);
        }
      }
    }
  }

  getColorsForElement(elementType: ElementType): ColorMapping {
    return this.colorMappings.get(elementType) || {
      fillColor: '#FFFFFF',
      lineColor: '#000000',
      textColor: '#000000'
    };
  }

  getFillColor(elementType: ElementType): string {
    return this.getColorsForElement(elementType).fillColor;
  }

  getLineColor(elementType: ElementType): string {
    return this.getColorsForElement(elementType).lineColor;
  }

  getTextColor(elementType: ElementType): string {
    return this.getColorsForElement(elementType).textColor;
  }

  setElementColors(elementType: ElementType, colors: ColorMapping): void {
    this.colorMappings.set(elementType, colors);
  }

  resetToDefaults(): void {
    this.colorMappings.clear();
    for (const [elementType, colors] of Object.entries(ColorTheme.DEFAULT_COLORS)) {
      this.colorMappings.set(elementType as ElementType, colors);
    }
  }

  static createArchiMateTheme(): ColorTheme {
    return new ColorTheme();
  }

  static createMonochromeTheme(): ColorTheme {
    const monochromeColors: ColorMapping = {
      fillColor: '#F5F5F5',
      lineColor: '#333333',
      textColor: '#000000'
    };

    const customMappings: Partial<Record<ElementType, ColorMapping>> = {};
    for (const elementType of Object.values(ElementType)) {
      customMappings[elementType] = monochromeColors;
    }

    return new ColorTheme(customMappings);
  }

  static createHighContrastTheme(): ColorTheme {
    const highContrastColors: ColorMapping = {
      fillColor: '#FFFFFF',
      lineColor: '#000000',
      textColor: '#000000'
    };

    const customMappings: Partial<Record<ElementType, ColorMapping>> = {};
    for (const elementType of Object.values(ElementType)) {
      customMappings[elementType] = highContrastColors;
    }

    return new ColorTheme(customMappings);
  }

  exportTheme(): Record<ElementType, ColorMapping> {
    const exported: Record<string, ColorMapping> = {};
    for (const [elementType, colors] of this.colorMappings.entries()) {
      exported[elementType] = { ...colors };
    }
    return exported as Record<ElementType, ColorMapping>;
  }

  importTheme(themeData: Record<ElementType, ColorMapping>): void {
    this.colorMappings.clear();
    for (const [elementType, colors] of Object.entries(themeData)) {
      this.colorMappings.set(elementType as ElementType, colors);
    }
  }
}