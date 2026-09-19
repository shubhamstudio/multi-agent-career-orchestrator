import { displayLink, EditableBulletList, ResumeSection, toList } from './ResumeTemplateParts';
import EditableText from './EditableText';

function SplitHeaderTemplate({ data, editable = false, onChange }) {
  const skills = toList(data.skills);
  const update = (field) => (value) => onChange?.((current) => ({ ...current, [field]: value }));
  const updateEntry = (collection, index, field) => (value) => onChange?.((current) => ({
    ...current,
    [collection]: current[collection].map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry),
  }));

  return (
    <article className='box-border min-h-[11in] w-[8.5in] bg-white px-[0.42in] pb-[0.35in] pt-[0.28in] font-serif text-black print:w-[8.5in]'>
      <header className='mb-2 grid grid-cols-[1fr_auto] gap-4 border-b-[1.5px] border-black pb-1'>
        <div>
          <EditableText as='h1' value={data.name} placeholder='YOUR NAME' onChange={update('name')} editable={editable} className='m-0 text-[22pt] font-bold leading-none' />
          {(data.linkedin || data.github || editable) && <p className='mt-1 text-[8.5pt] text-blue-700'><EditableText value={displayLink(data.linkedin)} placeholder='linkedin.com/in/your-name' onChange={update('linkedin')} editable={editable} />{'  |  '}<EditableText value={displayLink(data.github)} placeholder='github.com/your-name' onChange={update('github')} editable={editable} /></p>}
        </div>
        {(data.email || data.phone || data.location || editable) && <div className='text-right text-[8.5pt] leading-[1.45]'><EditableText as='p' value={data.email} placeholder='email@example.com' onChange={update('email')} editable={editable} className='m-0' /><EditableText as='p' value={data.phone} placeholder='+91 00000 00000' onChange={update('phone')} editable={editable} className='m-0' /><EditableText as='p' value={data.location} placeholder='City, Country' onChange={update('location')} editable={editable} className='m-0' /></div>}
      </header>

      {(data.summary || editable) && <ResumeSection title='Professional Summary'><EditableText as='p' value={data.summary} placeholder='Click to add a professional summary.' onChange={update('summary')} editable={editable} className='text-[9pt] leading-[1.3]' /></ResumeSection>}

      {data.education?.length > 0 && (
        <ResumeSection title='Education'>
          {data.education.map((education, index) => (
            <div key={`${education.college}-${index}`} className='mb-1.5 break-inside-avoid'>
              <div className='flex justify-between gap-3 text-[9pt] font-bold text-blue-700'><EditableText as='span' value={education.college} onChange={updateEntry('education', index, 'college')} editable={editable} /><EditableText as='span' value={education.year} onChange={updateEntry('education', index, 'year')} editable={editable} /></div>
              <div className='flex justify-between gap-3 text-[8.5pt] italic'><span><EditableText value={education.degree} placeholder='Degree' onChange={updateEntry('education', index, 'degree')} editable={editable} />{(education.branch || editable) && <><span> — </span><EditableText value={education.branch} placeholder='Specialization' onChange={updateEntry('education', index, 'branch')} editable={editable} /></>}{(education.cgpa || editable) && <><span>   CGPA: </span><EditableText value={education.cgpa} placeholder='CGPA' onChange={updateEntry('education', index, 'cgpa')} editable={editable} /></>}</span></div>
            </div>
          ))}
        </ResumeSection>
      )}

      {data.experience?.length > 0 && (
        <ResumeSection title='Experience'>
          {data.experience.map((experience, index) => (
            <div key={`${experience.company}-${index}`} className='mb-2 break-inside-avoid'>
              <div className='flex justify-between gap-3 text-[9pt]'><EditableText as='strong' value={experience.company} onChange={updateEntry('experience', index, 'company')} editable={editable} className='text-blue-700' /><EditableText as='strong' value={experience.duration} onChange={updateEntry('experience', index, 'duration')} editable={editable} className='whitespace-nowrap' /></div>
              <EditableText as='p' value={experience.role} onChange={updateEntry('experience', index, 'role')} editable={editable} className='m-0 text-[8.5pt] italic' />
              <EditableBulletList value={experience.description} onChange={updateEntry('experience', index, 'description')} editable={editable} />
            </div>
          ))}
        </ResumeSection>
      )}

      {skills.length > 0 && (
        <ResumeSection title='Skills Summary'>
          <p className='text-[9pt] leading-[1.3]'><strong>Technical Skills:</strong> <EditableText value={skills.join(', ')} onChange={update('skills')} editable={editable} /></p>
        </ResumeSection>
      )}

      {data.projects?.length > 0 && (
        <ResumeSection title='Projects' className='mb-0'>
          {data.projects.map((project, index) => (
            <div key={`${project.name}-${index}`} className='mb-2 break-inside-avoid'>
              <div className='flex justify-between gap-3 text-[9pt]'><EditableText as='strong' value={project.name} onChange={updateEntry('projects', index, 'name')} editable={editable} />{(project.github || editable) && <EditableText as='span' value={displayLink(project.github)} placeholder='github.com/project' onChange={updateEntry('projects', index, 'github')} editable={editable} className='max-w-[40%] truncate text-right text-[8pt] text-blue-700' />}</div>
              {(project.techStack || editable) && <EditableText as='p' value={project.techStack} placeholder='Technology stack' onChange={updateEntry('projects', index, 'techStack')} editable={editable} className='m-0 text-[8.5pt] italic' />}
              <EditableBulletList value={project.description} onChange={updateEntry('projects', index, 'description')} editable={editable} />
            </div>
          ))}
        </ResumeSection>
      )}
    </article>
  );
}

export default SplitHeaderTemplate;
