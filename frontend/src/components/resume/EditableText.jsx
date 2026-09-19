function EditableText({
  as: Element = 'span',
  value = '',
  onChange,
  editable = false,
  className = '',
  placeholder = '',
}) {
  const handleBlur = (event) => {
    if (!editable || !onChange) return;
    onChange(event.currentTarget.innerText.trim());
  };

  return (
    <Element
      className={`${className} ${editable ? 'cursor-text rounded outline-none ring-[#b8dc00]/0 transition hover:ring-1 focus:ring-2' : ''}`}
      contentEditable={editable}
      suppressContentEditableWarning={editable}
      onBlur={handleBlur}
    >
      {value || (editable ? placeholder : '')}
    </Element>
  );
}

export default EditableText;
