export interface IDependentField {
    [fieldName: string]: number;
}

export interface IField {
    name: string;
    type: string;
    features: string[];
    dependentFields?: IDependentField; // Added dependentFields for multimodal
}

export interface IIndexForm {
    indexName: string; // Added indexName
    type: 'structured' | 'unstructured';
    model: string;
    modelInputType: 'select' | 'customName' | 'customJson'; // Added model input type selector
    modelPropertiesJson?: string; // Added for custom JSON model properties
    treatUrlsAndPointersAsImages?: boolean; // Added for image models to treat URLs as images
    allFields: IField[];
    tensorFields: {
        type: 'select' | 'custom';
        values: string[];
    };
    normalizeEmbeddings: boolean;
    textPreprocessing: {
        splitLength: number;
        splitOverlap: number;
        splitMethod: string;
    };
    imagePreprocessing: Record<string, never>;
    videoPreprocessing: {
        splitLength: number;
        splitOverlap: number;
    };
    audioPreprocessing: {
        splitLength: number;
        splitOverlap: number;
    };
    vectorNumericType: string;
    annParameters: {
        spaceType: string;
        parameters: {
            efConstruction: number;
            m: number;
        };
    };
}
