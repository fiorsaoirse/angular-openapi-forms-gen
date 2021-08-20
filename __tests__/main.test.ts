import path from 'path';
import { promises as fs } from 'fs';
import prettier from 'prettier';
import generate from '../src/main';
import SwaggerParser from '@apidevtools/swagger-parser';
import { OpenAPI, OpenAPIV3 } from 'openapi-types';

const SCHEMAS = ['schema.json'];
// const SCHEMAS = ['schema.json', 'schema.yml', 'swagger.json'];
const FIXTURES = path.join(__dirname, '__fixtures__');
// const NORMALIZED_FOLDER = path.join(FIXTURES, 'normalized');
// const FORMS_FOLDER = path.join(FIXTURES, 'forms');

const OPTIONS: SwaggerParser.Options = {
    dereference: {
        circular: true,
    },
    validate: {
        schema: true
    }
};

const isOpenApiV3Document = (api: OpenAPI.Document): api is OpenAPIV3.Document => {
    return !!(api as OpenAPIV3.Document).openapi;
};

describe('main function', () => {
    SCHEMAS.forEach((fileName: string) => {
        it(`build node for file: "${fileName}"`, async () => {
            try {
                const filePath = path.join(FIXTURES, fileName);
                const api = await SwaggerParser.validate(filePath, OPTIONS);

                if (!isOpenApiV3Document(api)) {
                    throw new Error('Current version of library supports only OpenApi versions 3.0 and above.');
                }

                const generatedFileContents = generate(api);

                console.log(generatedFileContents);

            } catch (error) {
                console.error(error);
                throw error;
            }
        })
    })
});