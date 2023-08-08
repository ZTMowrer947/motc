import { PieceType } from '@/features/piece/pieceAPI';

export interface AppRotateTestEntry {
  type: PieceType;
  zeta: string;
  rotations: number;
  altTestName?: string;
}

export interface AppLineClearTestEntry {
  zeta: string;
  testName: string;
  snapLabel: string;
}

export const appRotateTestData: AppRotateTestEntry[] = [
  {
    type: 'I',
    zeta: 'X/X/X/X/X/X/X/X/3AAAA3/X/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 I 0 - 3 OTSLJZZIOTLSJ',
    rotations: 4,
  },
  {
    type: 'O',
    zeta: 'X/X/X/X/X/X/X/X/4AA4/4AA4/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 O 0 - 3 TSLJZZIOTLSJI',
    rotations: 1,
    altTestName: 'should not change position of O-piece',
  },
  {
    type: 'T',
    zeta: 'X/X/X/X/X/X/X/X/5A4/4AAA3/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 T 0 - 3 SLJZZIOTLSJIO',
    rotations: 4,
  },
  {
    type: 'S',
    zeta: 'X/X/X/X/X/X/X/X/5AA3/4AA4/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 S 0 - 3 LJZZIOTLSJIOT',
    rotations: 4,
  },
  {
    type: 'L',
    zeta: 'X/X/X/X/X/X/X/X/6A3/4AAA3/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 L 0 - 3 JZZIOTLSJIOTS',
    rotations: 4,
  },
  {
    type: 'J',
    zeta: 'X/X/X/X/X/X/X/X/4A5/4AAA3/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 J 0 - 3 ZZIOTLSJIOTSL',
    rotations: 4,
  },
  {
    type: 'Z',
    zeta: 'X/X/X/X/X/X/X/X/4AA4/5AA3/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOO1 Z 0 - 3 ZIOTLSJIOTSL',
    rotations: 4,
  },
];

export const appLineClearTestData: AppLineClearTestEntry[] = [
  {
    zeta: 'X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/9A/9A/O2OOOO2A/OOOOOOOOOA I 0 - 3 OTSLJZZIOTLSJ',
    testName: 'should properly handle a single',
    snapLabel: 'Single',
  },
  {
    zeta: 'X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/9A/O2OOOO2A/OOOOOOOOOA/OOOOOOOOOA I 0 - 3 OTSLJZZIOTLSJ',
    testName: 'should properly handle a double',
    snapLabel: 'Double',
  },
  {
    zeta: 'X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/O2OOOO2A/OOOOOOOOOA/OOOOOOOOOA/OOOOOOOOOA I 0 - 3 OTSLJZZIOTLSJ',
    testName: 'should properly handle a triple',
    snapLabel: 'Triple',
  },
  {
    zeta: 'X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOOA/OOOOOOOOOA/OOOOOOOOOA/OOOOOOOOOA I 0 - 3 OTSLJZZIOTLSJ',
    testName: 'should properly handle a tetris',
    snapLabel: 'Tetris',
  },
  {
    zeta: 'X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/X/O2OOOO3/OOOOOOOOOA/1OOOOOOOOA/OOOOOOOOOA/OOOO1OOOOA I 0 - 3 OTSLJZZIOTLSJ',
    testName: 'should probably handle clearing two disjoint lines',
    snapLabel: 'DisjointDouble',
  },
];
