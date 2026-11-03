import type { AssetDTO } from '../dtos/AssetDTO';

/**
 * Quy tắc khớp:
 *  - 'code': mã định danh (IT Asset Code, Hostname, Serial...) -> khớp TIỀN TỐ của cả chuỗi.
 *            "vn1" khớp VN1265, VN-14850 nhưng KHÔNG khớp VN2938.
 *  - 'text': văn bản tự do (Category, Product, Assigned To...) -> khớp TIỀN TỐ của BẤT KỲ TỪ nào.
 *            "lap" khớp "Laptop", "dell" khớp "Dell Vostro" nhưng "top" không khớp "Laptop".
 *
 * Mọi so sánh đều bỏ dấu tiếng Việt, không phân biệt hoa/thường và bỏ ký tự phân cách (-, _, khoảng trắng...).
 */
export type FieldKind = 'code' | 'text';

export type SearchableKey =
  | 'itAssetCode' | 'hostname' | 'financeAssetCode' | 'poInvoice' | 'serialNumber' | 'staffCode'
  | 'category' | 'product' | 'assignedTo' | 'department';

export interface SearchField {
  key: SearchableKey;
  kind: FieldKind;
}

const code = (key: SearchableKey): SearchField => ({ key, kind: 'code' });
const text = (key: SearchableKey): SearchField => ({ key, kind: 'text' });

/** Phạm vi tìm kiếm - nhãn chính là giá trị hiển thị trong ô chọn trường. */
export const SEARCH_SCOPES: Record<string, SearchField[]> = {
  'Tất cả': [
    code('itAssetCode'), code('hostname'), code('financeAssetCode'), code('poInvoice'),
    code('serialNumber'), code('staffCode'),
    text('category'), text('product'), text('assignedTo'), text('department'),
  ],
  'IT ASSET-CODE': [code('itAssetCode')],
  'Hostname': [code('hostname')],
  'Category': [text('category')],
  'Serial Number': [code('serialNumber')],
  'Staff Code': [code('staffCode')],
};

export const DEFAULT_SCOPE = 'Tất cả';

// ---------------------------------------------------------------------------
// Chuẩn hóa chuỗi
// ---------------------------------------------------------------------------

interface Folded {
  /** Chuỗi đã bỏ dấu, chữ thường, chỉ còn chữ/số */
  text: string;
  /** map[i] = vị trí của ký tự folded thứ i trong chuỗi gốc (dùng để tô sáng) */
  map: number[];
}

const ALNUM = /[\p{L}\p{N}]/u;

function foldChar(ch: string): string {
  return ch
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase();
}

function fold(value: string): Folded {
  let out = '';
  const map: number[] = [];
  for (let i = 0; i < value.length; i++) {
    for (const c of foldChar(value[i])) {
      if (ALNUM.test(c)) {
        out += c;
        map.push(i);
      }
    }
  }
  return { text: out, map };
}

function foldQuery(raw: string): string {
  return fold(raw).text;
}

function isWordStart(f: Folded, pos: number): boolean {
  if (pos === 0) return true;
  // Bắt đầu từ mới = giữa hai ký tự folded có ký tự phân cách trong chuỗi gốc
  return f.map[pos] !== f.map[pos - 1] && f.map[pos] - 1 !== f.map[pos - 1];
}

// Cache theo object tài sản: khi Create/Edit tạo object mới thì cache tự làm mới.
const foldCache = new WeakMap<AssetDTO, Partial<Record<SearchableKey, Folded>>>();

function getFolded(asset: AssetDTO, key: SearchableKey): Folded {
  let entry = foldCache.get(asset);
  if (!entry) {
    entry = {};
    foldCache.set(asset, entry);
  }
  return (entry[key] ??= fold(String(asset[key] ?? '')));
}

// ---------------------------------------------------------------------------
// Truy vấn
// ---------------------------------------------------------------------------

export interface ActiveSearch {
  /** Các từ khóa đã chuẩn hóa (tách theo khoảng trắng) */
  terms: string[];
  /** Toàn bộ truy vấn nối liền, để "vn 1" vẫn khớp mã "VN1265" */
  joined: string;
  fields: SearchField[];
}

export function createSearch(raw: string, scope: string = DEFAULT_SCOPE): ActiveSearch {
  const terms = raw.split(/\s+/).map(foldQuery).filter(Boolean);
  return {
    terms,
    joined: terms.join(''),
    fields: SEARCH_SCOPES[scope] ?? SEARCH_SCOPES[DEFAULT_SCOPE],
  };
}

export const isActive = (s: ActiveSearch): boolean => s.terms.length > 0;

/** Trả về khoảng [start, end) trong chuỗi gốc mà `term` khớp, hoặc null. */
function findRange(f: Folded, term: string, kind: FieldKind): [number, number] | null {
  if (!term || !f.text) return null;

  let pos = -1;
  if (kind === 'code') {
    if (f.text.startsWith(term)) pos = 0;
  } else {
    let from = 0;
    for (let idx = f.text.indexOf(term, from); idx !== -1; idx = f.text.indexOf(term, from)) {
      if (isWordStart(f, idx)) { pos = idx; break; }
      from = idx + 1;
    }
  }
  if (pos === -1) return null;
  return [f.map[pos], f.map[pos + term.length - 1] + 1];
}

export function matchAsset(asset: AssetDTO, s: ActiveSearch): boolean {
  if (!isActive(s)) return true;

  // Trường hợp gõ liền / gõ có cách ("vn1" hoặc "vn 1") khớp thẳng vào một mã
  if (s.fields.some(({ key, kind }) => kind === 'code' && findRange(getFolded(asset, key), s.joined, kind))) {
    return true;
  }

  // Ngược lại: MỌI từ khóa phải khớp ít nhất một trường (AND giữa các từ)
  return s.terms.every(term =>
    s.fields.some(({ key, kind }) => findRange(getFolded(asset, key), term, kind) !== null)
  );
}

export function filterAssets(assets: AssetDTO[], s: ActiveSearch): AssetDTO[] {
  return isActive(s) ? assets.filter(a => matchAsset(a, s)) : assets;
}