import { displayLink, EditableBulletList, ResumeSection, toList } from './ResumeTemplateParts';
import EditableText from './EditableText';

function ClassicCompactTemplate({ data, editable = false, onChange }) {
  const skills = toList(data.skills);
  const update = (field) => (value) => onChange?.((current) => ({ ...current, [field]: value }));
  const updateEntry = (collection, index, field) => (value) => onChange?.((current) => ({
    ...current,
    [collection]: current[collection].map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry),
  }));
  const contacts = [
    ['phone', data.phone], ['email', data.email], ['github', displayLink(data.github)], ['linkedin', displayLink(data.linkedin)],
  ].filter(([, value]) => value || editable);

  return (
    <article className='box-border min-h-[11in] w-[8.5in] bg-white px-[0.5in] pb-[0.35in] pt-[0.3in] font-serif text-black print:w-[8.5in]'>
      <header className='mb-2 text-center'>
        <EditableText as='h1' value={data.name} placeholder='YOUR NAME' onChange={update('name')} editable={editable} className='m-0 text-[23pt] font-bold tracking-wide' />
        {contacts.length > 0 && (
          <p className='mt-0.5 text-[8.5pt] leading-tight'>
            {contacts.map(([field, contact], index) => <span key={field}><EditableText value={contact} placeholder={field} onChange={update(field)} editable={editable} />{index < contacts.length - 1 ? '  |  ' : ''}</span>)}
          </p>
        )}
        {(data.location || editable) && <EditableText as='p' value={data.location} placeholder='Location' onChange={update('location')} editable={editable} className='m-0 text-[8.5pt]' />}
      </header>

      {(data.summary || editable) && <ResumeSection title='Professional Summary'><EditableText as='p' value={data.summary} placeholder='Click to add a professional summary.' onChange={update('summary')} editable={editable} className='text-[9pt] leading-[1.3]' /></ResumeSection>}

      {data.education?.length > 0 && (
        <ResumeSection title='Education'>
          {data.education.map((education, index) => (
            <div key={`${education.college}-${index}`} className='mb-1.5 break-inside-avoid'>
              <div className='flex justify-between gap-3 text-[9pt]'><EditableText as='strong' value={education.college} onChange={updateEntry('education', index, 'college')} editable={editable} /><EditableText as='strong' value={education.cgpa ? `CGPA: ${education.cgpa}` : ''} placeholder='CGPA' onChange={(value) => updateEntry('education', index, 'cgpa')(value.replace(/^CGPA:\s*/i, ''))} editable={editable} /></div>
              <div className='flex justify-between gap-3 text-[8.5pt] italic'><span><EditableText value={education.degree} placeholder='Degree' onChange={updateEntry('education', index, 'degree')} editable={editable} />{(education.branch || editable) && <><span> — </span><EditableText value={education.branch} placeholder='Specialization' onChange={updateEntry('education', index, 'branch')} editable={editable} /></>}</span><EditableText as='span' value={education.year} onChange={updateEntry('education', index, 'year')} editable={editable} className='whitespace-nowrap' /></div>
            </div>
          ))}
        </ResumeSection>
      )}

      {data.experience?.length > 0 && (
        <ResumeSection title='Experience'>
          {data.experience.map((experience, index) => (
            <div key={`${experience.company}-${index}`} className='mb-2 break-inside-avoid'>
              <div className='flex justify-between gap-3 text-[9pt]'><EditableText as='strong' value={experience.company} onChange={updateEntry('experience', index, 'company')} editable={editable} /><EditableText as='strong' value={experience.duration} onChange={updateEntry('experience', index, 'duration')} editable={editable} className='whitespace-nowrap' /></div>
              <EditableText as='p' value={experience.role} onChange={updateEntry('experience', index, 'role')} editable={editable} className='m-0 text-[8.5pt] italic' />
              <EditableBulletList value={experience.description} onChange={updateEntry('experience', index, 'description')} editable={editable} />
            </div>
          ))}
        </ResumeSection>
      )}

      {data.projects?.length > 0 && (
        <ResumeSection title='Projects'>
          {data.projects.map((project, index) => (
            <div key={`${project.name}-${index}`} className='mb-2 break-inside-avoid'>
              <div className='flex justify-between gap-3 text-[9pt]'><EditableText as='strong' value={project.name} onChange={updateEntry('projects', index, 'name')} editable={editable} /><EditableText as='span' value={displayLink(project.github)} onChange={updateEntry('projects', index, 'github')} editable={editable} className='max-w-[42%] truncate text-right text-[8pt]' /></div>
              {(project.techStack || editable) && <EditableText as='p' value={project.techStack} placeholder='Technology stack' onChange={updateEntry('projects', index, 'techStack')} editable={editable} className='m-0 text-[8.5pt] italic' />}
              <EditableBulletList value={project.description} onChange={updateEntry('projects', index, 'description')} editable={editable} />
            </div>
          ))}
        </ResumeSection>
      )}

      {skills.length > 0 && (
        <ResumeSection title='Technical Skills' className='mb-0'>
          <EditableText as='p' value={skills.join(', ')} onChange={update('skills')} editable={editable} className='text-[9pt] leading-[1.3]' />
        </ResumeSection>
      )}
    </article>
  );
}

export default ClassicCompactTemplate;
