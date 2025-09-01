import React, { type FormEvent, useState } from "react";
import Navbar from "~/Components/Navbar";
import FileUploader from "~/Components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "~/Constants";

const Upload = () => {
    const { fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null) => setFile(file);

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: {
        companyName: string;
        jobTitle: string;
        jobDescription: string;
        file: File;
    }) => {
        setIsProcessing(true);
        try {
            setStatusText("Uploading resume...");
            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile?.path) {
                setStatusText("Error: Failed to upload file");
                return;
            }

            setStatusText("Converting PDF to image...");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile?.file) {
                setStatusText("Error: Failed to convert PDF to image");
                return;
            }

            setStatusText("Uploading image...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage?.path) {
                setStatusText("Error: Failed to upload image");
                return;
            }

            setStatusText("Preparing data...");
            const uuid = generateUUID();
            const data: any = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback: "",
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText("Analyzing resume...");
            const feedbackResponse = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            if (!feedbackResponse) {
                setStatusText("Error: Failed to analyze resume");
                return;
            }

            const feedbackText =
                typeof feedbackResponse.message.content === "string"
                    ? feedbackResponse.message.content
                    : feedbackResponse.message.content[0]?.text || "";

            try {
                data.feedback = JSON.parse(feedbackText);
            } catch {
                data.feedback = feedbackText;
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText("Analysis complete, redirecting...");
            navigate(`/resume/${uuid}`);
        } catch (err) {
            console.error(err);
            setStatusText("Unexpected error occurred. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) {
            setStatusText("Please upload a resume before submitting.");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images-01/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />
            <section className="main-section py-16">
                <div className="page-heading text-center">
                    <h1 className="text-3xl font-bold mb-4">Smart Feedback For Your Dream Job!</h1>

                    {isProcessing ? (
                        <>
                            <h2 className="text-xl mb-4">{statusText}</h2>
                            <img
                                src="/images-01/images/resume-scan.gif"
                                alt="Resume scanning animation"
                                className="mx-auto w-64"
                            />
                        </>
                    ) : (
                        <h2 className="text-lg mb-4">Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {!isProcessing && (
                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8 max-w-xl mx-auto"
                        >
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input
                                    type="text"
                                    name="company-name"
                                    id="company-name"
                                    placeholder="Company Name"
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input
                                    type="text"
                                    name="job-title"
                                    id="job-title"
                                    placeholder="Job Title"
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea
                                    rows={5}
                                    name="job-description"
                                    id="job-description"
                                    placeholder="Job Description"
                                    required
                                />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button
                                type="submit"
                                className="primary-button mt-4"
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Analyze Resume"}
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;
