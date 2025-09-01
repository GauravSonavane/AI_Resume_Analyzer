import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/Components/Summary";
import ATS from "~/Components/ATS";
import Details from "~/Components/Details";

export const meta = () => [
    { title: "ResuMap | Review" },
    { name: "description", content: "Detailed overview of your resume" },
];

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams<{ id: string }>();
    const [imageUrl, setImageUrl] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [loadingResume, setLoadingResume] = useState(true);
    const navigate = useNavigate();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated && id) {
            navigate(`/auth?next=/resume/${id}`);
        }
    }, [isLoading, auth.isAuthenticated, id, navigate]);

    // Load resume data
    useEffect(() => {
        if (!id) return;

        const loadResume = async () => {
            setLoadingResume(true);
            try {
                const resumeDataStr = await kv.get(`resume:${id}`);
                if (!resumeDataStr) return;

                const data = JSON.parse(resumeDataStr);

                const resumeBlob = await fs.read(data.resumePath);
                if (!resumeBlob) return;
                const pdfUrl = URL.createObjectURL(new Blob([resumeBlob], { type: "application/pdf" }));
                setResumeUrl(pdfUrl);

                const imageBlob = await fs.read(data.imagePath);
                if (!imageBlob) return;
                const imgUrl = URL.createObjectURL(imageBlob);
                setImageUrl(imgUrl);

                setFeedback(data.feedback);
                console.log({ resumeUrl: pdfUrl, imageUrl: imgUrl, feedback: data.feedback });
            } catch (err) {
                console.error("Failed to load resume:", err);
            } finally {
                setLoadingResume(false);
            }
        };

        loadResume();
    }, [id, fs, kv]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons-01/icons/back.svg" alt="Back" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>

            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                {/* Left side: Resume preview */}
                <section className="feedback-section bg-[url('/images-01/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 flex items-center justify-center">
                    {loadingResume ? (
                        <div className="text-gray-400">Loading resume...</div>
                    ) : imageUrl && resumeUrl ? (
                        <div className="animate-in fade-in duration-1000 gradient-border max-w-xl h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    alt="Resume preview"
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="Resume Preview"
                                />
                            </a>
                        </div>
                    ) : (
                        <div className="text-gray-400">Resume not found.</div>
                    )}
                </section>

                {/* Right side: Feedback */}
                <section className="feedback-section flex-1 p-4">
                    <h2 className="text-4xl !text-black font-bold mb-6">Resume Review</h2>

                    {loadingResume ? (
                        <div className="text-gray-500">Loading feedback...</div>
                    ) : feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <Summary feedback={feedback} />
                            <ATS score={feedback.ATS.score || 0} suggestions={feedback.ATS.tips || []} />
                            <Details feedback={feedback} />
                        </div>
                    ) : (
                        <img src="/images-01/images/resume-scan-2.gif" alt="Resume scanning" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    );
};

export default Resume;
