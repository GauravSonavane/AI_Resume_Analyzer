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

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({
                                     companyName,
                                     jobTitle,
                                     jobDescription,
                                     file,
                                 }: { companyName: string; jobTitle: string; jobDescription: string; file: File }) => {
        try {
            setIsProcessing(true);
            setStatusText("Uploading the file...");

            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile?.path) return setStatusText("Error: Failed to upload file");

            setStatusText("Converting to image...");
            const imageFile = await convertPdfToImage(file);
            if (!imageFile?.file) return setStatusText("Error: Failed to convert PDF to image");

            setStatusText("Uploading the image...");
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage?.path) return setStatusText("Error: Failed to upload image");

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

            setStatusText("Analyzing...");
            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            if (!feedback) return setStatusText("Error: Failed to analyze resume");

            const feedbackText = typeof feedback.message.content === "string"
                ? feedback.message.content
                : feedback.message.content[0]?.text || "";

            try {
                data.feedback = JSON.parse(feedbackText);
            } catch {
                data.feedback = feedbackText;
            }

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText("Analysis complete, redirecting...");
            console.log(data);
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
        if (!file) return setStatusText("Please upload a resume before submitting.");

        const formData = new FormData(e.currentTarget);
        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images-01/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16 ">
                    <h1>Smart Feedback For Your Dream Job!</h1>

                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img
                                src="/images-01/images/resume-scan.gif"
                                alt="Resume scanning animation"
                                className="w-full"
                            />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {!isProcessing && (
                        <form
                            id="upload-form"
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4 mt-8"
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
                                className="primary-button"
                                type="submit"
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
