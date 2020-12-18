import path from 'path';
import generateFiles from '../src/main';
import { promises as fs } from 'fs';
import camelcase from 'camelcase';

type TestData = {
  filepath: string;
  extraDescription?: string;
}

describe('Test creating Reactive Angular Form files from open-api descriptions', () => {
  const apiFiles: TestData[] = [];
  const fixturesPath = path.join(__dirname, '__fixtures__');
  const formsFilesDirPath = path.join(fixturesPath, 'forms');
  apiFiles.push({ filepath: path.join(fixturesPath, 'api.json') });
  apiFiles.push({ filepath: path.join(fixturesPath, 'api.yml') });
  let formsMap = new Map<string, string>();

  const readFileContent = async (fileName: string): Promise<string> => {
    const filePath = path.join(formsFilesDirPath, fileName);
    return await fs.readFile(filePath, {
      encoding: 'utf-8',
    });
  };

  beforeAll(async (done) => {
    const resultFiles = await fs.readdir(formsFilesDirPath);
    for (let fileName of resultFiles) {
      const { name, base } = path.parse(fileName);
      const fileContent = await readFileContent(base);
      formsMap.set(name, fileContent);
    }
    done();
  });

  apiFiles.forEach(({ filepath, extraDescription }) => {
    const { ext } = path.parse(filepath);
    it(`should generate forms from ${ext} open-api file. ${extraDescription}`, async () => {
      const models = await generateFiles(filepath);
      models.forEach(([file, fileName]) => {
        const expectedData = formsMap.get(camelcase(fileName));
        expect(file).toBe(expectedData);
      });
    })
  });
});

export {
  // https://github.com/Microsoft/TypeScript/issues/15230
};
