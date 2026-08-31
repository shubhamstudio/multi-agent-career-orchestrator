import { FiPlus, FiTrash2 } from 'react-icons/fi'

function Input({label, value, onChange, placeholder, type = "text"}){
    return(
        <div className='flex flex-col gap-1'>
            <label className='text-[10px] font-semibold text-black/70 uppercase tracking-wider'>
                {label}
            </label>
            <input 
            type={type}
            placeholder={placeholder}
            onChange={(e)=>onChange(e.target.value)}
            value={value}
            className='bg-white border-2 border-black/25 text-[#0A0A0A] text-xs rounded-lg px-2.5 py-2 outline-none focus:border-black/60 transition-colors placeholder-black/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
            />
        </div>
    )
}

function TextArea({label, value, onChange, placeholder, rows = 3}){
    return(
        <div className='flex flex-col gap-1'>
            <label className='text-[10px] font-semibold text-black/70 uppercase tracking-wider'>
                {label}
            </label>
            <textarea 
            placeholder={placeholder}
            onChange={(e)=>onChange(e.target.value)}
            value={value}
            rows={rows}
            className='bg-white border-2 border-black/25 text-[#0A0A0A] text-xs rounded-lg px-2.5 py-2 outline-none focus:border-black/60 transition-colors placeholder-black/30 resize-none shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
            />
        </div>
    )
}

function EntryCard({ children, onRemove }){
    return(
        <div className='relative overflow-hidden bg-[#F8F9FA] border-2 border-black/15 rounded-xl p-3 shadow-[0_2px_10px_rgba(0,0,0,0.05)]'>
            <button onClick={onRemove}
            className='absolute top-2.5 right-2.5 z-10 text-black/35 hover:text-red-500 transition-colors'>
            <FiTrash2 size={13}/>
            </button>
            <div className='relative flex flex-col gap-2.5 pr-6'>{children}</div>
        </div>
    )
}

function ResumeForm({step , data , setData}) {
  if(step === 1){
    return(
        <div className='grid gap-3 md:grid-cols-2 md:gap-4'>
            <Input label="Full Name" placeholder="Rahul Sharma" onChange={(v)=>setData({...data , name:v})} value={data.name}/>

            <Input label="Email" placeholder="rahul@email.com" onChange={(v) => setData({ ...data, email: v })} value={data.email}/>

            <Input label="Phone"  placeholder="+91 9876543210"  onChange={(v) => setData({ ...data, phone: v })} value={data.phone}   />

            <Input label="Location" placeholder="Jhansi, UP" onChange={(v) => setData({ ...data, location: v })} value={data.location} />

            <Input label="LinkedIn URL" placeholder="linkedin.com/in/rahul" onChange={(v) => setData({ ...data, linkedin: v })} value={data.linkedin} />

            <Input label="GitHub URL" placeholder="github.com/rahul" value={data.github}  onChange={(v) => setData({ ...data, github: v })}/>

        </div>
    )
  }
  if(step === 2){
    return(
        <div className='flex flex-col gap-3'>
            <TextArea 
            label="Professional Summary"
            placeholder="Backend Developer with 2+ years of experience building scalable Node.js and MongoDB applications..."
            rows={5}
            onChange={(v)=>setData({...data,summary:v})}
            value={data.summary}
            />

            <p className='text-[10px] text-black/40'>
            Leave empty to skip this section.
            </p>

        </div>
    )
   }


   if(step === 3){
    return(
        <div className='flex flex-col gap-3'>
            <TextArea 
            label="Skills (comma separated)"
            placeholder="JavaScript, TypeScript, React, Node.js, Express, MongoDB, Redis, Docker, AWS, Git"
            rows={4}
            onChange={(v)=>setData({...data,skills:v})}
            value={data.skills}
            />

            <p className='text-[10px] text-black/40'>
            Separate each skill with a comma.
            </p>

        </div>
    )
   }

   if(step === 4){
    const addExp = ()=>{
        setData({
            ...data , experience:[...data.experience , { company: "", role: "", duration: "", description: "" }]
        })
    }

    const removeExp = (index)=>{
        setData({
            ...data, experience: data.experience.filter((_,i)=> i!== index)
        })
    }

    const updateExp = (index, field, value)=>{
        const updated = data.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      );
      setData({ ...data, experience: updated });
    }
    return(
        <div className='flex flex-col gap-3'>

           {data.experience.length === 0 && (
           <p className='text-xs text-black/40 text-center py-3'>
            No experience added yet. Click below to add.
           </p>)}

           {data.experience.map((exp,index)=>(
            <EntryCard key={index} onRemove={()=>removeExp(index)}>
                <Input label="Company" placeholder="ABC Technologies" onChange={(v)=>updateExp(index,"company",v)} value={exp.company} />

                <Input label="Role" placeholder="Backend Developer" onChange={(v)=>updateExp(index,"role",v)} value={exp.role}/>

                <Input label="Duration" placeholder="Jan 2023 – Dec 2024" onChange={(v)=>updateExp(index,"duration",v)} value={exp.duration}/>

                <TextArea label="Description" placeholder={"• Built REST APIs\n• Improved performance by 40%"} onChange={(v)=>updateExp(index,"description",v)} value={exp.description}/>

            </EntryCard>
           ))}

           <button onClick={addExp} className='flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-black/20 rounded-xl text-xs text-black/45 hover:border-black/40 hover:text-[#0A0A0A] transition-all'>
           <FiPlus size={13} />Add Experience
           </button>



        </div>
    )
   }


   if(step === 5){
    const addPro = ()=>{
        setData({
            ...data , projects:[...data. projects , { name: "", techStack: "", github: "", description: "" }]
        })
    }

    const removePro = (index)=>{
        setData({
            ...data, projects: data.projects.filter((_,i)=> i!== index)
        })
    }

    const updatePro = (index, field, value)=>{
        const updated = data.projects.map((pro, i) =>
        i === index ? { ...pro, [field]: value } : pro
      );
      setData({ ...data, projects: updated });
    }
    return(
        <div className='flex flex-col gap-3'>

           {data.projects.length === 0 && (
           <p className='text-xs text-black/40 text-center py-3'>
            No project added yet. Click below to add.
           </p>)}

           {data.projects.map((pro,index)=>(
            <EntryCard key={index} onRemove={()=>removePro(index)}>
                <Input label="Project Name" placeholder="InterviewIQ" onChange={(v)=>updatePro(index,"name",v)} value={pro.name} />

                <Input label="Tech Stack"   value={pro.techStack} onChange={(v) => updatePro(index, "techStack", v)} placeholder="React, Node.js, MongoDB" />

                <Input label="GitHub Link"  value={pro.github}    onChange={(v) => updatePro(index, "github", v)}    placeholder="github.com/rahul/interviewiq" />

                <TextArea label="Description" value={pro.description} onChange={(v) => updatePro(index, "description", v)} placeholder="AI-powered interview preparation platform with mock interviews and resume builder." />

            </EntryCard>
           ))}

           <button onClick={addPro} className='flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-black/20 rounded-xl text-xs text-black/45 hover:border-black/40 hover:text-[#0A0A0A] transition-all'>
           <FiPlus size={13} />Add Project
           </button>



        </div>
    )
   }

    if(step === 6){
    const addEdu = ()=>{
        setData({
            ...data , education:[...data. education , { college: "", degree: "", branch: "", cgpa: "", year: "" }]
        })
    }

    const removeEdu = (index)=>{
        setData({
            ...data, education: data.education.filter((_,i)=> i!== index)
        })
    }

    const updateEdu = (index, field, value)=>{
        const updated = data.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      );
      setData({ ...data, education: updated });
    }
    return(
        <div className='flex flex-col gap-3'>

           {data.education.length === 0 && (
           <p className='text-xs text-black/40 text-center py-3'>
            No Education added yet. Click below to add.
           </p>)}

           {data.education.map((edu,index)=>(
            <EntryCard key={index} onRemove={()=>removeEdu(index)}>

                <Input label="College / University" value={edu.college} onChange={(v) => updateEdu(index, "college", v)} placeholder="SR Group of Institutions" />

                <Input label="Degree"  value={edu.degree} onChange={(v) => updateEdu(index, "degree", v)} placeholder="B.Tech" />

                <Input label="Branch"  value={edu.branch} onChange={(v) => updateEdu(index, "branch", v)} placeholder="Computer Science" />
                
                <Input label="CGPA"    value={edu.cgpa}   onChange={(v) => updateEdu(index, "cgpa", v)}   placeholder="8.5" />
                
                <Input label="Year"    value={edu.year}   onChange={(v) => updateEdu(index, "year", v)}   placeholder="2021 – 2025" />

            </EntryCard>
           ))}

           <button onClick={addEdu} className='flex items-center justify-center gap-1.5 w-full py-2.5 border border-dashed border-black/20 rounded-xl text-xs text-black/45 hover:border-black/40 hover:text-[#0A0A0A] transition-all'>
           <FiPlus size={13} />Add Education
           </button>



        </div>
    )
   }



}
export default ResumeForm
