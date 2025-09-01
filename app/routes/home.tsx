import type { Route } from "./+types/home";
import Navbar from "~/Components/Navbar";
import ResumeCard from "~/Components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
    return [
        { title: "ResuMap" },
        { name: "description", content: "Smart Feedback For Your Dream Job!" },
    ];
}

export default function Home() {
    const { auth, kv } = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (!auth.isAuthenticated && !loadingResumes) {
            navigate("/auth?next=/");
        }
    }, [auth.isAuthenticated, loadingResumes, navigate]);

    useEffect(() => {
        const loadResumes = async () => {
            setLoadingResumes(true);
            try {
                const kvItems = (await kv.list("resume:*", true)) as KVItem[];
                const parsedResumes = kvItems
                    .map((item) => {
                        try {
                            return JSON.parse(item.value) as Resume;
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean) as Resume[];

                setResumes(parsedResumes);
            } catch (err) {
                console.error("Failed to load resumes:", err);
            } finally {
                setLoadingResumes(false);
            }
        };

        loadResumes();
    }, [kv]);

    return (
        <main className="bg-[url('/images-01/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16 text-center">
                    <h1 className="text-3xl font-bold mb-4">Track Your Applications & Resume Ratings</h1>
                    {!loadingResumes && resumes.length === 0 ? (
                        <h2 className="text-lg mb-4">
                            No resumes found. Upload your first resume to get feedback.
                        </h2>
                    ) : (
                        <h2 className="text-lg mb-4">
                            Review your submissions and check AI-powered feedback.
                        </h2>
                    )}
                </div>

                {loadingResumes && (
                    <div className="flex flex-col items-center justify-center">
                        <img
                            src="/images-01/images/resume-scan-2.gif"
                            className="w-[200px]"
                            alt="Loading resumes"
                        />
                        <p>Loading your resumes...</p>
                    </div>
                )}

                {!loadingResumes && resumes.length > 0 && (
                    <div className="resumes-section flex flex-wrap gap-6 justify-center px-4">
                        {resumes.map((resume) => (
                            <ResumeCard key={resume.id} resume={resume} />
                        ))}
                    </div>
                )}

                {!loadingResumes && resumes.length === 0 && (
                    <div className="flex flex-col items-center justify-center mt-10 gap-4">
                        <Link
                            to="/upload"
                            className="primary-button w-fit text-xl font-semibold"
                        >
                            Upload Resume
                        </Link>
                    </div>
                )}
            </section>
        </main>
    );
}
