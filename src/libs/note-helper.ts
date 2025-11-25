/**
 * 餐點備註輔助函數
 * 用於處理單個字串或字串陣列的備註格式化
 */

/**
 * 將備註轉換為字串陣列
 */
export function noteToArray(note: string | string[] | undefined | null): string[] {
  if (!note) return [];
  if (Array.isArray(note)) return note.filter(n => n.trim() !== '');
  return note.split(/[,，、/]/).map(n => n.trim()).filter(n => n !== '');
}

/**
 * 將備註格式化為顯示用的字串
 */
export function formatNote(note: string | string[] | undefined | null): string {
  const noteArray = noteToArray(note);
  return noteArray.join('、');
}

/**
 * 合併兩個備註
 * 用於當同一餐點有不同備註時進行合併
 */
export function mergeNotes(note1: string | string[] | undefined | null, note2: string | string[] | undefined | null): string[] {
  const array1 = noteToArray(note1);
  const array2 = noteToArray(note2);
  
  // 使用 Set 去重
  const merged = new Set([...array1, ...array2]);
  return Array.from(merged);
}

/**
 * 比較兩個備註是否相同
 */
export function compareNotes(note1: string | string[] | undefined | null, note2: string | string[] | undefined | null): boolean {
  const array1 = noteToArray(note1);
  const array2 = noteToArray(note2);
  
  if (array1.length !== array2.length) return false;
  
  // 排序後比較
  const sorted1 = [...array1].sort();
  const sorted2 = [...array2].sort();
  
  return sorted1.every((value, index) => value === sorted2[index]);
}

/**
 * 將備註陣列轉換為儲存格式（字串）
 * 用於儲存到資料庫
 */
export function noteToString(note: string | string[] | undefined | null): string {
  return formatNote(note);
}
