/* eslint-disable react-refresh/only-export-components */

export const toList = (value) => String(value || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export const toLines = (value) => String(value || "")
  .split("\n")
  .map((line) => line.replace(/^[-•]\s*/, "").trim())
  .filter(Boolean);

export const displayLink = (value) => String(value || "")
  .replace(/^https?:\/\//i, "")
  .replace(/\/$/, "");

export function ResumeSection({ title, children, className = "" }) {
  return (
    <section className={`mb-3 ${className}`}>
      <h2 className='mb-1 border-b border-black pb-0.5 text-[10pt] font-bold uppercase tracking-wide'>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function BulletList({ value }) {
  const lines = toLines(value);
  if (!lines.length) return null;

  return (
    <ul className='ml-4 list-disc pl-2 text-[9pt] leading-[1.3]'>
      {lines.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
    </ul>
  );
}

export function EditableBulletList({ value, editable, onChange }) {
  const lines = toLines(value);
  if (!lines.length && !editable) return null;

  return (
    <ul
      className={`ml-4 list-disc pl-2 text-[9pt] leading-[1.3] ${editable ? 'cursor-text rounded outline-none ring-[#b8dc00]/0 transition hover:ring-1 focus:ring-2' : ''}`}
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      onBlur={(event) => onChange?.(toLines(event.currentTarget.innerText).join('\n'))}
    >
      {lines.length
        ? lines.map((line, index) => <li key={`${line}-${index}`}>{line}</li>)
        : <li className='text-black/40'>Click to add a bullet point</li>}
    </ul>
  );
}
