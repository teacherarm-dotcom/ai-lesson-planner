/**
 * Parse a Markdown table string into an array of objects
 */
export function parseMarkdownTable(markdown) {
  if (!markdown) return { headers: [], rows: [] };
  
  const cleaned = markdown.replace(/```markdown/g, '').replace(/```/g, '').trim();
  const lines = cleaned.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const sepIdx = lines.findIndex(line => line.startsWith('|') && line.includes('---'));

  if (sepIdx === -1 || sepIdx === 0) return { headers: [], rows: [] };

  const headerLine = lines[sepIdx - 1];
  const headers = headerLine.split('|').filter(c => c.trim() !== '').map(c => c.trim());
  const bodyLines = lines.slice(sepIdx + 1).filter(line => line.startsWith('|'));

  const rows = bodyLines.map(line =>
    line.split('|').filter((c, i, arr) => i !== 0 && i !== arr.length - 1).map(c => c ? c.trim() : '')
  );

  return { headers, rows };
}

/**
 * Parse the unit division table specifically
 */
export function parseUnitTable(markdown) {
  if (!markdown) return [];
  const { rows } = parseMarkdownTable(markdown);
  return rows.map(cells => ({
    no: cells[0] || '',
    name: cells[1] || '',
    topics: cells[2] || '',
    theory: cells[3] || '',
    practice: cells[4] || '',
    total: cells[5] || ''
  }));
}

/**
 * Convert Markdown table to HTML string (for export)
 */
export function convertMarkdownTableToHTML(markdown) {
  const { headers, rows } = parseMarkdownTable(markdown);
  if (headers.length === 0) return `<p>${markdown}</p>`;

  let html = `<table border="1" style="border-collapse: collapse; width: 100%;">`;
  html += `<thead style="background-color: #f2f2f2;"><tr>`;
  headers.forEach(h => html += `<th style="padding: 8px; text-align: left; border: 1px solid #ddd;">${h}</th>`);
  html += `</tr></thead><tbody>`;

  rows.forEach(row => {
    html += `<tr>`;
    row.forEach(cell => {
      const formatted = cell.replace(/<br>/g, '<br/>').replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');
      html += `<td style="padding: 8px; border: 1px solid #ddd; vertical-align: top;">${formatted}</td>`;
    });
    html += `</tr>`;
  });

  html += `</tbody></table>`;
  return html;
}

/**
 * Convert parsed unit data to HTML rows + totals
 */
export function convertUnitTableToHTML(unitData) {
  let totalTheory = 0, totalPractice = 0, totalAll = 0;
  let rowsHtml = '';

  unitData.forEach(unit => {
    const theory = parseInt(unit.theory) || 0;
    const practice = parseInt(unit.practice) || 0;
    const total = parseInt(unit.total) || 0;
    totalTheory += theory;
    totalPractice += practice;
    totalAll += total;

    const topics = unit.topics
      ? `<br/><span style="font-size:0.9em; color:#444;">${unit.topics.replace(/- /g, '• ').replace(/<br>/g, '<br/>')}</span>`
      : '';

    rowsHtml += `<tr>
      <td style="text-align: center; vertical-align: top;">${unit.no}</td>
      <td style="vertical-align: top;"><b>${unit.name}</b>${topics}</td>
      <td style="text-align: center; vertical-align: top;">${theory}</td>
      <td style="text-align: center; vertical-align: top;">${practice}</td>
      <td style="text-align: center; vertical-align: top;">${total}</td>
    </tr>`;
  });

  return { rowsHtml, totalTheory, totalPractice, totalAll };
}

/**
 * Clean JSON string and parse
 */
export function cleanAndParseJSON(str) {
  try {
    const cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('JSON Parse Error:', e);
    return null;
  }
}
