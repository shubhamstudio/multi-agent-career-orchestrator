import Footer from "../components/Footer"
import { PublicNav } from "./About"

const content = {
    privacy: {
        eyebrow: "Privacy",
        title: "Privacy Policy",
        intro: "This policy explains the information Glangen uses to provide personalized career tools and how you can manage that information.",
        sections: [
            ["Information we process", "We may process account details, profile information, resumes you submit, interview responses, agent feedback, roadmap activity, and essential service diagnostics."],
            ["How information is used", "Information is used to authenticate your account, operate and personalize the agents, calculate progress, improve reliability, prevent abuse, and provide support."],
            ["AI processing", "Content submitted to AI-powered features may be processed by the model providers configured for the service. Avoid uploading information you do not want processed for these purposes."],
            ["Storage and security", "We use reasonable safeguards and retain information only as needed for the service, legal obligations, and legitimate operational purposes. No online system can guarantee absolute security."],
            ["Your choices", "You can update profile details within Glangen. You may contact the service operator to request access, correction, or deletion where applicable."],
            ["Changes", "We may update this policy as the platform evolves. Material changes should be communicated through the product or another appropriate channel."],
        ],
    },
    terms: {
        eyebrow: "Legal",
        title: "Terms of Service",
        intro: "These terms govern your use of Glangen and its AI-assisted career preparation features.",
        sections: [
            ["Using Glangen", "You must use the service lawfully, provide accurate account information, protect access to your account, and avoid disrupting or attempting to reverse engineer the platform."],
            ["Career guidance disclaimer", "Glangen provides preparation tools and informational AI output. It does not guarantee employment, interview outcomes, compensation, or the accuracy of every generated recommendation."],
            ["Your content", "You retain ownership of content you submit. You grant the service permission to process that content only as necessary to operate, secure, and improve the features you use."],
            ["Credits and paid features", "Some actions may consume platform credits. Pricing, included usage, and applicable payment terms are shown before purchase or use."],
            ["Availability", "Features may change, experience interruptions, or occasionally produce incomplete results. We may suspend access needed to protect users, the service, or comply with law."],
            ["Limitation", "To the extent permitted by law, Glangen is provided without guarantees beyond those expressly stated, and the operator is not liable for indirect losses arising from career decisions or use of AI output."],
        ],
    },
}

export default function Legal({ type }) {
    const page = content[type]
    return <div className="theme-page min-h-screen font-sans"><PublicNav /><main><section className="public-hero"><div className="mx-auto max-w-3xl"><p className="dashboard-eyebrow">{page.eyebrow}</p><h1 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">{page.title}</h1><p className="mt-5 text-base leading-7 text-[#68615c]">{page.intro}</p><p className="mt-3 text-xs text-black/40">Last updated: 26 August 2026</p></div></section><section className="public-section mx-auto max-w-3xl space-y-8">{page.sections.map(([title, body]) => <article key={title}><h2 className="text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-7 text-[#68615c]">{body}</p></article>)}</section></main><Footer /></div>
}
