// Barcode Generator Helper (EAN-13 & CODE-39)

// 1) EAN-13 Parity Table
const EAN13_PARITY = [
    [0, 0, 0, 0, 0, 0], // 0: AAAAAA
    [0, 0, 1, 0, 1, 1], // 1: AABABB
    [0, 0, 1, 1, 0, 1], // 2: AABBAB
    [0, 0, 1, 1, 1, 0], // 3: AABBBA
    [0, 1, 0, 0, 1, 1], // 4: ABAABB
    [0, 1, 1, 0, 0, 1], // 5: ABBAAB
    [0, 1, 1, 1, 0, 0], // 6: ABBBAA
    [0, 1, 0, 1, 0, 1], // 7: ABABAB
    [0, 1, 0, 1, 1, 0], // 8: ABABBA
    [0, 1, 1, 0, 1, 0]  // 9: ABBABA
];

// Encodings A, B, C for EAN-13 digits
const EAN13_A = [
    "0001101", "0011001", "0010011", "0111101", "0100011",
    "0110001", "0101111", "0111011", "0110111", "0001011"
];

const EAN13_B = [
    "0100111", "0110011", "0011011", "0100001", "0011101",
    "0111001", "0000101", "0010001", "0001001", "0010111"
];

const EAN13_C = [
    "1110010", "1100110", "1101100", "1000010", "1011100",
    "1001100", "1010000", "1000100", "1001000", "1110100"
];

// 2) CODE-39 Table
const CODE39_MAP: Record<string, string> = {
    '0': '101001101101', '1': '110100101011', '2': '101100101011',
    '3': '110110010101', '4': '101001101011', '5': '110100110101',
    '6': '101100110101', '7': '101001011011', '8': '110100101101',
    '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
    'C': '110110100101', 'D': '101011001011', 'E': '110101100101',
    'F': '101101100101', 'G': '101010011011', 'H': '110101001101',
    'I': '101101001101', 'J': '101011001101', 'K': '110101010011',
    'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
    'O': '110101101001', 'P': '101101101001', 'Q': '101010110011',
    'R': '110101011001', 'S': '101101011001', 'T': '101011011001',
    'U': '110010101011', 'V': '100110101011', 'W': '110011010101',
    'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
    '-': '100101011011', '.': '110010101101', ' ': '100110101101',
    '*': '100101101101'
};

export interface BarcodeResult {
    type: 'EAN13' | 'CODE39';
    binary: string; // string of '1's and '0's
    valid: boolean;
}

/**
 * Encodes a numeric string into EAN-13 binary representation.
 */
function encodeEAN13(value: string): BarcodeResult {
    // Pad to 13 digits if shorter, or slice if longer
    let clean = value.replace(/\D/g, '');
    if (clean.length < 13) {
        clean = clean.padStart(13, '0');
    } else if (clean.length > 13) {
        clean = clean.slice(0, 13);
    }

    const firstDigit = parseInt(clean[0], 10);
    const parityPattern = EAN13_PARITY[firstDigit];

    let binary = "101"; // Left guard

    // Encode first 6 digits (digits 1 to 6)
    for (let i = 1; i <= 6; i++) {
        const digit = parseInt(clean[i], 10);
        const parity = parityPattern[i - 1];
        if (parity === 0) {
            binary += EAN13_A[digit];
        } else {
            binary += EAN13_B[digit];
        }
    }

    binary += "01010"; // Center guard

    // Encode last 6 digits (digits 7 to 12)
    for (let i = 7; i <= 12; i++) {
        const digit = parseInt(clean[i], 10);
        binary += EAN13_C[digit];
    }

    binary += "101"; // Right guard

    return { type: 'EAN13', binary, valid: true };
}

/**
 * Encodes an alphanumeric string into Code 39 binary representation.
 */
function encodeCode39(value: string): BarcodeResult {
    const uppercase = value.toUpperCase().trim();
    // Wrap in start/stop asterisk if not present
    const rawStr = uppercase.startsWith('*') && uppercase.endsWith('*') 
        ? uppercase 
        : `*${uppercase}*`;

    let binary = "";
    let valid = true;

    for (let i = 0; i < rawStr.length; i++) {
        const char = rawStr[i];
        const pattern = CODE39_MAP[char];
        if (pattern) {
            binary += pattern;
            // Add a narrow space separator between characters, except for the last one
            if (i < rawStr.length - 1) {
                binary += "0";
            }
        } else {
            valid = false;
        }
    }

    // If invalid characters, default to rendering barcode for asterisk only or fallback
    if (!valid) {
        return { type: 'CODE39', binary: CODE39_MAP['*'] + '0' + CODE39_MAP['*'], valid: false };
    }

    return { type: 'CODE39', binary, valid: true };
}

/**
 * Main entry function to generate binary barcode lines.
 */
export function getBarcodeBinary(value: string): BarcodeResult {
    const cleanNum = value.replace(/\D/g, '');
    
    // If it's 12 or 13 digits, EAN-13 is preferred
    if (cleanNum.length === 13 || (cleanNum.length === 12 && /^\d+$/.test(value))) {
        return encodeEAN13(value);
    }
    
    // Otherwise fallback to Code 39
    return encodeCode39(value);
}

/**
 * Returns raw HTML string of the SVG barcode for direct document writing (printing).
 */
export function renderBarcodeSvgHtml(value: string): string {
    if (!value) return '';
    const result = getBarcodeBinary(value);
    const binary = result.binary;
    const barCount = binary.length;
    
    let rects = '';
    const barWidth = 100 / barCount;
    
    for (let i = 0; i < binary.length; i++) {
        if (binary[i] === '1') {
            rects += `<rect x="${i * barWidth}%" y="0" width="${barWidth + 0.05}%" height="100%" fill="#000" />`;
        }
    }

    return `<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`;
}
