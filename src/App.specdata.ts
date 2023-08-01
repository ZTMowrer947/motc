import { PieceType } from '@/features/piece/pieceAPI';

export interface AppRotateTestEntry {
  type: PieceType;
  zeta: string;
  rotations: number;
  altTestName?: string;
}

export const appRotateTestData: AppRotateTestEntry[] = [
  {
    type: 'I',
    zeta: 'X/X/X/X/X/X/X/X/3AAAA3/X/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 I 0 - 3 OTSLJZZIOTLSJ',
    rotations: 4,
  },
];
