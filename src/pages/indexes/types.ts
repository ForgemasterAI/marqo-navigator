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
