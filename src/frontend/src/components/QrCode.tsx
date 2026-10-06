import { useMemo } from "react";

/**
 * Dependency-free QR Code renderer (byte mode, ECC level M, versions 1-10).
 * Produces a crisp SVG so booking confirmations stay scannable without
 * pulling a runtime dependency into the bundle.
 */

// Data codewords for ECC level M (versions 1..10).
const DATA_CODEWORDS_M = [16, 28, 44, 64, 86, 108, 124, 154, 182, 216];
// ECC codewords per block for level M (versions 1..10).
const ECC_PER_BLOCK_M = [10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
// Number of error-correction blocks for level M (versions 1..10).
const BLOCKS_M = [1, 1, 1, 2, 2, 4, 4, 4, 5, 5];

const ALIGNMENT_POSITIONS: number[][] = [
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
];

function gfMul(a: number, b: number): number {
  let result = 0;
  let x = a;
  let y = b;
  while (y > 0) {
    if (y & 1) result ^= x;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
    y >>= 1;
  }
  return result;
}

function rsGenerator(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], 1);
      next[j + 1] ^= gfMul(poly[j], gfExp(i));
    }
    poly = next;
  }
  return poly;
}

const GF_EXP: number[] = (() => {
  const table = new Array<number>(512).fill(0);
  let value = 1;
  for (let i = 0; i < 255; i++) {
    table[i] = value;
    value <<= 1;
    if (value & 0x100) value ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) table[i] = table[i - 255];
  return table;
})();

function gfExp(power: number): number {
  return GF_EXP[power % 255];
}

function rsEncode(data: number[], eccCount: number): number[] {
  const gen = rsGenerator(eccCount);
  const result = new Array<number>(eccCount).fill(0);
  for (const byte of data) {
    const factor = byte ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < eccCount; i++) {
      result[i] ^= gfMul(gen[i + 1], factor);
    }
  }
  return result;
}

function toUtf8Bytes(text: string): number[] {
  const bytes: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x80) {
      bytes.push(code);
    } else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
      bytes.push(
        0xe0 | (code >> 12),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
    }
  }
  return bytes;
}

function pickVersion(byteLength: number): number {
  for (let version = 1; version <= 10; version++) {
    const capacityBits = DATA_CODEWORDS_M[version - 1] * 8;
    const lengthBits = version < 10 ? 8 : 16;
    if (4 + lengthBits + byteLength * 8 <= capacityBits) return version;
  }
  return 10;
}

function buildCodewords(bytes: number[], version: number): number[] {
  const dataCodewords = DATA_CODEWORDS_M[version - 1];
  const capacityBits = dataCodewords * 8;
  const lengthBits = version < 10 ? 8 : 16;

  const bits: number[] = [];
  const pushBits = (value: number, count: number) => {
    for (let i = count - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };

  pushBits(0b0100, 4); // byte mode
  pushBits(bytes.length, lengthBits);
  for (const byte of bytes) pushBits(byte, 8);

  const terminator = Math.min(4, capacityBits - bits.length);
  pushBits(0, terminator);
  while (bits.length % 8 !== 0) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }

  const padBytes = [0xec, 0x11];
  let padIndex = 0;
  while (data.length < dataCodewords) {
    data.push(padBytes[padIndex % 2]);
    padIndex++;
  }

  const blockCount = BLOCKS_M[version - 1];
  const eccPerBlock = ECC_PER_BLOCK_M[version - 1];
  const totalData = dataCodewords;
  const shortBlockLen = Math.floor(totalData / blockCount);
  const longBlockCount = totalData % blockCount;
  const shortBlockCount = blockCount - longBlockCount;

  const dataBlocks: number[][] = [];
  const eccBlocks: number[][] = [];
  let offset = 0;
  for (let b = 0; b < blockCount; b++) {
    const len = shortBlockLen + (b >= shortBlockCount ? 1 : 0);
    const block = data.slice(offset, offset + len);
    offset += len;
    dataBlocks.push(block);
    eccBlocks.push(rsEncode(block, eccPerBlock));
  }

  const result: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }
  for (let i = 0; i < eccPerBlock; i++) {
    for (const block of eccBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }
  return result;
}

function buildMatrix(codewords: number[], version: number): boolean[][] {
  const size = version * 4 + 17;
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );
  const reserved: boolean[][] = Array.from({ length: size }, () =>
    new Array<boolean>(size).fill(false),
  );

  const setFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= size || cc < 0 || cc >= size) continue;
        const inRing =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6));
        const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[rr][cc] = inRing || inCore;
        reserved[rr][cc] = true;
      }
    }
  };

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const value = i % 2 === 0;
    matrix[6][i] = value;
    reserved[6][i] = true;
    matrix[i][6] = value;
    reserved[i][6] = true;
  }

  // Alignment patterns
  const positions = ALIGNMENT_POSITIONS[version - 1];
  for (const row of positions) {
    for (const col of positions) {
      if (reserved[row][col]) continue;
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          const rr = row + r;
          const cc = col + c;
          const isDark =
            Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
          matrix[rr][cc] = isDark;
          reserved[rr][cc] = true;
        }
      }
    }
  }

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) reserved[8][i] = true;
    if (!reserved[i][8]) reserved[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }
  reserved[size - 8][8] = true;

  // Dark module
  matrix[size - 8][8] = true;

  // Place data bits in zigzag
  let bitIndex = 0;
  const totalBits = codewords.length * 8;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const row = upward ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const cc = col - c;
        if (reserved[row][cc]) continue;
        let dark = false;
        if (bitIndex < totalBits) {
          const byte = codewords[bitIndex >> 3];
          dark = ((byte >> (7 - (bitIndex & 7))) & 1) === 1;
          bitIndex++;
        }
        matrix[row][cc] = dark;
      }
    }
    upward = !upward;
  }

  // Format information (ECC level M = 0b00, mask 0)
  const formatBits = computeFormatBits(0b00, 0);
  const formatPositions: [number, number][] = [
    [8, 0],
    [8, 1],
    [8, 2],
    [8, 3],
    [8, 4],
    [8, 5],
    [8, 7],
    [8, 8],
    [7, 8],
    [5, 8],
    [4, 8],
    [3, 8],
    [2, 8],
    [1, 8],
    [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const dark = ((formatBits >> i) & 1) === 1;
    const [r, c] = formatPositions[i];
    matrix[r][c] = dark;
    if (i < 8) {
      matrix[size - 1 - i][8] = dark;
    } else {
      matrix[8][size - 15 + i] = dark;
    }
  }

  applyMask(matrix, reserved, size);
  return matrix;
}

function computeFormatBits(ecc: number, mask: number): number {
  const data = (ecc << 3) | mask;
  let value = data << 10;
  for (let i = 14; i >= 10; i--) {
    if ((value >> i) & 1) value ^= 0x537 << (i - 10);
  }
  return ((data << 10) | value) ^ 0x5412;
}

function applyMask(
  matrix: boolean[][],
  reserved: boolean[][],
  size: number,
): void {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (reserved[row][col]) continue;
      if ((row + col) % 2 === 0) {
        matrix[row][col] = !matrix[row][col];
      }
    }
  }
}

function generateMatrix(text: string): boolean[][] {
  const bytes = toUtf8Bytes(text);
  const version = pickVersion(bytes.length);
  const codewords = buildCodewords(bytes, version);
  return buildMatrix(codewords, version);
}

export function QrCode({
  value,
  size = 200,
  className,
  label,
}: {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const matrix = useMemo(() => generateMatrix(value), [value]);
  const moduleCount = matrix.length;
  const quiet = 4;
  const viewSize = moduleCount + quiet * 2;

  const path = useMemo(() => {
    let d = "";
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (matrix[row][col]) {
          d += `M${col + quiet} ${row + quiet}h1v1h-1z`;
        }
      }
    }
    return d;
  }, [matrix, moduleCount]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className={className}
      role="img"
      aria-label={label ?? value}
      shapeRendering="crispEdges"
    >
      <rect width={viewSize} height={viewSize} fill="#ffffff" />
      <path d={path} fill="#0b0f0d" />
    </svg>
  );
}
