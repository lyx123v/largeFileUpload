import { stat } from 'fs/promises';

import { Mock } from 'vitest';

import { fsStorage } from '../../src/storages/fs';

vi.mock('fs/promises', () => ({
  stat: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  readdir: vi.fn(),
}));

describe('FilePieceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize correctly with valid parameters', async () => {
    (stat as Mock).mockResolvedValue({ isFile: vi.fn().mockReturnValue(true) });
    const res = await fsStorage.isFileExists('/foo/bar');

    expect(res).toBe(true);
  });
});
